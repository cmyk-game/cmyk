var colorConverter = require('./lib/color-converter.js')
var extend = require('extend')

module.exports = function(opts) {


    /* ======= Material Atlas ==========
     *
     *    0 - empty space
     *    1 - normal, grey block
     *
     *    2 - cyan block            (2)
     *    3 - magenta block         (3)
     *    4 - yellow block          (4)
     *
     *    5 - wire
     *
     *    6 - cyan platform         (a)
     *    7 - magenta platform      (b)
     *    8 - yellow platform       (c)
     *
     *    9 - cyan door             (A)
     *    10 - magenta door         (B)
     *    11 - yellow door          (C)
     *
     */

    var defaults = {
        materials: [
          // materials start at index 1 (since 0 is empty space)
          colorConverter.from_cmyk({ c: 000, m: 000, y: 000, k: 075 }).hex(),
          colorConverter.from_cmyk({ c: 100, m: 000, y: 000, k: 000 }).hex(),
          colorConverter.from_cmyk({ c: 000, m: 100, y: 000, k: 000 }).hex(),
          colorConverter.from_cmyk({ c: 000, m: 000, y: 100, k: 000 }).hex(),
        ],
        // seeThroughMaterial: 1,
    }

    var colorSelectorDiv = document.getElementById("color-selector");
    var colorDivs = [];

    function addDiv(colorString, materialIndex) {
        var div = document.createElement("div");
        colorDivs.push(div);
        div.style["background-color"] = colorString;
        div.style.cursor = "pointer";
        div.onclick = function() {
            defaults.seeThroughMaterial = materialIndex;

            // remove other divs to show your selection
            colorDivs.forEach(function (divIter) {
                if(divIter !== div) {
                    colorSelectorDiv.removeChild(divIter);
                }
            });

            div.style.cursor = null;
            div.onclick = null;
            // actually start the game here
            var opts = extend({}, defaults, opts || {});
            var game = require('./game.js')(opts);
        }
        colorSelectorDiv.appendChild(div);
        return div;
    }
    var clearDiv = addDiv("none", 0);
    clearDiv.innerHTML += "God";
    defaults.materials.forEach(function(colorString, idx) {
        addDiv(colorString, Number(idx) + 1);
    });

}
