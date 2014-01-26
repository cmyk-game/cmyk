var overlayDiv = document.getElementById("overlay");

module.exports = function(text) {
    if(text) {
        overlayDiv.style.visibility = "visible";
        overlayDiv.innerHTML = text;
    } else {
        overlayDiv.style.visibility = "hidden";
    }
}
