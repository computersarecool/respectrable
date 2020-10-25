/* global post, messagename, outlet, LiveAPI */

inlets = 1
outlets = 1
autowatch = 1

var getState = require('get_state').getState

// Check if a value should be returned
function validateReturnValue (returnArray, returnValue) {
  "use strict"

  // Check if the array returned has valid objects
  if (Array.isArray(returnValue)) {
    if (returnValue[0] === 'id' && '' + returnValue[1] === '0') {
      return false
    }
    return returnArray.concat(returnValue)
  } else {
    // Check if the object returned is valid
    if (typeof returnValue === 'object') {
      if ('' + returnValue.id === '0' || returnValue.id === undefined) {
        return false
      }
    }
    if (typeof returnValue === undefined) {
      return false
    }

    returnArray.push(returnValue)
    return returnArray
  }
}

// Messages come in the form of "/canonicalPath messageType propertyOrFunc [valueOrArgs]"
// canonicalPath is the LiveAPI path with slashes instead of spaces
// messageType is 'get', 'set', 'call', 'property' or 'getcount'. There is also the special 'get_state' function
// [valueOrArgs] is an an optional array of arguments
// Calling functions that do not exist on objects sends back the same path with a value of 0
function anything () {
  "use strict"

  // Split the incoming OSC formatted canonical path into a string with spaces and remove the first blank returned by split
  // This is expecting an OSC message like "/live_set/tracks/0 set color 0"
  var pathArray = messagename.split('/')
  pathArray.shift()
  var path = pathArray.join(' ')

  // Create Live object and make sure path is valid
  var apiObj = new LiveAPI(path)
  if ('' + apiObj.id === '0') {
    return
  }

  var messageType = arguments[0]
  var propertyOrFunc = arguments[1]
  var valueOrArgs = arguments[2]

  // Check if there is a list of arguments
  if (arguments.length > 3) {
    var args = Array.prototype.slice.call(arguments);
    valueOrArgs = args.slice(2, arguments.length)
  }

  var returnArray = ['/' + path.split(' ').join('/'), propertyOrFunc]
  var returnValue

  // Access an element of the Live set
  switch (messageType) {
    // Get a property
    case 'get':
      returnValue = apiObj.get(propertyOrFunc)
      returnArray = validateReturnValue(returnArray, returnValue)
      if (!returnArray)
      {
        return
      }
      break

    // Set a property. Follow each `set` with a call to `get` in case it is not observed
    case 'set':
      apiObj.set(propertyOrFunc, valueOrArgs)
      returnValue = apiObj.get(propertyOrFunc)
      returnArray = validateReturnValue(returnArray, returnValue)
      if (!returnArray)
      {
        return
      }
      break

    // Call a function
    case 'call':
      returnValue = apiObj.call(propertyOrFunc, valueOrArgs)
      returnArray = validateReturnValue(returnArray, returnValue)
      if (!returnArray)
      {
        return
      }
      break

    // Get child count
    case 'getcount':
      returnValue = apiObj.getcount(propertyOrFunc)
      returnArray = validateReturnValue(returnArray, returnValue)
      if (!returnArray)
      {
        return
      }
      break

    // Get a "built-in" property
    case 'property':
      returnValue = apiObj[propertyOrFunc]
      returnArray = validateReturnValue(returnArray, returnValue)
      if (!returnArray)
      {
        return
      }
      break

    // Special method
    case 'getstate':
      var LOM = getState()
      returnArray[1] = messageType
      returnArray.push(JSON.stringify(LOM))
      break
  }

  outlet(0, returnArray)
}
