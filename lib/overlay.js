module.exports = overlay

var overlayDiv = document.getElementById("overlay");
var overlayTextDiv = document.getElementById("overlayText");

var shows = 0;

function overlay(text, milliseconds) {
    if(text) {
        shows++;
        overlayDiv.style.visibility = "visible";
        overlayTextDiv.innerHTML = text;
        window.setTimeout(hide, milliseconds);
    } else {
        hide();
    }
}

function hide() {
    shows--;
    if (shows <= 0) {
        overlayDiv.style.visibility = "hidden";
    }
}
