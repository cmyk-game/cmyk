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


---

Windows Help

msysgit

$ npm install

If npm start crashes.

$ beefy test.js:bundle.js 8080
listening on http://localhost:8080/
200   14ms    1.27KB /index.html
200    8ms   32.51KB /ratchet.css
200    4ms    6.91KB /logo-white.png
200    3ms      882B /crosshair.png
200 1355ms     1.3MB /bundle.js -> .\node_modules\.bin\browserify.cmd .\test.js
-d
200   10ms     3.9KB /player.png
200    6ms  147.63KB /favicon.ico

web browser to localhost:8080

Compress

$ npm home voxel-crunch
npm http GET https://registry.npmjs.org/voxel-crunch/latest

Save to File

http://stackoverflow.com/questions/13405129/javascript-create-and-save-file

http://eligrey.com/demos/FileSaver.js/

https://github.com/eligrey/FileSaver.js


