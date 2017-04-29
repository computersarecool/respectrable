/* global LiveAPI */

// Object to store the state of our set
var LOM = {}

var clip = {
  properties: [
    'color'
  ],
  children: null
}

var clipSlots = {
  properties: null,
  children: clip
}

var parameters = {
  properties: [
    'name',
    'value'
  ],
  children: null
}

var devices = {
  properties: [
    'name'
  ],
  children: {
    parameters: parameters
  }
}

var tracks = {
  properties: [
    'color',
    'has_midi_input',
    'mute',
    'name',
    'solo',
    'fired_slot_index'
  ],
  children: {
    devices: devices,
    mixer_device: {
      properties: null,
      children: null
    },
    clipSlots: clipSlots
  }
}

var liveSet = {
  properties: [
    'clip_trigger_quantization'
  ],
  children: {
    tracks: tracks,
    return_tracks: tracks,
    master_track: tracks
  }
}

function getState () {
  'use strict'

  // Get live_app state
  var liveApp = {}
  var liveAppAPI = new LiveAPI('live_app')
  liveApp.major_version = liveAppAPI.call('get_major_version')
  liveApp.minor_version = liveAppAPI.call('get_minor_version')
  liveApp.bugfix_version = liveAppAPI.call('get_bugfix_version')

  // This sets sate on the LOM object
  getAllState('live_set', liveSet)
  return LOM
}

function getAllState (pathOrID, propertyObject) {
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
function createNestedObject (base, names, value) {
  // If a value is given, remove the last name and keep it for later:
  var lastName = arguments.length === 3 ? names.pop() : false

  // Walk the hierarchy, creating new objects where needed.
  // If the lastName was removed, then the last object is not set yet:
  for (var i = 0; i < names.length; i++) {
    base = base[names[i]] = base[names[i]] || {}
  }

  // If a value was given, set it to the last name:
  if (lastName) base = base[lastName] = value

  // Return the last object in the hierarchy:
  return base
}

exports.stateManagement = {
  getState: getState
}
