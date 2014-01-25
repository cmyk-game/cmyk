/*! colorconverterjs - v0.1.1 - 2013-12-26
* http://felipesabino.github.io/colorconverter
* Copyright (c) 2013 Felipe Sabino
* Licensed MIT */
var colorconverter;

colorconverter = (function() {
  _Class.prototype.hex_color = null;

  function _Class(hex) {
    if (hex && this.is_valid(hex)) {
      this.hex_color = hex;
    }
  }

  _Class.prototype.is_valid = function(hex) {
    var color;
    color = this.hex_color;
    if (hex != null) {
      color = hex;
    }
    return typeof color === 'string' && color.match(/^\#([a-fA-F0-9]{6})$/) !== null;
  };

  _Class.prototype.hex = function() {
    return this.hex_color;
  };

  _Class.from_hex = function(hex) {
    return new colorconverter(hex);
  };

  _Class.random = function() {
    var rnd;
    rnd = '#' + ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6);
    return new colorconverter(rnd);
  };

  return _Class;

})();

(function(CC) {
  CC.prototype.cmyk = function() {
    return CC.hex_to_cmyk(this.hex());
  };
  CC.cmyk_to_hex = function(cmyk) {
    var c, k, m, rgb, y;
    c = cmyk.c / 100;
    m = cmyk.m / 100;
    y = cmyk.y / 100;
    k = cmyk.k / 100;
    if (c <= 0) {
      c = 0;
    }
    if (m <= 0) {
      m = 0;
    }
    if (y <= 0) {
      y = 0;
    }
    if (k <= 0) {
      k = 0;
    }
    if (c > 1) {
      c = 1;
    }
    if (m > 1) {
      m = 1;
    }
    if (y > 1) {
      y = 1;
    }
    if (k > 1) {
      k = 1;
    }
    rgb = {};
    rgb.r = 1 - Math.min(1, c * (1 - k) + k);
    rgb.g = 1 - Math.min(1, m * (1 - k) + k);
    rgb.b = 1 - Math.min(1, y * (1 - k) + k);
    rgb.r = Math.round(rgb.r * 255);
    rgb.g = Math.round(rgb.g * 255);
    rgb.b = Math.round(rgb.b * 255);
    return CC.rgb_to_hex(rgb);
  };
  CC.hex_to_cmyk = function(hex) {
    var b, cmyk, g, r, rgb;
    rgb = CC.hex_to_rgb(hex);
    cmyk = {};
    r = rgb.r / 255;
    g = rgb.g / 255;
    b = rgb.b / 255;
    cmyk.k = Math.min(1 - r, 1 - g, 1 - b);
    cmyk.c = (1 - r - cmyk.k) / (1 - cmyk.k);
    cmyk.m = (1 - g - cmyk.k) / (1 - cmyk.k);
    cmyk.y = (1 - b - cmyk.k) / (1 - cmyk.k);
    cmyk.c = Math.round(cmyk.c * 100);
    cmyk.m = Math.round(cmyk.m * 100);
    cmyk.y = Math.round(cmyk.y * 100);
    cmyk.k = Math.round(cmyk.k * 100);
    return cmyk;
  };
  return CC.from_cmyk = function(cmyk) {
    var h, is_valid;
    is_valid = function(cmyk) {
      if ((cmyk != null) && (cmyk.c != null) && (cmyk.m != null) && (cmyk.y != null) && (cmyk.k != null)) {
        return true;
      } else {
        return false;
      }
    };
    h = is_valid(cmyk) ? CC.cmyk_to_hex(cmyk) : cmyk;
    return new CC(h);
  };
})(colorconverter);

(function(CC) {
  CC.prototype.rgb = function() {
    return CC.hex_to_rgb(this.hex());
  };
  CC.rgb_to_hex = function(rgb) {
    var b, g, r;
    r = ('00' + rgb.r.toString(16)).slice(-2);
    g = ('00' + rgb.g.toString(16)).slice(-2);
    b = ('00' + rgb.b.toString(16)).slice(-2);
    return "#" + r + g + b;
  };
  CC.hex_to_rgb = function(hex) {
    var rgb;
    rgb = {};
    rgb.r = ('0x' + (hex.substr(1, 2))) << 0;
    rgb.g = ('0x' + (hex.substr(3, 2))) << 0;
    rgb.b = ('0x' + (hex.substr(5, 2))) << 0;
    return rgb;
  };
  return CC.from_rgb = function(rgb) {
    var h, is_valid;
    is_valid = function(rgb) {
      if ((rgb != null) && (rgb.r != null) && (rgb.g != null) && (rgb.b != null)) {
        return true;
      } else {
        return false;
      }
    };
    h = is_valid(rgb) ? CC.rgb_to_hex(rgb) : rgb;
    return new CC(h);
  };
})(colorconverter);

if (module) module.exports = colorconverter;
