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

  // Some experimental messages are sent to global
  if (pathArray[0] !== 'global') {
    var apiObj = new LiveAPI(path)
  } 

  var messageType = arguments[0]
  var property = arguments[1]
  var value = arguments[2]

  // data will be returned by the LiveAPI
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

    // These options return their own data from an outlet
    case 'move_bank':
      data = moveBank(property)
      return
    case 'set_scene':
      setScene(property)
      return
    case 'fire_track':
      fireTrack(property)
      return
    case 'stop_track':
      stopTrack(property)
      return
    case 'increase_tempo':
      changeTempo(true)
      return
    case 'decrease_tempo':
      changeTempo(false)
      return
  }

  // Format and send back the returned data
  outlet(0, '/' + path.split(' ').join('/') + '/' + property, data)
}

// Experimental
function moveBank (direction) {
  var bankLength = 8
  var selectedSceneObj = new LiveAPI('live_set view selected_scene')
  var selectedScene = selectedSceneObj.path.split(' ')
  var currentlyHighlightedIndex = parseInt(selectedScene[2].slice(0, -1))
  var clips = new LiveAPI('live_set tracks 0').get('clip_slots')

  // Keep the new scene index in range
  var newHighlightedIndex = direction == '0' ? currentlyHighlightedIndex - bankLength : currentlyHighlightedIndex + bankLength
  if (newHighlightedIndex < 0) {
    newHighlightedIndex = 0
  } else if (newHighlightedIndex >= clips.length / 2) {
    newHighlightedIndex = clips.length / 2 - 1
  }

  var nextSceneId = new LiveAPI('live_set scenes ' + newHighlightedIndex).id
  var liveSetView = new LiveAPI('live_set view')
  liveSetView.set('selected_scene', 'id ' + nextSceneId)

  // Collect clip data
  var clipBankNames = []
  var clipBankColors = []
  var clipBankIndices = []

  for (var index = newHighlightedIndex; index < newHighlightedIndex + bankLength; index++) {
    // Default values for if there is not a song in this clip
    var clipName = '-'
    var clipColor = 000000000

    // Clips also have a separate entry for "id" so divide by two
    if (index < clips.length / 2) {
      var clipSlot = new LiveAPI('live_set tracks 0 clip_slots ' + index + ' clip')
      clipName = clipSlot.get('name')[0]
      clipColor = clipSlot.get('color')[0]
    }

    clipBankNames.push(clipName)
    clipBankColors.push(clipColor)
    clipBankIndices.push(index)
  }

  clipBankNames = JSON.stringify(clipBankNames)
  clipBankColors = JSON.stringify(clipBankColors)
  clipBankIndices = JSON.stringify(clipBankIndices)
  
  outlet(0, '/clip_bank_names', clipBankNames)
  outlet(0, '/clip_bank_colors', clipBankColors)
  outlet(0, '/clip_bank_indices', clipBankIndices)
}

function setScene (index) {
  var nextSceneId = new LiveAPI('live_set scenes ' + index).id
  var liveSetView = new LiveAPI('live_set view')

  liveSetView.set('selected_scene', 'id ' + nextSceneId)

  outlet(0, '/live_set/view/selected_scene', 'id ' + nextSceneId)
}

function changeTempo(increase) {
  var liveSet = new LiveAPI('live_set')
  var currentTempo = parseInt(liveSet.get('tempo'))
  var nextTempo = increase ? (currentTempo + 1) : (currentTempo - 1)
 
  liveSet.set('tempo', nextTempo)

  outlet(0, '/new_tempo', parseInt(liveSet.get('tempo')))
}

function fireTrack(trackIndex) {
  var selectedSceneObj = new LiveAPI('live_set view selected_scene')
  var selectedSceneAsNumber = selectedSceneObj.path.slice(1, -1).split(' ')[2]
  var clipSlot = new LiveAPI('live_set tracks ' + trackIndex + ' clip_slots ' + selectedSceneAsNumber + ' clip')
  
  clipSlot.call('fire')
}

function stopTrack(trackIndex) {
  var trackObj = new LiveAPI('live_set tracks ' + trackIndex)

  trackObj.call('stop_all_clips')
}
