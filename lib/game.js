var Client = require('./client.js')
var Server = require('./server.js')
var choosePlayer = require('./choosePlayer.js')
var colorConverter = require('./color-converter.js')

module.exports = {
  createServer: createServer,
  createClient: createClient,
}

function createServer() {
  var settings = {
     materials: [
      // materials start at index 1 (since 0 is empty space)
      "stone_brick",
      // doors, 2-6
      "solid_color/blue_solid",
      "solid_color/red_solid",
      "solid_color/yellow_solid",
      "solid_color/orange_solid",
      "white_stone_brick",  //blocks everyone
      //buttons, 7-11
      "button_blue",
      "button_red",
      "button_yellow",
      "button_orange",
      "button_black", //activatable by everyone
      //wire, 12
      "wires/wire_prism",
      //start, 13
      "deco_tile_01",
      //end, 14
      "black_stone_brick",
    ],
    generateChunks: false,
    chunkDistance: 1,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true, jumpMaxSpeed: 0.012 },
  }
  var server = Server(settings)
  window.server = server
  return server
}

function createClient(duplexEmitter) {
  var client = Client()
  window.client = client
  client.connect(duplexEmitter)

  // player colors
  var playerColors = [
    // materials start at index 1 (since 0 is empty space)
    colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
    colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
    colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
  ]

  // choose a player color
  choosePlayer(playerColors,function(chosenColorIndex){
    // client.chooseColor(chosenColorIndex)
  })

  return client
}