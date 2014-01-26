var _ = require("underscore")

module.exports = function(game) {
    //postional eventing (electricity, doors, etc)
    game.voxelRegion.on("change", function(pos) {
        pos[1] -= 1;
        if(game.getBlock(pos) !== 0) {
            var value = game.getBlock(pos)
            var b = Behaviors[value];
            if(b && b.steppedOn) {
                b.steppedOn(pos);
            }
        }
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

    // keys are the diagram charcters, values are functions that get called each time step
    Behaviors = {
        1: {
            //called when the player is on top of you
            steppedOn: function(pos) {
                          game.setTimeout(function() {
                              createItem(game, pos);
                              // emit("electricity", pos + [0, 0, -1])
                              // emit("electricity", pos + [0, 0, +1])
                              // emit("electricity", pos + [0, -1, 0])
                              // emit("electricity", pos + [0, +1, 0])
                              // emit("electricity", pos + [-1, 0, 0])
                              // emit("electricity", pos + [+1, 0, 0])

                              // display pressed effect
                          }, 200);
                      },

            onElectricity: function() {
                           },
        },

        // Wire: {
        //           onElectricity: function(pos, emitter) {
        //                                emit("electricity", pos + [0, 0, -1])
        //                                emit("electricity", pos + [0, 0, +1])
        //                                emit("electricity", pos + [0, -1, 0])
        //                                emit("electricity", pos + [0, +1, 0])
        //                                emit("electricity", pos + [-1, 0, 0])
        //                                emit("electricity", pos + [+1, 0, 0])
        //                          }
        //       }

        // RedDoor: {
        //              onElectricity: function(pos, emitter) {
        //                                 game.setBlock(pos, 0);
        //                             }
        //          }
    }

    return Behaviors;
}


function createItem(game, pos) {
    // create a mesh and use the internal game material (texture atlas)
    var mesh = new game.THREE.Mesh(
            new game.THREE.CubeGeometry(.1, 3, .1), // width, height, depth
            game.materials.material
    )

    // paint the mesh with a specific texture in the atlas
    game.materials.paint(mesh, '#ff0000')

    // move the item to some location
    mesh.position.set(pos[0], pos[1], pos[2])

    var item = game.addItem({
        mesh: mesh,
        size: 1,
        velocity: { x: 0, y: 0, z: 0 } // initial velocity
    })
    return item
}
