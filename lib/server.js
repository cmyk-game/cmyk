// external dependencies
var crunch = require('voxel-crunch')
var extend = require('extend')
var EventEmitter = require('events').EventEmitter
// voxel depenencies
var voxelServer = require('voxel-server')
// local dependencies
var getDiagramChunk = require('./diagram.js')
var generateChunk = require('./generateChunk.js')

module.exports = Server

function Server(opts) {
  // force instantiation via `new` keyword 
  if(!(this instanceof Server)) { return new Server(opts) }
  this.initialize(opts)
}

//
// Public
//

Server.prototype.connectClient = function(duplexStream) {
  var self = this
  self.baseServer.connectClient(duplexStream)
  console.log(duplexStream.id, 'joined')
}

Server.prototype.removeClient = function(duplexStream) {
  var self = this
  self.baseServer.removeClient(duplexStream)
  console.log(duplexStream.id, 'left')
}

//
// Private
//

Server.prototype.initialize = function(opts) {
  var self = this

  // warm the cache
  readStorageIntoCache()

  // for debugging
  if ('undefined' !== typeof window) window.server = self

  var defaults = {
    generateChunks: false,
    chunkDistance: 1,
    // avatarInitialPosition: [0, 10, 0],
    // forwardEvents: ['spatialTrigger'],
  }
  var settings = self.settings = extend({}, defaults, opts)

  // create and initialize base game server
  var baseServer = self.baseServer = voxelServer(settings)
  self.game = baseServer.game
  
  // expose emitter methods on client
  extend(self,new EventEmitter())

  self.bindEvents()

}

Server.prototype.bindEvents = function() {
  var self = this
  var settings = self.settings
  var baseServer = self.baseServer
  var game = self.game

  // setup world CRUD handlers
  baseServer.on('missingChunk', loadChunk)
  baseServer.on('set', function(pos, val) {
    var chunk = game.getChunkAtPosition(pos)
    storeChunk(chunk)
  })  
  // trigger world load and emit 'ready' when done

  var loadedChunks = 0
  var expectedNumberOfInitialChunks = Math.pow(self.game.voxels.distance*2,3) // (2*2)^3=64 from [-2,-2,-2] --> [1,1,1]
  self.once('chunkLoaded',checkForChunkLoadComplete)
  function checkForChunkLoadComplete(chunk){
    loadedChunks++
    console.log('loaded chunk (',loadedChunks,'/',expectedNumberOfInitialChunks,')')
    if (loadedChunks === expectedNumberOfInitialChunks) {
      process.nextTick(function(){
        self.emit('ready')
      })
    } else {
      self.once('chunkLoaded',checkForChunkLoadComplete)
    }
  }
  game.voxels.requestMissingChunks(game.worldOrigin)

  // log chat
  baseServer.on('chat', function(message) {
    console.log('chat - ',message)
  })

  // handle errors
  baseServer.on('error',function(error){
    console.log('error - error caught in server:')
    console.log(error.stack)
  })

  // // store chunk in db
  // function storeChunk(chunk) {
  //   self.voxelDb.store(settings.worldId, chunk, function afterStore(err) {
  //     if (err) console.error('chunk store error', err.stack)
  //   })
  // }
  
  // // load chunk from db
  // function loadChunk(position, complete) {
  //   var game = self.game
  //   var cs = game.chunkSize
  //     , dimensions = [cs, cs, cs]
  //   self.voxelDb.load(settings.worldId, position, dimensions, function(err, chunk) {
  //     if (err) return console.error(err.stack)
  //     var chunk = {
  //       position: position,
  //       voxels: new Uint8Array(chunk.voxels.buffer),
  //       dims: chunk.dimensions
  //     }
  //     game.showChunk(chunk)
  //     // report this chunk load as complete
  //     self.emit('chunkLoaded',chunk)
  //   })
  // }

  // setup chunk loading
  function loadChunk(chunkPos) {
    var chunk = useCacheOrGenerateChunk(chunkPos);
    // var n = chunk.voxels.length;
    // for(var i = 0; i < n; i += 1) {
    //     if(!game.controls.target().isVisible(chunk.voxels[i])) chunk.voxels[i] = 0;
    // }
    game.showChunk(chunk)
    // report this chunk load as complete
    self.emit('chunkLoaded',chunk)    
  }

}

//
// World Persistence
//

var chunkCache = {}

// update chunk store for a specified chunk position [x,y,z] or if unspecified, all chunks
function updateChunkStore(game,chunkPos) {
  var chunks = game.voxels.chunks
  var chunkKeys = chunkPos ? [chunkPos.join('|')] : Object.keys(chunks)
  chunkKeys.map(function(chunkKey) {
    var chunk = chunks[chunkKey]
    chunkCache[chunkKey] = chunk
    var encoded = crunch.encode(chunk.voxels)
    var serialized = JSON.stringify(encoded)
    window.localStorage.setItem('chunk:'+chunkKey,serialized)
    console.log('saved chunk at',chunkPos)
  })
}

function readStorageIntoCache() {
  // all stored keys that start with 'chunk:'
  var savedChunkKeys = Object.keys(window.localStorage).filter(function(storageKey){
    return (-1 !== storageKey.indexOf('chunk:'))
  })
  savedChunkKeys.map(function(storageKey) {
    var serialized = window.localStorage.getItem(storageKey)
    var chunkKey = storageKey.slice('chunk:'.length)
    var chunkPos = chunkKey.split('|')
    // grab chunk from localStorage
    if (serialized) {
      var deserialized = JSON.parse(serialized)
      deserialized.length = Object.keys(deserialized).length
      var data = new Uint8Array(deserialized)
      var decoded = crunch.decode(data,new Uint8Array(100024)) // i made this number up
      chunkCache[chunkKey] = { voxels: decoded, dims: [32,32,32], position: chunkPos }
      console.log('loaded chunk at',chunkPos)
    }
  })
}

function useCacheOrGenerateChunk(chunkPos) {
  var chunkKey = chunkPos.join('|')
  // grab chunk from cache
  var chunk = chunkCache[chunkKey]
  if (chunk) {
    console.log('loaded chunk from cache',chunkPos)
    return chunk
  // if not in cache generate floor
  } else {
    // return generateChunk(chunkPos, visibleGeneratorFilter(generateFill))
    // return getDiagramChunk(chunkPos) || generateChunk(chunkPos, generateFill)
    return generateChunk(chunkPos, generateFill)
  }
}

function generateFloor(x,y,z) {
  return y == 0 ? 1 : 0;
}

function generateFill(x,y,z) {
  return 1;
}

