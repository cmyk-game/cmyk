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
  var length = map.length;
  var width = map[0].length;
  var chunkSize = 32;
  var c0 = chunkSize * chunkPos[0];
  var c2 = chunkSize * chunkPos[2];
  var chunk = generateChunk(chunkPos,function(i,j,k){
    var voxelValue = generator['Floor'](i,j,k);
    if (0 == voxelValue) {
      if (1 <= j && j <= 3) {
        if (0 <= i && i < length) {
          if (0 <= i && i < width) {
            voxelValue = map[j][k];
            // console.log('diagram chunk voxel is',voxelValue,'at',[i,j,k])
          }
        }
      }
    }
    return voxelValue;
  })
  return chunk
}
