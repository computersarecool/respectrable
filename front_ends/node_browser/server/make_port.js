// This exports a constructor function for OSC UDP ports

const osc = require('osc')

module.exports = (primusSocket, portOptions) => {
  const {
    localAddress,
    localPort,
    destinationAddress,
    destinationPort,
    name
  } = portOptions

  let port = new osc.UDPPort({
    localAddress,
    localPort
  })

  port.sendOSC = packet => port.send(packet, destinationAddress, destinationPort)

  port.on('open', () => {
    console.log(`${name} listening on ${localPort}`)
  })

  port.on('close', () => {
    console.log(`${name} closed`)
  })

  port.on('error', err => {
    console.log(`There is an error ${err}`)
  })

  // This is where an incoming message is received by the OSC port
  port.on('message', packet => primusSocket.emit('fromMax', packet))

  port.open()
  return port
}
