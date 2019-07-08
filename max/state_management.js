/* global LiveAPI */

// Object to store the state of the Live set
var LOM = {}

// These are all the children / properties we want to query when getState is called
var clip = {
  properties: [
    'color',
    'file_path',
    'is_audio_clip',
    'is_triggered',
    'length',
    'looping',
    'pitch_coarse',
    'pitch_fine',
    'playing_position',
    'name'
  ],
  children: null
}

var clipSlots = {
  properties: [
    'has_clip'
  ],
  children: {
    clip: clip
  }
}

var parameters = {
  properties: [
    'name',
    'value'
  ],
  children: null
}

var mixerDevice = {
  properties: null,
  children: {
    sends: parameters,
    panning: parameters,
    volume: parameters,
    track_activator: parameters
  }
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
    'has_audio_input',
    'output_meter_left',
    'output_meter_right',
    'mute',
    'name',
    'solo',
    'playing_slot_index',
    'fired_slot_index'
  ],
  children: {
    devices: devices,
    mixer_device: mixerDevice,
    clip_slots: clipSlots
  }
}

var returnTracks = {
  properties: [
    'has_audio_input',
    'color',
    'mute',
    'name',
    'solo'
  ],
  children: tracks.children
}

var masterTrack = {
  properties: [
    'color',
    'has_audio_input',
    'name'
  ],
  children: tracks.children
}

var liveSet = {
  properties: [
    'clip_trigger_quantization',
    'current_song_time',
    'is_playing',
    'tempo'
  ],
  children: {
    tracks: tracks,
    return_tracks: returnTracks,
    master_track: masterTrack
  }
}

// Functions to get the state of the Live set
function getState () {
  'use strict'

  // These functions fill out the LOM object with the state from Live
  getAppState()
  getAllState('live_set', liveSet)
  return LOM
}

function getAppState () {
  'use strict'

  var liveApp = {}
  var liveAppAPI = new LiveAPI('live_app')

  liveApp.major_version = liveAppAPI.call('get_major_version')
  liveApp.minor_version = liveAppAPI.call('get_minor_version')
  liveApp.bugfix_version = liveAppAPI.call('get_bugfix_version')
  LOM.live_app = liveApp
}

function getAllState (pathOrID, propertyObject) {
  'use strict'

  var api = new LiveAPI(pathOrID)
  var path = api.unquotedpath.split(' ')
  var type = api.type

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

      // We do not want to get the children of an empty clip slot
      if (type === 'ClipSlot' && !api.get('has_clip')[0]) {
        return
      }

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

exports.getState = getState
