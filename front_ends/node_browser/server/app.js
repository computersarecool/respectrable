// This code acts as a proxy so that we can send UDP OSC messages to and from the browser using websockets
let channelPort
let messagePort
const osc = require('osc')
const Primus = require('primus')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const makeOSCPort = require('./make_port')
const {messagePortOptions, channelPortOptions, nodeHTTPPort} = require('./port_options')

// Create the primus server
let primus = new Primus(server, {
  transformer: 'websockets'
})

// Use emit plugin so we can use 'toMax' events
primus.plugin('emit', require('primus-emit'))

// Primus (websocket) connection made with browser - make OSC ports
primus.on('connection', spark => {
  channelPort = makeOSCPort(spark, channelPortOptions)
  messagePort = makeOSCPort(spark, messagePortOptions)
  
  // Websocket events received from browser - forward to Max
  spark.on('toMax', packet => {
    packet.isChannel ? channelPort.sendOSC(packet.address, packet.args) : messagePort.sendOSC(packet.address, packet.args)
  })
})

// Close OSC ports on disconnection
primus.on('disconnection', spark => {
  channelPort.close()
  messagePort.close()
})

// Set up HTTP server and serve static content
app.use(express.static(__dirname + '/public'))
server.listen(nodeHTTPPort, () => {
  console.log('HTTP server listening on port', nodeHTTPPort)
})

module.exports = app
