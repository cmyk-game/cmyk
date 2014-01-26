var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var voxel = require('voxel')
var extend = require('extend')
var fly = require('voxel-fly')
var toolbar = require('toolbar')
var walk = require('voxel-walk')
var crunch = require('voxel-crunch')
var getDiagramChunk = require('./lib/diagram.js')
var generateChunk = require('./lib/generateChunk.js')
var positional_listener = require("./positional_listener.js")
var Behaviors

module.exports = function(opts, setup) {
  setup = setup || defaultSetup
  var defaults = {
    generateChunks: false,
    chunkDistance: 1,
    materialFlatColor: true,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true }
  }
  opts = extend({}, defaults, opts || {})

  // load chunks from storage
  readStorageIntoCache()

  // setup the game and add some trees
  var game = createGame(opts)
  Behaviors = require("./behaviors.js")(game)

  // setup chunk loading
  game.voxels.on('missingChunk', function(chunkPos) {
    var chunk = useCacheOrGenerateChunk(chunkPos);
    var n = chunk.voxels.length;
    for(var i = 0; i < n; i += 1) {
        if(!game.controls.target().isVisible(chunk.voxels[i])) chunk.voxels[i] = 0;
    }
    game.showChunk(chunk)
  })

  // start game
  var container = opts.container || document.body
  window.game = game // for debugging
  game.appendTo(container)
  if (game.notCapable()) return game
  
  var createPlayer = player(game)

  // create the player from a minecraft skin file and tell the
  // game to use it as the main player
  var avatar = createPlayer(opts.playerSkin || 'player.png')
  avatar.possess()
  avatar.yaw.position.set(2, 14, 4)

  avatar.seeThroughMaterial = opts.seeThroughMaterial;
  avatar.isVisible = function(material) {
      return material != this.seeThroughMaterial;
  }

  game.voxels.requestMissingChunks(game.worldOrigin)
  setup(game, avatar)

  // block materials
  var toolbarElement = document.createElement('div')
  toolbarElement.id = 'blocks'
  toolbarElement.className = 'bar-tab'
  document.body.appendChild(toolbarElement)
  var blockSelector = toolbar({
    el: '#blocks',
  })
  blockSelector.setContent(game.materialNames.map(function(mat,id){
    if (Array.isArray(mat)) mat = mat[0]
    return {
      id: id+1,
      //icon: 'textures/'+mat+'.png',
      label: mat,
    }
  }))
  blockSelector.on('select',function(selection){
    avatar.currentMaterial = Number(selection)
  })
  blockSelector.switchToolbar(0)
  
  return game
}

function defaultSetup(game, avatar) {

  positional_listener(game)
  
  var makeFly = fly(game)
  var target = game.controls.target()
  game.flyer = makeFly(target)
  
  // highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, { color: 0xff0000, adjacentActive: function() {
      return game.controls.state.alt || game.controls.state.firealt
    },
  })

  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
  })

  // block interaction stuff, uses highlight data
  game.on('fire', function (target, state) {
    var isAltFire = Boolean(game.controls.state.alt || game.controls.state.firealt)
    game.highlighter.highlight()
    var position = isAltFire ? game.highlighter.currVoxelAdj : game.highlighter.currVoxelPos
    if (!position) return
    if (isAltFire) {
      // place
      game.createBlock(position, avatar.currentMaterial)
    } else {
      // erase
      if (position) game.setBlock(position, 0)
    }
    // save changes
    var chunkPos = game.voxels.chunkAtPosition(position)
    updateChunkStore(game,chunkPos)
  })

  game.on('tick', function() {
    walk.render(target.playerSkin)
    var vx = Math.abs(target.velocity.x)
    var vz = Math.abs(target.velocity.z)
    if (vx > 0.001 || vz > 0.001) walk.stopWalking()
    else walk.startWalking()
  })

  game.on('setBlock', function(pos, val, old) {
      if(!target.isVisible(val)) {
          game.setBlock(pos, 0)
      }
  })

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
      var decoded = crunch.decode(data,new Uint8Array(100024))
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
    return getDiagramChunk(chunkPos) || generateChunk(chunkPos, generateFill)
  }
}

function generateFloor(x,y,z) {
  return y == 0 ? 1 : 0;
}

function generateFill(x,y,z) {
  return 1;
}

