var Game = require('./lib/game.js')
var networkUtils = require('./lib/networkUtil.js')

networkUtils.connectToServer('cmyk-game',Game.createClient,Game.createServer)