var _ = require("underscore")
var overlay = require("./overlay.js")

module.exports = function(game) {
    //postional eventing (electricity, doors, etc)

    function tryBehavior(pos, fnName, argsArray) {
        var value = game.getBlock(pos);
        var b = Behaviors[value];
        if(b && b[fnName]) {
            b[fnName].apply(b, argsArray);
        }
    }

    var oldPlayerPosition;
    game.voxelRegion.on("change", function(pos) {
        pos[1] -= 1;
        if( oldPlayerPosition ) {
            tryBehavior(oldPlayerPosition, "steppedOff", [oldPlayerPosition]);
        }
        tryBehavior(pos, "steppedOn", [pos]);
        oldPlayerPosition = pos;
    });

    //delegate positional electricity events to the correct behavior
    game.positional.on("electricity", function(pos) {
        tryBehavior(pos, "onElectricity", arguments);
    });

    // six neighbors
    function neighbors(pos) {
        return _.flatten([0,1,2].map(function (axis) {
                    return [-1, +1].map(function (direction) {
                        var tempPos = _.clone(pos);
                        tempPos[axis] = tempPos[axis] + direction;
                        return tempPos;
                    });
                }),
                true);
    }

    function propagateElectricity(pos) {
        if(game.at(pos).isCoolingDown) {
            return;
        }
        game.setTimeout(function() {
            if(game.at(pos).isCoolingDown) {
                return;
            }
            createItem(game, pos, "#00ff00");
            game.at(pos).isCoolingDown = true;
            game.setTimeout(function() {
                game.at(pos).isCoolingDown = false;
            }, 1500);
            neighbors(pos).forEach(function (tempPos) {
                var fromPos = pos;
                game.at(tempPos).emit("electricity", fromPos)
            });

            // display pressed effect
        }, 400);
    }

    function buttonBehavior(materialIndex) {
        return {
            //called when the player is on top of you
            steppedOn: function(pos) {
                           if(game.controls.target().seeThroughMaterial == materialIndex || materialIndex === undefined || game.controls.target().isGod) {
                               propagateElectricity(pos);
                           }
                       },

            onElectricity: function(pos) {
                               propagateElectricity(pos);
                           },
        }
    }

    function doorBehavior() {
        return {
            onElectricity: function(pos, emitter) {
                               game.setBlock(pos, 0);
                               propagateElectricity(pos);
                           }
        }
    }

    // keys are the diagram charcters, values are functions that get called each time step
    Behaviors = {

        // doors
        2: doorBehavior(),
        3: doorBehavior(),
        4: doorBehavior(),
        5: doorBehavior(),
        6: doorBehavior(), // blocks everyone

        //cyan button
        7: buttonBehavior(2),
        8: buttonBehavior(3),
        9: buttonBehavior(4),
        10: buttonBehavior(5),
        11: buttonBehavior(undefined), //everyone can use

        // wire
        12: {
                onElectricity: function(pos, from) {
                                   propagateElectricity(pos);
                               }
            },

        //no behavior for start plate

        // finish plate
        14: {
                playersOn: [],

                steppedOn: function(pos) {
                    this.playersOn.push(game.controls.target());
                    this.checkWinCondition(pos);
                },


                checkWinCondition: function(pos) {
                                       if(this.playersOn.length > 0) {
                                           overlay("You won!", 2000);
                                           propagateElectricity(pos);
                                       }
                                   },

                /**
                 * Aaron expects exit destroys when walked on.
                 * Same as door.
                 */
                onElectricity: function(pos, emitter) {
                                   game.setBlock(pos, 0);
                                   propagateElectricity(pos);
                               },

                steppedOff: function(pos) {
                    this.playersOn = _.without(this.playersOn, game.controls.target());
                    console.log("stepped off win pad!");
                },
            }

    }

    return Behaviors;
}


function createItem(game, pos, color) {
    color = color || "#ff0000";
    // create a mesh and use the internal game material (texture atlas)
    var mesh = new game.THREE.Mesh(
            new game.THREE.CubeGeometry(.1, 1, .1), // width, height, depth
            game.materials.material
    )

    // paint the mesh with a specific texture in the atlas
    game.materials.paint(mesh, color)

    // move the item to some location
    mesh.position.set(pos[0], pos[1] + 1, pos[2])

    var item = game.addItem({
        mesh: mesh,
        size: 1,
        velocity: { x: 0, y: 10, z: 0 }, // initial velocity
    })
    game.setTimeout(function() {
        game.removeItem(item);
    }, 4000);
    return item
}
