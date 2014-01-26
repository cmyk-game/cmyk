var Game = require('./lib/game.js')
var choosePlayer = require('./lib/choosePlayer.js')
var colorConverter = require('./lib/color-converter.js')

// available colors

var playerMaterials = [
  // materials start at index 1 (since 0 is empty space)
  colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
]






var gameMaterials = [
  // materials start at index 1 (since 0 is empty space)
  colorConverter.from_cmyk({ c: 000, m: 000, y: 000, k: 075 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 000, y: 000, k: 100 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 100, y: 000, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 100, y: 100, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 000, m: 100, y: 100, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 050, m: 000, y: 050, k: 000 }).hex(),
  colorConverter.from_cmyk({ c: 100, m: 000, y: 100, k: 000 }).hex(),
]

// choose a player color
choosePlayer(playerMaterials,function(chosenColorIndex){
  var hex = playerMaterials[chosenColorIndex]
  // chosenColorIndex = gameMaterials.indexOf(hex)
  // actually start the game here
  var game = Game({
    materials: gameMaterials,
    seeThroughMaterial: chosenColorIndex,
  })
})
