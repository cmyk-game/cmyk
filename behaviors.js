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

    game.positional.on("electricity", function(pos) {
        var b = Behaviors[game.getBlock(pos)];
        if(b && b.onElectricity) {
            b.onElectricity.apply(b, arguments);
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

    function propagateElectricity(pos) {
        game.setTimeout(function() {
            createItem(game, pos, "#00ff00");
            neighbors(pos).forEach(function (tempPos) {
                game.at(tempPos).emit("electricity")
            });

            // display pressed effect
        }, 1000);
    }

    // keys are the diagram charcters, values are functions that get called each time step
    Behaviors = {

        //cyan button
        7: {
            //called when the player is on top of you
            steppedOn: function(pos) {
                           propagateElectricity(pos);
                           // createItem(game, pos);
                      },

            onElectricity: function(pos) {
                               propagateElectricity(pos);
                           },
        },

        // wire
        12: {
                onElectricity: function(pos, emitter) {
                                   propagateElectricity(pos);
                               }
            }

        // RedDoor: {
        //              onElectricity: function(pos, emitter) {
        //                                 game.setBlock(pos, 0);
        //                             }
        //          }
    }

    return Behaviors;
}


function createItem(game, pos, color) {
    color = color || "#ff0000";
    // create a mesh and use the internal game material (texture atlas)
    var mesh = new game.THREE.Mesh(
            new game.THREE.CubeGeometry(.1, 3, .1), // width, height, depth
            game.materials.material
    )

    // paint the mesh with a specific texture in the atlas
    game.materials.paint(mesh, color)

    // move the item to some location
    mesh.position.set(pos[0], pos[1], pos[2])

    var item = game.addItem({
        mesh: mesh,
        size: 1,
        velocity: { x: 0, y: 10, z: 0 }, // initial velocity
        acceleration: { x: 0, y: -1, z: 0},
    })
    game.setTimeout(function() {
        game.removeItem(item);
    }, 1000);
    return item
}
