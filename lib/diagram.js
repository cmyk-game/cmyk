generator = {}
// j: vertical, k: horizontal.
generator['Floor'] = function(i,j,k) {
  return j == 0 ? 1 : 0;
}

generator['Pillar'] = function (i,j,k) {
  return level('Pillar',i,j,k);
}

legend = {}
legend['.'] = 0;

parse = function(diagram) {
  var trimmed = diagram.replace(/^\s+|\s+$/g, '');
  var rows = trimmed.replace(/\s/, '/').split('/');
  for (var i = 0; i < rows.length; i++) {
    rows[i] = rows[i].split("");
    for (var j = 0; j < rows[i].length; j++) {
      if (rows[i][j] in legend) {
        rows[i][j] = legend[rows[i][j]];
      }
      else {
        rows[i][j] = parseInt(rows[i][j]);
      }
    }
  }
  return rows;
}

_diagram = "\
1../\
.2./\
..3";

levels = {}
levels['Pillar'] = parse(_diagram);

level = function(key,i,j,k) {
  var max = 8;
  if (i <= -max || max <= i || k < -max || max < k) {
    return 0;
  }
  var voxelIndex = generator['Floor'](i,j,k);
  if (0 == voxelIndex) {
    if (1 <= j && j <= 2) {
      if (key in levels) {
        var length = levels[key].length;
        var y = Math.floor(i + length / 2);
        if (0 <= y && y < length) {
          var width = levels[key][0].length;
          var x = Math.floor(k + width / 2);
          if (0 <= x && x < width) {
            voxelIndex = levels[key][y][x];
          }
        }
      }
    }
  }
  return voxelIndex;
}

if (module) module.exports.generator = generator;
