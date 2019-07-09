/* global post, messagename, outlet, LiveAPI */

inlets = 1
outlets = 1
autowatch = 1

// This is a function that will get a representation of the Live set state
var getState = require('state_management').getState

// Messages come in the form of "/canonical_path messageType property (value)" where canonical_path is the LiveAPI path with slashes instead of spaces
function anything () {
  'use strict'

  // Split the incoming OSC formatted canonical path into a string with spaces (and remove the first blank returned by the split method)
  // This is expecting an OSC message like "/live_set/tracks/0 set color 0"
  var pathArray = messagename.split('/')
  pathArray.shift()
  var path = pathArray.join(' ')

  var apiObj = new LiveAPI(path)
  var messageType = arguments[0]
  var property = arguments[1]
  var value = arguments[2]

  // `data` will be returned
  var data

  // Access an element of the Live set
  switch (messageType) {
    case 'get':
      data = apiObj.get(property)
      break
    case 'set':
      // Follow each `set` with a call to `get`
      apiObj.set(property, value)
      data = apiObj.get(property)
      break
    case 'call':
      data = apiObj.call(property)
      break
    case 'property':
      data = apiObj[property]
      break
    
    // Helper method
    case 'get_state':
      var LOM = getState()
      property = messageType
      data = JSON.stringify(LOM)
      break
  }

  // Format and send back the returned data
  outlet(0, '/' + path.split(' ').join('/') + '/' + property, data)
}
