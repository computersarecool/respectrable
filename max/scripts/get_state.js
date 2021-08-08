inlets = 1
outlets = 1
autowatch = 1

// This script gets a partial representation of the Live set state

// This object is returned by getState
var LOM = {}

// All the children / properties we want to query when getState is called
var clip = {
  properties: [
    'has_audio_input',
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

var clip_slots = {
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
    clip_slots: clip_slots
  }
}

var return_tracks = {
  properties: [
    'has_audio_input',
    'color',
    'mute',
    'name',
    'solo'
  ],
  children: tracks.children
}

var master_track = {
  properties: [
    'color',
    'has_audio_input',
    'name'
  ],
  children: tracks.children
}

var live_set = {
  properties: [
    'clip_trigger_quantization',
    'current_song_time',
    'is_playing',
    'tempo'
  ],
  children: {
    tracks: tracks,
    return_tracks: return_tracks,
    master_track: master_track
  }
}

var live_app = {
  functions: [
    'get_major_version',
    'get_minor_version',
    'get_bugfix_version'
  ]
}

// Functions to get the state of Live
function getState () {
  'use strict'

  getAppState()
  getAllState('live_set', live_set)
  return LOM
}

function getAppState () {
  'use strict'

  var appObj = {}
  var liveAppAPI = new LiveAPI('live_app')

  live_app.functions.forEach(function (item) {
    appObj[item] = liveAppAPI.call(item)
  })

  LOM.live_app = appObj
}

function getAllState (pathOrID, propertyObject) {
  'use strict'

  var api = new LiveAPI(pathOrID)
  var path = api.unquotedpath.split(' ')
  var type = api.type

  // Add properties for this object
  if (propertyObject.properties) {
    propertyObject.properties.forEach(function (property) {
      var value = api.get(property)
      var propertyPath = path.slice()

      propertyPath.push(property)
      createNestedObject(LOM, propertyPath, value)
    })
  }

  // Recurse through children
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
