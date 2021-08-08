autowatch = 1

var settings
var settingsFilePath = '..\\..\\..\\settings.json'
var tempToMaxObjectKey = 'tempToMaxObject'
var tempToMaxJsKey = 'tempToMaxJs'
var toMaxObjectKey = 'toMaxObject'
var toMaxJsKey = 'toMaxJs'
var fromMaxKey = 'fromMax'

// This function is called by the live.thisdevice in Max when the Live API is ready
function anything () {
  'use strict'

  if (messagename === 'bang') {
    settings = readSettings(settingsFilePath)
    initializeNetwork()
  }
}

// Read the settings.json file
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

// Remove all UDP objects
function removeObjects (maxObj) {
  'use strict'

  if (maxObj.maxclass.substring(0, 3) === 'udp') {
    this.patcher.remove(maxObj)
    return true
  }
}

// Set UDP receive ports to what is in the settings file
function changePorts (objectReceiver, jsReceiver) {
  objectReceiver.message('port', settings[toMaxJsKey].port)
  jsReceiver.message('port', settings[toMaxObjectKey].port)
}

// Recreate all UDP objects
function initializeNetwork () {
  'use strict'

  var MAX_QUEUE = 1024
  var MAX_PACKET = 39936
  var SEND_Y = 102
  var SEND_START_X = 473
  var SEND_WIDTH = 133
  var DELAY_MS = 200
  var networkPatch = this.patcher
  var localJSReceiver = networkPatch.getnamed('local_js_receiver')
  var localGUIReceiver = networkPatch.getnamed('local_gui_receiver')

  // Remove the UDP objects
  networkPatch.apply(removeObjects)

  // Create the UDP senders
  settings.hosts.forEach(function (hostname, index) {
    var networkSender = networkPatch.newdefault(SEND_START_X + (index * SEND_WIDTH), SEND_Y, 'udpsend', hostname, settings[fromMaxKey].port)
    networkSender.message('maxqueuesize', MAX_QUEUE)
    networkSender.message('maxpacketsize', MAX_PACKET)
    networkPatch.connect(localJSReceiver, 0, networkSender, 0)
    networkPatch.connect(localGUIReceiver, 0, networkSender, 0)
  })

  // Create UDP receivers
  var networkJSReceiver = networkPatch.newdefault(330, 60, 'udpreceive', settings[tempToMaxJsKey].port)
  networkPatch.connect(networkJSReceiver, 0, networkPatch.getnamed('incoming_message_inlet'), 0)

  var networkGUIReceiver = networkPatch.newdefault(200, 60, 'udpreceive', settings[tempToMaxObjectKey].port)
  networkPatch.connect(networkGUIReceiver, 0, networkPatch.getnamed('incoming_channel_inlet'), 0)

  // Send a delayed update to unbind ports in Max
  var task = new Task(changePorts, this, networkGUIReceiver, networkJSReceiver)
  task.schedule(DELAY_MS)
}
