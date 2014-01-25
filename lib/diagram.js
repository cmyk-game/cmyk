var fs = require('fs')
var generateChunk = require('./generateChunk.js')

module.exports = getDiagramChunk

function getDiagramChunk(chunkPos) {

    // var filename = chunkPos.join('_')
    // var diagram = fs.readFileSync( __dirname+'/../diagrams/0_0_0').toString();
    var diagram = "\
12123/\
1...3/\
1...3/\
1...3/\
1...3/\
1.a*A/\
1...B/\
1...C/\
1.**D/\
1.*.3/\
1.d.3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
13213"
    var map = parse(diagram)
    var chunk = lookupChunk(chunkPos,map)
    console.log('generated diagram chunk at',chunkPos)
    return chunk

}

var generator = {}
// j: vertical, k: horizontal.
generator['Floor'] = function(i,j,k) {
  return j == 0 ? 1 : 0;
}

generator['Fill'] = function(i,j,k) {
  return 1;
}

var legend = {}
legend['.'] = 0;
legend['*'] = -6;
legend['A'] = 2;
legend['B'] = 3;
legend['C'] = 4;
legend['D'] = 5;
legend['a'] = -2;
legend['b'] = -3;
legend['c'] = -4;
legend['d'] = -5;

function parse(diagram,chunkPos) {
  var trimmed = diagram.replace(/^\s+|\s+$/g, '');
  var rows = trimmed.replace(/\s/, '/').split('/');
  for (var x = 0; x < rows.length; x++) {
    rows[x] = rows[x].split("");
    for (var z = 0; z < rows[x].length; z++) {
      if (rows[x][z] in legend) {
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
  var iOff = Math.floor(length / 2);
  var width = map[0].length;
  var kOff = Math.floor(width / 2);
  var chunk = generateChunk(chunkPos,function(i,j,k){
    var voxelValue = 0;
    if (0 <= j && j <= 3) {
      voxelValue = generator['Floor'](i,j,k);
      var y = Math.floor(i / elementSize) + iOff;
      if (0 <= y && y < length) {
        var x = Math.floor(k / elementSize) + kOff;
        if (0 <= x && x < width) {
          var value = map[y][x];
          if (j == 0) {
            if (value < 0) {
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
