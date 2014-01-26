var rtcUtil = require('./rtcUtil.js')

module.exports = {
  createRtcServer: createRtcServer,
  connectToServer: connectToServer,
}

function connectToServer(hostId,callback) {
  console.log('trying to join game:',hostId)
  var host = rtcUtil.connectToHost(hostId)
  host.on('connectionEstablished',function(duplexEmitter){
    callback(null,duplexEmitter)
  })
  host.on('connectionLost',function(){
    console.error("connection lost")
  })
  // rtc.on('error',function(err){
  //   console.log('could not join game...')
  //   if (err.message === ('Could not connect to peer '+hostId)) {
  //     console.log('trying to create game:',hostId)
  //     createRtcServer(hostId)
  //   }
  // })

}

function createRtcServer(hostId,playerJoin) {
  var host = rtcUtil.RtcConnection(hostId)
  host.on('connectionEstablished',playerJoin)
  host.on('connectionLost',function(){
    console.error("connection lost")
  })
  return host
}