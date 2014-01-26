var diagrams = require('../diagrams/diagrams.js')
// var fs = require('fs')
var generateChunk = require('./generateChunk.js')

module.exports = getDiagramChunk

var loadDiagram = 
                  diagrams.levels[2];
                  // diagrams.testCorridor;

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
generator['Floor'] = function(i,j,k) {
  return (-1 <= j && j <= 1) ? 1 : 0;
}

generator['Fill'] = function(i,j,k) {
  return 1;
}

var start = '>';   // facing right

var legend = {}
legend['.'] = 0;    // floor
legend[start] = -8;
legend['x'] = -7;   // finish
legend['*'] = -6;   // wire
legend['A'] = 2;    // doors
legend['B'] = 3;
legend['C'] = 4;
legend['D'] = 5;
legend['a'] = -2;   // buttons
legend['b'] = -3;
legend['c'] = -4;
legend['d'] = -5;

var iOff = 1;
var kOff = 1;

function parse(diagram,chunkPos) {
  var trimmed = diagram.replace(/^\s+|\s+$/g, '');
  var rows = trimmed.replace(/\s/, '/').split('/');
  for (var x = 0; x < rows.length; x++) {
    rows[x] = rows[x].split("");
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

function lookupChunk(chunkPos, map) {
  var elementSize = 3;
  var length = map.length;
  var width = map[0].length;
  var wallHeight = 3;
  var chunk = generateChunk(chunkPos,function(i,j,k){
    var voxelValue = 0;
    if (-1 <= j && j <= 1 + wallHeight) {
      voxelValue = generator['Floor'](i,j,k);
      var y = Math.floor(i / elementSize) + iOff;
      if (0 <= y && y < length) {
        var x = Math.floor(k / elementSize) + kOff;
        if (0 <= x && x < width) {
          var value = map[y][x];
          if (0 <= j && j <= 1) {
            if (j == 1 && value < 0) {
              value = 0 - value;
            }
            else {
              value = voxelValue;
            }
          }
          else if (value < 0) {
            value = 0;
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
