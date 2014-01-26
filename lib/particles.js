var createGame = require('voxel-engine')

module.exports = function(game){
	game.createBlock = function(pos, val) {
	  if (typeof val === 'string') val = this.materials.find(val)
	  if (!this.canCreateBlock(pos)) return false
	  this.setBlock(pos, val)
  
  		// if sparkly block
	  if (val === 8){
		sphere = getParticles(pos, 0);
		this.scene.add( sphere );
	  }
  
	  return true
	}
	
	return game;
}

function getParticles(pos, val) {

	attributes = {
		size: {	type: 'f', value: [] },
		ca:   {	type: 'c', value: [] }
	};
	
	uniforms = {
		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new game.THREE.Color( 0xffffff ) },
		texture:   { type: "t", value:  game.THREE.ImageUtils.loadTexture( "textures/sprites/disc.png" ) },
	};

	uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = game.THREE.RepeatWrapping;

	var shaderMaterial = new game.THREE.ShaderMaterial( {
		uniforms: 		uniforms,
		attributes:     attributes,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		transparent:	true
	});
	
	var radius = 1;
	var geometry = new game.THREE.Geometry();

	for ( var i = 0; i < 50; i++ ) {
		var vertex = new game.THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( radius );
		
		vertex.x += pos[0] + 0.5;
		vertex.y += pos[1] + 0.5;
		vertex.z += pos[2] + 0.5;
		geometry.vertices.push( vertex );
	}

	sphere = new game.THREE.ParticleSystem( geometry, shaderMaterial );

	sphere.attributes = attributes;
	
	sphere.dynamic = true;
	sphere.sortParticles = true;

	var vertices = sphere.geometry.vertices;
	var values_size = sphere.attributes.size.value;
	var values_color = sphere.attributes.ca.value;

	for( var v = 0; v < vertices.length; v++ ) {
		values_size[ v ] = 10;
		values_color[ v ] = new game.THREE.Color( 0xffaa00 );

		values_color[ v ].setHSL( 0.6, 0.75, 0.25 + vertices[ v ].y / ( 2 * radius ) );
	}

	sphere.tick = function (delta) {
	    var time = Date.now() * 0.005;

		for( var i = 0; i < this.attributes.size.value.length; i++ ) {
			this.attributes.size.value[ i ] = 14 + 13 * Math.sin( 0.1 * i + time );
		}
		this.attributes.size.needsUpdate = true;
	}

	game.items.push(sphere);
		
	return sphere;
}