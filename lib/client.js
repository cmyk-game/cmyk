var DuplexEmitter = require('duplex-emitter')
var Game = require('voxel-engine')
var player = require('voxel-player')
var walk = require('voxel-walk')
var fly = require('voxel-fly')
var skin = require('minecraft-skin')
var diagram = require('./diagram.js')
var generateChunk = require('./generateChunk.js')
var Behaviors = require('./behaviors.js')
var enableParticles = require('./particles.js')
var positional_listener = require('./positional_listener.js')
var game_audio = require("./audio.js")
var choosePlayer = require('./choosePlayer.js')
var colorConverter = require('./color-converter.js')

module.exports = Client


function Client(opts) {
  // force instantiation via `new` keyword 
  if(!(this instanceof Client)) { return new Client(opts) }
  this.initialize(opts)
}

Client.prototype.initialize = function(opts) {
  var self = this
  self.remoteClients = {}
  self.lerpPercent = 0.1
  self.playerTexture = 'player.png'
}

Client.prototype.connect = function(duplexStream) {
  var self = this
  self.connection = DuplexEmitter(duplexStream)
  self._bindEvents()
}

Client.prototype._bindEvents = function() {
  var self = this
  var connection = self.connection
  // get client id
  connection.on('id',function(id){
    self.id = id
    connection.emit('got id',id)
  })
  // get game settings
  connection.on('settings',function(settings){
    console.log('SETTINGS',settings)
    self._createGame(settings)
    connection.emit('created')
  })
  // handle server updates
  // delay is because three.js seems to throw errors if you add stuff too soon
  setTimeout(function() {
    connection.on('update', self._handleServerUpdate.bind(self))
  }, 1000)
}

// process update from the server, mostly avatar info (position, rotation, etc.)
Client.prototype._handleServerUpdate = function(updates) {      
  var self = this
  Object.keys(updates.positions).map(function(player) {
    var update = updates.positions[player]
    // skip for local player
    if (player !== self.id) {
      self.updatePlayerPosition(player, update)
    }
  })
}

Client.prototype.updatePlayerPosition = function(id, update) {
  var self = this
  var pos = update.position
  var player = self.remoteClients[id]
  if (!player) {
    var playerSkin = skin(self.game.THREE, self.playerTexture, {
      scale: new self.game.THREE.Vector3(0.04, 0.04, 0.04)
    })
    var playerMesh = playerSkin.mesh
    self.remoteClients[id] = playerSkin
    playerMesh.children[0].position.y = 10
    self.game.scene.add(playerMesh)
    console.log('new player joined!')
  }
  var playerSkin = self.remoteClients[id]
  var playerMesh = playerSkin.mesh
  playerMesh.position.copy(playerMesh.position.lerp(pos, self.lerpPercent))
  playerMesh.children[0].rotation.y = update.rotation.y + (Math.PI / 2)
  playerSkin.head.rotation.z = scale(update.rotation.x, -1.5, 1.5, -0.75, 0.75)
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}

Client.prototype._createGame = function(settings) {
  var self = this
  self.settings = settings
  var connection = self.connection
  var game = self.game = Game(settings)
  // setup chunk loading
  game.voxels.on('missingChunk', function(chunkPos) {
    // grab chunk from cache
    var chunk = useCacheOrGenerateChunk(chunkPos)
    // filter out invisible chunks
    var n = chunk.voxels.length;
    for(var i = 0; i < n; i += 1) {
        if(!game.controls.target().isVisible(chunk.voxels[i])) chunk.voxels[i] = 0;
    }
    // show chunk
    game.showChunk(chunk)
  })
  // send player state to server, mostly avatar info (position, rotation, etc.)
  self.game.controls.on('data', function(state) {
    var interacting = false
    Object.keys(state).map(function(control) {
      if (state[control] > 0) interacting = true
    })
    if (interacting) sendState()
  })
  function sendState() {
    var player = self.game.controls.target()
    var state = {
      position: player.yaw.position,
      rotation: {
        y: player.yaw.rotation.y,
        x: player.pitch.rotation.x
      }
    }
    connection.emit('state', state)
  }
  // enable particle effects
  enableParticles(game)
  // create player avatar
  var createPlayer = player(game)
  var avatar = self.avatar = createPlayer('player.png')
  avatar.possess()
  avatar.yaw.position.set(2, 2, 4)
  // configure block visiblility
  avatar.isVisible = function(material) {
      return material != this.seeThroughMaterial;
  }
  avatar.isGod = function() {
      return avatar.seeThroughMaterial <= 0;
  }
  if(avatar.isGod()) {
      addGodPowers(game, avatar);
  }
  game.emit('init', avatar)

  positional_listener(game,connection)
  Behaviors(game)
  new game_audio(game)
  
  game.on('tick', function() {
    walk.render(avatar.playerSkin)
    var vx = Math.abs(avatar.velocity.x)
    var vz = Math.abs(avatar.velocity.z)
    if (vx > 0.001 || vz > 0.001) {
      walk.stopWalking()
      game.emit('stopWalking')
    } else {
      walk.startWalking()
      game.emit('startWalking')
    }
  })

  game.on('setBlock', function(pos, val, old) {
    // detect when a block is destroyed
    if(old > 0 && val == 0) {
      game.emit("blockDestroyed", pos, val);
    }
  })

  // choose a player color
  var playerColors = [
    // materials start at index 1 (since 0 is empty space)
    colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
    colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
    colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
  ]
  choosePlayer(playerColors,function(chosenColorIndex){
    avatar.seeThroughMaterial = chosenColorIndex;
    // start game
    game.voxels.requestMissingChunks(game.worldOrigin)
    game.appendTo(document.body)
  })
}

// god powers
function addGodPowers(game, avatar) {
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
  

  // flying capabilities
  var makeFly = fly(game)
  game.flyer = makeFly(avatar)

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

}

// chunk caching, loading, and generation

var chunkCache = {}
function useCacheOrGenerateChunk(chunkPos) {
  var chunkKey = chunkPos.join('|')
  // grab chunk from cache
  var chunk = chunkCache[chunkKey]
  if (chunk) {
    console.log('loaded chunk from cache',chunkPos)
    return chunk
  // if not in cache generate floor
  } else {
    var chunk = diagram.getChunk(chunkPos) || generateChunk(chunkPos, generateFill)
    chunkCache[chunkKey] = chunk
    return chunk
  }
}

function generateFill(x,y,z) {
  return 1;
}

