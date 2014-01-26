var diagrams = require('../diagrams/diagrams.js')
var generateChunk = require('./generateChunk.js')

var levelTop = 0;
               // diagrams.levels.length - 1;
var levelIndex = levelTop;

var wallHeight = 3;  // enable jumping over walls.
                 // 4;  // prevent jumping over walls.
var levelHeight = wallHeight + 2;
var elementSize = 3;

var allDiagrams = diagrams.levels;
                    // diagrams.tests;

/**
 * If chunkPos is undefined then load next level.
 */
function getDiagramChunk(chunkPos) {
    var chunk = lookupChunk(chunkPos, maps, levelIndex)
    // console.log('generated diagram chunk at',chunkPos)
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
var finishIndex = 14;

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
legend['*'] = -wireIndex;
legend[start] = -startIndex;
legend['x'] = -finishIndex;

var levelStartIKs = {}

var maps = parseAll(allDiagrams);

function parseAll(diagrams) {
  var maps = [];
  for (var d = 0; d < diagrams.length; d++) {
    maps.push(parse(diagrams[d], d, levelStartIKs));
  }
  return maps;
}

function parse(diagram, levelIndex, levelStartIKs) {
  var trimmed = diagram.replace(/^\s+|\s+$/g, '');
  var rows = trimmed.replace(/\s/, '/').split('/');
  for (var x = 0; x < rows.length; x++) {
    rows[x] = rows[x].split("");
    // reverse a horizontal axis to correspond to voxel space.
    rows[x].reverse();
    for (var z = 0; z < rows[x].length; z++) {
      if (rows[x][z] in legend) {
        if (start == rows[x][z]) {
          levelStartIKs[levelIndex.toString()] = [x, z];
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
 * Generate each level.
 * Align each exit to start.
 * 14-1-25 Xiaohan expects to fix wire under door.
 */
function lookupChunk(chunkPos, maps, offset) {
  var chunk = generateChunk(chunkPos, function(i, j, k) {
    var m = offset - Math.floor(j / levelHeight);
    // Do not generate above first level.
    if (m < 0) {
      return 0;
    }
    m = m % maps.length;
    var map = maps[m];
    var jInLevel = j % levelHeight;
    while (jInLevel < 0) {
      jInLevel += levelHeight;
    }
    var iOff = levelStartIKs[m.toString()][0];
    var kOff = levelStartIKs[m.toString()][1];
    return generateMap(map, i, jInLevel, k, iOff, kOff);
  });
  return chunk;
}

/**
 * @param   j   Expect always positive.
 */
function generateMap(map, i, j, k, iOff, kOff) {
  var voxelValue = 0;
  if (-1 <= j && j <= 2 + wallHeight) {
    var y = Math.floor(i / elementSize) + iOff;
    var length = map.length;
    if (0 <= y && y < length) {
      var x = Math.floor(k / elementSize) + kOff;
      var width = map[0].length;
      if (0 <= x && x < width) {
        var value = map[y][x];
        if (0 <= j && j <= 1) {
          // 14-1-25 Aaron expects standing on finish falls to next level.
          if (-finishIndex == value) {
            value = finishIndex;
          }
          else if (j == 1 && value < 0) {
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
        if (j == 2 + wallHeight) {
          if (ceiling) {
            value = (-startIndex == map[y][x]) ? 0 : 1;
          }
          else {
            value = 0;
          }
        }
        voxelValue = value;
        // console.log('diagram chunk voxel is',voxelValue,'at',[i,j,k])
      }
    }
  }
  return voxelValue;
}

module.exports = {
  getChunk: getDiagramChunk
}
