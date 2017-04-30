// This exports a constructor functin for OSC UDP ports

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

  port.sendOSC = packet => {
    // OSC format address before sending
    packet.address = '/' + packet.address.split(' ').join('/')
    port.send(packet, destinationAddress, destinationPort)
  }

  port.on('open', () => {
    console.log(name + ' listening on ' + localPort)
  })

  port.on('close', () => {
    console.log(name + ' closed')
  })

  port.on('error', err => {
    console.log('There is an error', err)
  })

  // This is where an incoming message is received by the OSC port
  port.on('message', packet => {
    let {args, address} = packet

    // Undo the OSC formatting and send via the websocket
    address = address.split('/')
    address.shift()
    address = address.join(' ')
    primusSocket.emit('fromMax', {args, address})
  })

  port.open()
  return port
}
