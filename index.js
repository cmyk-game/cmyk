var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var voxel = require('voxel')
var extend = require('extend')
var fly = require('voxel-fly')
var toolbar = require('toolbar')
var walk = require('voxel-walk')
var colorConverter = require('./lib/color-converter.js')

generator = {}
// j: vertical, k: horizontal.
generator['Floor'] = function(i,j,k) {
  return j == 0 ? 1 : 0;
}

module.exports = function(opts, setup) {
  setup = setup || defaultSetup
  var defaults = {
    generate: 
              generator['Floor'],
	      // voxel.generator['Valley'],
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

  // setup the game and add some trees
  var game = createGame(opts)
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
    // toolbarKeys: [1,2,3,4,5,6,7,8,9,0],
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
  var hl = game.highlighter = highlight(game, { color: 0xff0000 })
  hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
  hl.on('remove', function (voxelPos) { blockPosErase = null })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
  })

  // block interaction stuff, uses highlight data
  game.on('fire', function (target, state) {
    var position = blockPosPlace
    if (position) {
      game.createBlock(position, avatar.currentMaterial)
    }
    else {
      position = blockPosErase
      if (position) game.setBlock(position, 0)
    }
  })

  game.on('tick', function() {
    walk.render(target.playerSkin)
    var vx = Math.abs(target.velocity.x)
    var vz = Math.abs(target.velocity.z)
    if (vx > 0.001 || vz > 0.001) walk.stopWalking()
    else walk.startWalking()
  })

}
