autowatch = 1
var settings
var settingsFilePath = '..\\..\\..\\..\\settings.json'

// This function is called by the live.thisdevice in Max when the Live API is ready
function anything () {
  'use strict'

  if (messagename === 'bang') {
    settings = readSettings(settingsFilePath)
    initializeNetwork()
  }
}

// Helper function to read the settings.json file
function readSettings (filePath) {
  'use strict'

  var settingsString = ''
  var inFile = new File(filePath, 'read', 'JSON')

  if (inFile.isopen) {
    while (inFile.position < inFile.eof) {
      settingsString += inFile.readstring(800)
    }
    inFile.close()
    return JSON.parse(settingsString).networking
  } else {
    throw new Error('Could not read JSON file')
  }
}

// Helper function to remove all UDP objects
function removeObjects (maxObj) {
  'use strict'

  if (maxObj.maxclass.substring(0, 3) === 'udp') {
    this.patcher.remove(maxObj)
    return true
  }
}

// This function sets the ports to what is in the settings file and increases defaults for the message
function changePorts (channelUdpReceiver, messageUdpReceiver) {
  channelUdpReceiver.message('port', settings.toMaxChannel.port)
  messageUdpReceiver.message('port', settings.toMaxMessage.port)
}

// This removes and recreates the UDP max objects so that they have the correct port
function initializeNetwork () {
  'use strict'

  var task
  var fromMaxMessageObj
  var fromMaxChannelObj
  var channelUdpReceiver
  var messageUdpReceiver
  var networkPatch = this.patcher
  var messageLocalReceiver = networkPatch.getnamed('message_receiver')
  var channelLocalReceiver = networkPatch.getnamed('channel_receiver')

  // Remove and create the UDP senders and receivers
  networkPatch.apply(removeObjects)
  settings.hosts.forEach(function (hostname, index) {
    fromMaxMessageObj = networkPatch.newdefault(465.5 + (index * 133), 102, 'udpsend', hostname, settings.fromMaxMessage.port)
    fromMaxMessageObj.message('maxqueuesize', 1024)
    fromMaxMessageObj.message('maxpacketsize', 39936)

    fromMaxChannelObj = networkPatch.newdefault(795 + (index * 133), 102, 'udpsend', hostname, settings.fromMaxChannel.port)
    networkPatch.connect(messageLocalReceiver, 0, fromMaxMessageObj, 0)
    networkPatch.connect(channelLocalReceiver, 0, fromMaxChannelObj, 0)
  })

  channelUdpReceiver = networkPatch.newdefault(228, 60, 'udpreceive', settings.tempToMaxChannel.port)
  messageUdpReceiver = networkPatch.newdefault(357, 60, 'udpreceive', settings.tempToMaxMessage.port)
  networkPatch.connect(channelUdpReceiver, 0, networkPatch.getnamed('incoming_channel_inlet'), 0)
  networkPatch.connect(messageUdpReceiver, 0, networkPatch.getnamed('incoming_message_inlet'), 0)

  // Send a delayed update (to unbind ports in Max)
  task = new Task(changePorts, this, channelUdpReceiver, messageUdpReceiver)
  task.schedule(200)
}
