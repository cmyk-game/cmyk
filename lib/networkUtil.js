var Duplex = require('duplex')
var rtcUtil = require('./rtcUtil.js')

module.exports = {
  createRtcServer: createRtcServer,
  connectToServer: connectToServer,
}

function connectToServer(hostId,createClient,createServer) {
  console.log('trying to join game:',hostId)
  var host = rtcUtil.connectToHost(hostId)
  host.on('connectionEstablished',function(duplexEmitter){
    createClient(duplexEmitter)
  })
  host.once('error',function(err){
    // is this a no-server exists error?
    if (err.message !== ('Could not connect to peer '+hostId)) throw err
    // create rtc host for other players
    console.log('creating server')
    var host = createRtcServer(hostId)
    // create virtual connection for local player
    var clientTransport = Duplex()
    var serverTransport = Duplex()
    clientTransport.on('_data', function (data) {
      process.nextTick(function(){
        serverTransport.emit('data',data)
      })
    })
    serverTransport.on('_data', function (data) {
      process.nextTick(function(){
        clientTransport.emit('data',data)
      })
    })
    // request client creation
    var client = createClient(clientTransport)
    // request server creation
    var server = createServer()
    server.connect(serverTransport)
    // setup remote player connections
    host.on('connectionEstablished',function(duplexEmitter){
      server.connect(duplexEmitter)
    })
  })
}

function createRtcServer(hostId,playerJoin) {
  var host = rtcUtil.RtcConnection(hostId)
  // host.on('connectionEstablished',playerJoin)
  host.on('connectionLost',function(){
    console.error("connection lost")
  })
  return host
}