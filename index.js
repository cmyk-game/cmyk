var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var voxel = require('voxel')
var extend = require('extend')
var fly = require('voxel-fly')
var toolbar = require('toolbar')
var walk = require('voxel-walk')
var colorConverter = require('./lib/color-converter.js')
var crunch = require('voxel-crunch')

var MY_MATERIAL = 2;

function isVisible(material) {
    return material != MY_MATERIAL;
}

module.exports = function(opts, setup) {
  setup = setup || defaultSetup
  var defaults = {
    generateChunks: false,
    chunkDistance: 2,
    materials: [
      colorConverter.from_cmyk({ c: 000, m: 000, y: 000, k: 075 }).hex(),
      colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
      colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
      colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
      colorConverter.from_cmyk({ c: 100, m: 100, y: 000, k: 000 }).hex(),
      colorConverter.from_cmyk({ c: 000, m: 100, y: 100, k: 000 }).hex(),
      colorConverter.from_cmyk({ c: 100, m: 000, y: 100, k: 000 }).hex(),
    ],
    materialFlatColor: true,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true }
  }
  opts = extend({}, defaults, opts || {})

  // load chunks from storage
  readStorageIntoCache()

  // setup the game and add some trees
  var game = createGame(opts)

  // setup chunk loading
  game.voxels.on('missingChunk', function(chunkPos) {
    var chunk = useCacheOrGenerateChunk(chunkPos)
    game.showChunk(chunk)
  })
  game.voxels.requestMissingChunks(game.worldOrigin)

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
      if(!isVisible(val)) {
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
    return generateChunk(chunkPos, visibleGeneratorFilter(generateFill))
  }
}

function generateFloor(x,y,z) {
  return y == 0 ? 1 : 0;
}

function generateFill(x,y,z) {
  return 1;
}

function visibleGeneratorFilter(originalGenerator) {
    return function(x, y, z) {
        var origValue = originalGenerator(x, y, z);
        if(isVisible(origValue)) {
            return origValue;
        } else {
            return 0;
        }
    }
}

function generateChunk(chunkPos, generator, game) {
  console.log('generating chunk',chunkPos)
  var chunkSize = 32
  var l = [chunkPos[0]*chunkSize,chunkPos[1]*chunkSize,chunkPos[2]*chunkSize]
  var h = [(chunkPos[0]+1)*chunkSize,(chunkPos[1]+1)*chunkSize,(chunkPos[2]+1)*chunkSize]
  var d = [ h[0]-l[0], h[1]-l[1], h[2]-l[2] ]
  var v = new Int8Array(d[0]*d[1]*d[2])
  var n = 0
  for(var k=l[2]; k<h[2]; ++k)
  for(var j=l[1]; j<h[1]; ++j)
  for(var i=l[0]; i<h[0]; ++i, ++n) {
    v[n] = generator(i,j,k,n,game)
  }
  return {voxels:v, dims:d, position: chunkPos}
}
