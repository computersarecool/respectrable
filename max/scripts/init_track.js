inlets = 1
outlets = 2
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    makeChildren()

    var apiObject = new LiveAPI(path.split('/').join(' '))

    outlet(0, 'id ' + apiObject.id)
  }
}

function makeChildren() {
  var apiObject = new LiveAPI(path.split('/').join(' '))
  var scriptingPath = apiObject.path.split(' ').join('/')

  // Remove children
  this.patcher.remove(this.patcher.getnamed('mixer_device'))
  this.patcher.remove(this.patcher.getnamed('devices_container'))
  this.patcher.remove(this.patcher.getnamed('clip_slots_container'))

  createMixerDevice(scriptingPath)
  createDevicelist(apiObject, scriptingPath)

  if (path.substring(0, 12) === '/live_set/tr') {
    createClipSlotsContainer(scriptingPath)
  }

  updateGUI(apiObject)
}

function createMixerDevice (scriptingPath) {
  'use strict'

  this.patcher.newdefault(200, 200, 'bpatcher', 'live_mixer_device.maxpat', '@args', '/' + scriptingPath + '/mixer_device', '@presentation', 1, '@border', 1, '@patching_rect', [496, 522, 129, 198], '@presentation_rect', [0, 187, 129, 198], '@varname', 'mixer_device')
}

function createClipSlotsContainer (scriptingPath) {
  'use strict'

  this.patcher.newdefault(200, 200, 'bpatcher', 'clip_slots.maxpat', '@args', '/' + scriptingPath, '@presentation', 1, '@enablevscroll', 1, '@border', 1, '@patching_rect', [730, 522, 129, 173], '@presentation_rect', [0, 26, 120, 135], '@enablehscroll', true, '@varname', 'clip_slots_container')
}

function createDevicelist (apiObject, scriptingPath) {
  'use strict'

  var numDevices = apiObject.getcount('devices')

  if (numDevices >= 1) {
    this.patcher.newdefault(200, 200, 'bpatcher', 'devices_list.maxpat', '@args', '/' + scriptingPath, '@presentation', 1, '@border', 1, '@patching_rect', [932, 522, 210 * numDevices, 173], '@presentation_rect', [0, 400, 110, 188], '@enablehscroll', true, '@varname', 'devices_container')
  }
}

function updateGUI (apiObject) {
  'use strict'

  var maxTrackColor
  var trackLabel = this.patcher.getnamed('track_label')
  var trackName = apiObject.get('name')[0]
  var trackColor = apiObject.get('color')[0]

  if (trackColor === 0) {
    maxTrackColor = [0.59, 0.59, 0.59, 1]
  } else {
    maxTrackColor = [(trackColor >> 16 & 255) / 255, (trackColor >> 8 & 255) / 255, (trackColor & 255) / 255, 1.0]
  }

  trackLabel.message('bgcolor', maxTrackColor)
  trackLabel.message('text', trackName.substring(0, 25))
}
