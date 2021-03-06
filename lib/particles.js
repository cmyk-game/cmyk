var createGame = require('voxel-engine')

module.exports = function(game){
	game.getParticles = getParticles
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
		blending: 		game.THREE.AdditiveAlphaBlending,
		transparent:	true,
		depthTest: true
	});
	
	var radius = 1;
	var geometry = new game.THREE.Geometry();

	for ( var i = 0; i < 20; i++ ) {
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

	var vertices = sphere.geometry.vertices;
	var values_size = sphere.attributes.size.value;
	var values_color = sphere.attributes.ca.value;

	for( var v = 0; v < vertices.length; v++ ) {
		values_size[ v ] = 10;
		values_color[ v ] = new game.THREE.Color( 0xffffff );
		
		values_color[ v ].setHSL( -0.75 + vertices[ v ].y / ( 2 * radius ), 0.9, 0.5 );
	}

	sphere.tick = function (delta) {
	    var time = Date.now() * 0.005;

		for( var i = 0; i < this.attributes.size.value.length; i++ ) {
			this.attributes.size.value[ i ] = 1 + 5 * Math.sin( 1 * i + time);
		}
		this.attributes.size.needsUpdate = true;
	}

	game.items.push(sphere);
		
	return sphere;
}