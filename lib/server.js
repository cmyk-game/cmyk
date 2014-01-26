var DuplexEmitter = require('duplex-emitter')
var Uuid = require('hat')
var THREE = require('three')

module.exports = Server


function Server(opts) {
  // force instantiation via `new` keyword 
  if(!(this instanceof Server)) { return new Server(opts) }
  this.initialize(opts)
}

Server.prototype.initialize = function(opts) {
  var self = this
  self.clientSettings = opts
  self.clients = {}
  // send updates to players
  setInterval(function() {
    self.sendUpdate()
  }, 1000/11) // every 45ms
  // }, 1000/22) // every 45ms
  self.forwardEvents = ['positional']
}

Server.prototype.connect = function(duplexStream) {
  var self = this
  var id = Uuid()
  var connection = DuplexEmitter(duplexStream)
  var newClient = self.clients[id] = {
    id: id,
    connection: connection,
    player: {
      rotation: new THREE.Vector3(),
      position: new THREE.Vector3(),
    },
  }
  self._bindEvents(newClient)
  self._configureClient(newClient)
  // tell other players about the join
  self.broadcast(id, 'join', id)
}

Server.prototype._bindEvents = function(client) {
  var self = this
  var connection = client.connection
  // after id, send game settings
  connection.on('got id',function(){
    connection.emit('settings',self.clientSettings)
  })
  // after game created, send world data
  connection.on('created',function(){
    // self._sendWorld(client)
  })
  // client sends new position, rotation
  connection.on('state', function(state) {
    client.player.rotation.x = state.rotation.x
    client.player.rotation.y = state.rotation.y
    var pos = client.player.position
    var distance = pos.distanceTo(state.position)
    if (distance > 20) {
      var before = pos.clone()
      pos.lerp(state.position, 0.1)
      return
    }
    pos.copy(state.position)
  })
  // forward custom events
  self.forwardEvents.map(function(eventName) {
    connection.on(eventName,function() {
      var args = [].slice.apply(arguments)
      // add event name
      args.unshift(eventName)
      // add client id
      args.unshift(client.id)
      self.broadcast.apply(self,args)
    })
  })
}

Server.prototype._configureClient = function(client) {
  var self = this
  var connection = client.connection
  connection.emit('id',client.id)
}

// send message to all clients
Server.prototype.broadcast = function(id, event) {
  var self = this
  // normalize arguments
  var args = [].slice.apply(arguments)
  // remove client `id` argument
  args.shift()
  Object.keys(self.clients).map(function(clientId) {
    // don't emit to the source id
    if (clientId === id) return
    var connection = self.clients[clientId].connection
    // emit over connection
    connection.emit.apply(connection,args)
  })
}

// broadcast position, rotation updates for each player
Server.prototype.sendUpdate = function() {
  var self = this
  var clientIds = Object.keys(self.clients)
  if (clientIds.length === 0) return
  var update = {positions:{}, date: +new Date()}
  clientIds.map(function(id) {
    var client = self.clients[id]
    update.positions[id] = {
      position: client.player.position,
      rotation: {
        x: client.player.rotation.x,
        y: client.player.rotation.y,
      },
    }
  })
  self.broadcast(null, 'update', update)
}