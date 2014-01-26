var audio = require("voxel-audio")

function Audio(game) {
    audio.initGameAudio(game);

    this.game = game;
    game.once("init", function (avatar) {this.addSoundsToAvatar(avatar) }.bind(this));
}

Audio.prototype.addSoundsToAvatar = function(avatar) {

    // setup walking sound
    var walk = new audio.PositionAudio({
        url : './audio/footstep-fast.wav',
        startingPosition: [0, 0, 0],
        coneOuterAngle : 360,
        coneInnerAngle : 360,
        refDistance : 2.2,
        loop: true
    });
    walk.load(function(err) {
        game.on("tick", function() {
            walk.panner.setPosition(avatar.position.x, avatar.position.y, avatar.position.z);
        });
        game.on("startWalking", function() {
            walk.gainNode.gain.value = 0;
        });
        game.on("stopWalking", function() {
            walk.gainNode.gain.value = 1;
        });
        walk.play();
        walk.gainNode.gain.value = 0;
    });


    //setup jumping sound
    var jump = new audio.PositionAudio({
        url : './audio/jump.mp3',
        startingPosition: [0, 0, 0],
        coneOuterAngle : 360,
        coneInnerAngle : 360,
        refDistance : 2.2,
        loop: false
    });
    jump.load(function(err) {
        jump.gainNode.gain.value = 0.5;
        var oldJump = false;
        game.on("tick", function() {
            //detect when it's jumping
            var newJump = game.controls.jumping;
            if(!oldJump && newJump) {
                // i just started jumping
                jump.panner.setPosition(avatar.position.x, avatar.position.y, avatar.position.z);
                jump.initBuffer();
                jump.play();
            }
            oldJump = newJump;
        });
    });

}

module.exports = Audio;
