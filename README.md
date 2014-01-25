<<<<<<< HEAD
# voxel-hello-world

Learn more at http://voxeljs.com

# Using it as a module

`npm install voxel-hello-world`

```javascript
var game = require('voxel-hello-world')
```

# Get it running on your machine

The first time you set up, you should install the required npm packages:

```
cd voxel-hello-world
npm install
```

Then run the start script:

```
npm start
```

Then point your browser to [http://localhost:8080](http://localhost:8080) and have fun!

## How does this work?

voxel.js modules use [browserify](http://browserify.org) for packaging modules together into game bundles. This means that every time you change code in your game you have to build a new bundle in order to test it out. Luckily this is very easy and is automated. When you run the `npm start` script, it runs a local server: when the browser requests `index.js`, it compiles it serverside and then serves up the compiled version.

The upshot is, as long as you're running the `npm start` script in the background, you can save your changes to index.js and reload the game to see the new code in action, without having to have a build step in between. (If you'd like to change the start script, it's contained in the `package.json` file in the root directory.)

## license

BSD


Global Game Jam page: http://globalgamejam.org/2014/

### TEAM MEMBERS:

* Adam Rickert
  - adam.rickert@gmail.com
  - 2D Art / UI
* Aaron Davis
  - aaron@kumavis.me
  - Programmer!
* Ethan Kennerly
  - ethan@finegamedesign.com
  - Programmer
* Even Cheng
  - even.gamer@gmail.com
  - Programmer
* Xiaohan Zhang
  - hellocharlien@hotmail.com
  - Programmer


Game Ideas
----------
Multiplayer cooperative maze game. Players are color coded and can 
only interact with objects that are similarly colored.

- Walls of the players color do not render for that player
- Other players see the wall as the color it is (or black)
- Black walls block all players
- Can only go through walls of the same color
- Can only look through windows of the same color


Gameplay Style
----------
- Players have to pair up to go through series of doors
- 3 player/ 1 player paths
- Switch partners rooms


Art Style
----------
Simple color minecraft voxel style
- Solid colors
- Prismatic if available
- Glows if available


Music Style
----------
medium paced
contemplative?


TECH
----------
- [Voxel.js](http://voxeljs.com/)
- [Node.js](http://nodejs.org/)
- [Browserify](http://browserify.org/)
