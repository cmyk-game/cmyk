var Uuid = require('hat')
var Server = require('./lib/server.js')
var Client = require('./lib/client.js')
var choosePlayer = require('./lib/choosePlayer.js')
var colorConverter = require('./lib/color-converter.js')
var networkUtils = require('./lib/networkUtil.js')

// game colors
var gameMaterials = [
  // materials start at index 1 (since 0 is empty space)
  colorConverter.from_cmyk({ c: 000, m: 000, y: 000, k: 075 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 100, y: 100, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 000, y: 100, k: 000 }).hex(),
]

// available player colors
var playerMaterials = [
  gameMaterials[1],
  gameMaterials[2],
  gameMaterials[3],
]

var hashLocation = document.location.hash.slice(1)

// this is the client
if (hashLocation) {
  connectToServer(hashLocation)
// this is the server
} else {
  var hostId = Uuid()
  createServer(hostId)
}

// connect to network
function connectToServer(hostId) {
  // choose a player color
  choosePlayer(playerMaterials,function(chosenColorIndex){
    var hex = playerMaterials[chosenColorIndex]
    chosenColorIndex = gameMaterials.indexOf(hex)
    // connect to server
    networkUtils.connectToServer(hostId,function(err,duplexEmitter){
      // wait for initial message
      duplexEmitter.once('data',function(data){
        console.log('server greetings:',data)
        // actually start the game here
        var client = Client({
          serverStream: duplexEmitter,
          materials: gameMaterials,
          seeThroughMaterial: chosenColorIndex,
        })
        window.client = client
        duplexEmitter.write('SRY IM LATE!')
      })
    })
  })
}


function createServer(hostId) {
  var server = Server({
    materials: gameMaterials,
  })
  window.server = server
  console.log('listening for server ready...')
  server.on('ready',function(){
    console.log('server ready!')
    networkUtils.createRtcServer(hostId,function(duplexEmitter){
      console.log('got connection')
      duplexEmitter.write('WELCOME!')
      // wait for response
      duplexEmitter.once('data',function(data){
        console.log('client response:',data)
        server.connectClient(duplexEmitter)
      })
    })
    // update url bar
    document.location.hash = hostId
  })
}