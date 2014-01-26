var extend = require('extend')
var Game = require('./game.js')

module.exports = function(materials,callback) {

    var colorSelectorDiv = document.getElementById("color-selector");
    var colorDivs = [];

    function addDiv(colorString, materialIndex) {
        var div = document.createElement("div");
        colorDivs.push(div);
        div.style["background-color"] = colorString;
        div.style.cursor = "pointer";
        div.onclick = function() {
            // remove other divs to show your selection
            colorDivs.forEach(function (divIter) {
                if(divIter !== div) {
                    colorSelectorDiv.removeChild(divIter);
                }
            });
            // return the chosen color
            callback(materialIndex)
        }
        colorSelectorDiv.appendChild(div);
        return div;
    }
    var clearDiv = addDiv("none", -1);
    clearDiv.innerHTML += "God";
    materials.forEach(function(colorString, idx) {
        addDiv(colorString, Number(idx) + 1);
    });

}
