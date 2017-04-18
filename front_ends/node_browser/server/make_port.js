// Helper function to make ports and add all of their functionality
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

  port.sendOSC = (address, args) => {
    // OSC format before sending
    address = '/' + address.split(' ').join('/')
    port.send({
      address,
      args
    }, destinationAddress, destinationPort)
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
  
  // Remove the OSC formatting when message is received
  port.on('message',  packet => {
    let {args, address} = packet
    address = address.split('/')
    address.shift()
    address = address.join(' ')
    primusSocket.emit('fromMax', {args, address})
  })

  port.open()
  return port
}
