var diagrams = require('../diagrams/diagrams.js')
// var fs = require('fs')
var generateChunk = require('./generateChunk.js')

module.exports = getDiagramChunk

var loadDiagram = 
                  // diagrams.levels[1];
                  diagrams.levels[diagrams.levels.length - 1];
                  // diagrams.tests[0];
                  // diagrams.tests[diagrams.tests.length - 1];

function getDiagramChunk(chunkPos) {

    // var filename = chunkPos.join('_')
    // var diagram = fs.readFileSync( __dirname+'/../diagrams/0_0_0').toString();
    var diagram = loadDiagram;
    var map = parse(diagram)
    var chunk = lookupChunk(chunkPos,map)
    console.log('generated diagram chunk at',chunkPos)
    return chunk

}

var generator = {}
// j: vertical, k: horizontal.
generator['Fill'] = function(i,j,k) {
  return 1;
}

var start = '>';   // facing right
var doorMinIndex = 2;
var doorMaxIndex = 6;
var wireIndex = 12;
var startIndex = 13;

var legend = {}
legend['.'] = 0;    // floor
legend['A'] = doorMinIndex;    // doors
legend['B'] = 3;
legend['C'] = 4;
legend['D'] = 5;
legend['E'] = doorMaxIndex;    // blocks all players
legend['a'] = -7;   // buttons
legend['b'] = -8;
legend['c'] = -9;
legend['d'] = -10;
legend['e'] = -11;   // any player can trigger
legend['*'] = -wireIndex;   // wire
legend[start] = -startIndex;
legend['x'] = -14;   // finish

var iOff = 1;
var kOff = 1;

function parse(diagram,chunkPos) {
  var trimmed = diagram.replace(/^\s+|\s+$/g, '');
  var rows = trimmed.replace(/\s/, '/').split('/');
  for (var x = 0; x < rows.length; x++) {
    rows[x] = rows[x].split("");
    // reverse a horizontal axis to correspond to voxel space.
    rows[x].reverse();
    for (var z = 0; z < rows[x].length; z++) {
      if (rows[x][z] in legend) {
        if (start == rows[x][z]) {
          iOff = x;
          kOff = z;
        }
        rows[x][z] = legend[rows[x][z]];
      }
      else {
        rows[x][z] = parseInt(rows[x][z]);
      }
    }
  }
  return rows;
}

/**
 * 14-1-25 Xiaohan expects to fix wire under door.
 */
function lookupChunk(chunkPos, map) {
  var elementSize = 3;
  var length = map.length;
  var width = map[0].length;
  var wallHeight = 3;
  var chunk = generateChunk(chunkPos,function(i,j,k){
    var voxelValue = 0;
    if (-1 <= j && j <= 2 + wallHeight) {
      var y = Math.floor(i / elementSize) + iOff;
      if (0 <= y && y < length) {
        var x = Math.floor(k / elementSize) + kOff;
        if (0 <= x && x < width) {
          var value = map[y][x];
          if (0 <= j && j <= 1) {
            if (j == 1 && value < 0) {
              value = 0 - value;
            }
            else if (j == 1 && doorMinIndex <= value && value <= doorMaxIndex) {
              value = wireIndex;
            }
            else {
              value = 1;
            }
          }
          else if (value < 0) {
            value = 0;
          }
          var ceiling = false;
          if (ceiling && j == 2 + wallHeight) {
            value = (-startIndex == map[y][x]) ? 0 : 1;
          }
          voxelValue = value;
          // console.log('diagram chunk voxel is',voxelValue,'at',[i,j,k])
        }
      }
    }
    return voxelValue;
  })
  return chunk
}
