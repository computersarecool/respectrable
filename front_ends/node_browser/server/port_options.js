const ipConfig = require('../../../settings').networking
const {nodeHTTPPort} = ipConfig

let channelPortOptions = {
  localAddress: ipConfig.mainAddress,
  localPort: ipConfig.fromMaxChannel.port,
  destinationAddress: ipConfig.mainAddress,
  destinationPort: ipConfig.toMaxChannel.port,
  name: 'Channel Port'
}

let messagePortOptions = {
  localAddress: ipConfig.mainAddress,
  localPort: ipConfig.fromMaxMessage.port,
  destinationAddress: ipConfig.mainAddress,
  destinationPort: ipConfig.toMaxMessage.port,
  name: 'Message Port'
}

module.exports = {
  channelPortOptions,
  messagePortOptions,
  nodeHTTPPort
}