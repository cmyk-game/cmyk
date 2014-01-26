var Game = require('./lib/game.js')
var choosePlayer = require('./lib/choosePlayer.js')
var colorConverter = require('./lib/color-converter.js')
var particles = require('./lib/particles.js')

// available colors

var playerMaterials = [
  // materials start at index 1 (since 0 is empty space)
  colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
]

var gameMaterials = [
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
]

// choose a player color
choosePlayer(playerMaterials,function(chosenColorIndex){
  // actually start the game here
  var game = Game({
    materials: gameMaterials,
    seeThroughMaterial: chosenColorIndex,
  })
})
