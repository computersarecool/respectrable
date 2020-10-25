autowatch = 1

var settings
var settingsFilePath = '..\\..\\..\\settings.json'

// This function is called by the live.thisdevice in Max when the Live API is ready
function anything () {
  "use strict"

  if (messagename === 'bang') {
    settings = readSettings(settingsFilePath)
    initializeNetwork()
  }
}

// Read the settings.json file
function readSettings (filePath) {
  "use strict"

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
  "use strict"

  if (maxObj.maxclass.substring(0, 3) === 'udp') {
    this.patcher.remove(maxObj)
    return true
  }
}

// Set UDP receive ports to what is in the settings file
function changePorts (networkGUIReceiver, networkJSReceiver) {
  networkJSReceiver.message('port', settings.maxJSReceive.port)
  networkGUIReceiver.message('port', settings.maxGUIReceive.port)
}

// Create all UDP objects
function initializeNetwork () {
  "use strict"

  var MAX_QUEUE = 1024
  var MAX_PACKET = 39936
  var JS_SEND_Y = 102
  var GUI_SEND_Y = 230
  var SEND_START_X = 473
  var SEND_WIDTH = 133
  var DELAY_MS = 200

  // Get permanent objects within patch
  var networkPatch = this.patcher
  var localJSReceiver = networkPatch.getnamed('local_js_receiver')
  var localGUIReceiver = networkPatch.getnamed('local_gui_receiver')

  // Remove the UDP objects
  networkPatch.apply(removeObjects)

  // Create the UDP senders
  settings.hosts.forEach(function (hostname, index) {
    var networkJSSender = networkPatch.newdefault(SEND_START_X + (index * SEND_WIDTH), JS_SEND_Y, 'udpsend', hostname, settings.maxJSSend.port)
    networkJSSender.message('maxqueuesize', MAX_QUEUE)
    networkJSSender.message('maxpacketsize', MAX_PACKET)
    networkPatch.connect(localJSReceiver, 0, networkJSSender, 0)

    var networkGUISender = networkPatch.newdefault(SEND_START_X + (index * SEND_WIDTH), GUI_SEND_Y, 'udpsend', hostname, settings.maxGUISend.port)
    networkGUISender.message('maxqueuesize', MAX_QUEUE)
    networkGUISender.message('maxpacketsize', MAX_PACKET)
    networkPatch.connect(localGUIReceiver, 0, networkGUISender, 0)
  })

  // Create UDP receivers
  var networkJSReceiver = networkPatch.newdefault(330, 60, 'udpreceive', settings.tempMaxJSReceive.port)
  networkPatch.connect(networkJSReceiver, 0, networkPatch.getnamed('incoming_message_inlet'), 0)

  var networkGUIReceiver = networkPatch.newdefault(200, 60, 'udpreceive', settings.tempMaxGUIReceive.port)
  networkPatch.connect(networkGUIReceiver, 0, networkPatch.getnamed('incoming_channel_inlet'), 0)

  // Send a delayed update to unbind ports in Max
  var task = new Task(changePorts, this, networkGUIReceiver, networkJSReceiver)
  task.schedule(DELAY_MS)
}
