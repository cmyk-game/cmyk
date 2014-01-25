module.exports = generateChunk

function generateChunk(chunkPos, generator, game) {
  console.log('generating chunk',chunkPos)
  var chunkSize = 32
  var l = [chunkPos[0]*chunkSize,chunkPos[1]*chunkSize,chunkPos[2]*chunkSize]
  var h = [(chunkPos[0]+1)*chunkSize,(chunkPos[1]+1)*chunkSize,(chunkPos[2]+1)*chunkSize]
  var d = [ h[0]-l[0], h[1]-l[1], h[2]-l[2] ]
  var v = new Int8Array(d[0]*d[1]*d[2])
  var n = 0
  for(var k=l[2]; k<h[2]; ++k)
  for(var j=l[1]; j<h[1]; ++j)
  for(var i=l[0]; i<h[0]; ++i, ++n) {
    v[n] = generator(i,j,k,n,game)
  }
  return {voxels:v, dims:d, position: chunkPos}
}