/* global post, messagename, outlet, LiveAPI */

inlets = 1
outlets = 1
autowatch = 1

// This is a function that will get a preset amount of the live set state
var getState = require('state_management').getState

// Object to store the state of our set
var LOM

// Messages will come in the form of "/canonical_path messageType property (value)" where canonical_path is the LiveAPI path with slashes instead of spaces or id/123
function anything () {
  'use strict'

  // data will be returned by the LiveAPI
  var data

  // Split the incoming OSC formatted path into a string with spaces (and remove the first blank returned by the split method)
  var pathArray = messagename.split('/')
  pathArray.shift()
  var path = pathArray.join(' ')
  var apiObj = new LiveAPI(path)
  var messageType = arguments[0]
  var property = arguments[1]
  var value = arguments[2]

  // Call the LiveAPI object with either get, set, propert or call methods and return data (the reponse from the LiveAPI)
  switch (messageType) {
    case 'get':
      data = apiObj.get(property)
      break
    case 'set':
      apiObj.set(property, value)
      // The data returned after this is usually wrong so use the incoming value (ideally it would be set to the returned value)
      data = value
      break
    case 'call':
      data = apiObj.call(property)
      break
    case 'property':
      data = apiObj[property]
      break
    case 'get_state':
      LOM = getState()
      data = JSON.stringify(LOM)
      break
  }

  // Format and send back the returned data
  outlet(0, '/' + path.split(' ').join('/'), messageType, property, data)
}
