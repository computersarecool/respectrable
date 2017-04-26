inlets = 1
outlets = 1
autowatch = 1

// Object to store the state of our set
var LOM = {
  live_app: {}
}

// Messages will come in the form of "/canonical_path messageType property (value)" where canonical_path is the LiveAPI path with slashes instead of spaces
// canonical_path may also take the form /id/123 where 123 is an example ID
function anything () {
  'use strict'

  // data will be the result returned by the LiveAPI
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
    case  'get':
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
      data = getState();
      break      
  }

  // Format and send back the returned data
  outlet(0, '/' + path.split(' ').join('/'), messageType, property, data)
}

function getState () {
  'use strict'

  var clip_properties = [
    'color'
  ]

  var clip_slots_children = {
    clip: {
      properties: clip_properties,
      children: null
    }
  }

  var device_properties = [
    'name'
  ]

  var device_children = {
    parameters: {
      properties: parameters_properties,
      children: null
    }
  }

  var parameters_properties = [
    'name',
    'value'
  ]

  var track_properties = [
    'color',
    'has_midi_input',
    'mute',
    'name',
    'solo',
    'fired_slot_index'
  ]

  var track_children = {
    devices : {
      properties: device_properties,
      children: device_children
    },
    mixer_device: {
      properties: null,
      children: null
    },
    clip_slots: {
      properties: null,
      children: null
    } 
  }

  var live_set = {
    properties: [
      'clip_trigger_quantization'
    ],
    children: {
      tracks: {
        properties: track_properties,
        children: track_children
      },
      return_tracks: {
        properties: track_properties,
        children: track_children
      },
      master_track: {
        properties: track_properties,
        children: track_children
      }
    }
  }

  // Get live_app state
  var live_app_api = new LiveAPI('live_app')
  LOM['live_app'].major_version = live_app_api.call('get_major_version')
  LOM['live_app'].minor_version = live_app_api.call('get_minor_version')
  LOM['live_app'].bugfix_version = live_app_api.call('get_bugfix_version')
  
  // Get live_set state
  getAllState('live_set', live_set)

  post(JSON.stringify(LOM))
  return JSON.stringify(LOM)
}

function getAllState(pathOrID, propertyObject) {
 'use strict'

  var api = new LiveAPI(pathOrID)
  var path = api.unquotedpath.split(' ')

  // If there are properties, and every property value to LOM
  if (propertyObject.properties) {
    propertyObject.properties.forEach(function (property) {
      var value = api.get(property)
      var propertyPath = path.slice()

      propertyPath.push(property)
      createNestedObject(LOM, propertyPath, value)
    })
  }
  
  // If there are children recurse through all children
  if (propertyObject.children) {
    Object.keys(propertyObject.children).forEach(function (childName) {
      var childProperties = propertyObject.children[childName]
      var childIDs = api.get(childName)

      // Only process ID arrays longer than one (which means there are actually children)
      if (childIDs.length > 1) {
        for (var i = 0; i < childIDs.length; i += 2) {
          getAllState(childIDs[i] + ' ' + childIDs[i + 1], childProperties) 
        }
      }
    })
  }
}

// Taken from http://stackoverflow.com/questions/5484673/javascript-how-to-dynamically-create-nested-objects-using-object-names-given-by
function createNestedObject(base, names, value) {
    // If a value is given, remove the last name and keep it for later:
    var lastName = arguments.length === 3 ? names.pop() : false;

    // Walk the hierarchy, creating new objects where needed.
    // If the lastName was removed, then the last object is not set yet:
    for( var i = 0; i < names.length; i++ ) {
        base = base[ names[i] ] = base[ names[i] ] || {};
    }

    // If a value was given, set it to the last name:
    if( lastName ) base = base[ lastName ] = value;

    // Return the last object in the hierarchy:
    return base;
}