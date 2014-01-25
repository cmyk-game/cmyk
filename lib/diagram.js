var fs = require('fs')
var generateChunk = require('./generateChunk.js')

module.exports = getDiagramChunk

function getDiagramChunk(chunkPos) {

  if (chunkPos[0] === 0 && chunkPos[1] === 0 && chunkPos[2] === 0) {
    var filename = chunkPos.join('_')
    // var diagram = fs.readFileSync( __dirname+'/../diagrams/0_0_0').toString();
    var diagram = "\
1...3/\
1...3/\
1...3/\
1...3/\
1...3/\
1...3"
    var map = parse(diagram)
    var chunk = lookupChunk(chunkPos,map)
    console.log('generated diagram chunk at',chunkPos)
    return chunk
  }

}

var generator = {}
// j: vertical, k: horizontal.
generator['Floor'] = function(i,j,k) {
  return j == 0 ? 1 : 0;
}

generator['Fill'] = function(i,j,k) {
  return 1;
}

generator['Pillar'] = function (i,j,k) {
  return level('Pillar',i,j,k);
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
  var chunk = generateChunk(chunkPos,function(i,j,k){
    var voxelValue = generator['Floor'](i,j,k);
    if (0 == voxelValue) {
      if (1 <= j && j <= 2) {
        var length = map.length;
        var y = Math.floor(i + length / 2);
        if (0 <= y && y < length) {
          var width = map[0].length;
          var x = Math.floor(k + width / 2);
          if (0 <= x && x < width) {
            voxelValue = map[y][x];
            console.log('diagram chunk voxel is',voxelValue,'at',[i,j,k])
          }
        }
      }
    }
    return voxelValue;
  })
  return chunk
}


// var levels = {}
// levels['Pillar'] = parse(_diagram);

// function level(key,i,j,k) {
//   var max = 8;
//   if (i <= -max || max <= i || k < -max || max < k) {
//     return 0;
//   }
//   var voxelIndex = generator['Floor'](i,j,k);
//   if (0 == voxelIndex) {
//     if (1 <= j && j <= 2) {
//       if (key in levels) {
//         var length = levels[key].length;
//         var y = Math.floor(i + length / 2);
//         if (0 <= y && y < length) {
//           var width = levels[key][0].length;
//           var x = Math.floor(k + width / 2);
//           if (0 <= x && x < width) {
//             voxelIndex = levels[key][y][x];
//           }
//         }
//       }
//     }
//   }
//   return voxelIndex;
// }

// if (module) module.exports.generator = generator;
