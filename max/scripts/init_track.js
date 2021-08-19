/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))

  if (messagename === 'bang') {
    recreateChildren()
    outlet(0, 'id ' + apiObject.id)
  } else if (messagename === 'devices') {
    recreateDeviceList()
  } else if (messagename === 'clip_slots') {
    recreateClipSlotsContainer()
  }
}

function recreateChildren () {
  'use strict'

  recreateMixerDevice()
  recreateDeviceList()
  recreateClipSlotsContainer()

  updateGUI()
}

function recreateMixerDevice () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var scriptingPath = apiObject.path.split(' ').join('/')

  this.patcher.remove(this.patcher.getnamed('mixer_device'))
  this.patcher.newdefault(200, 200, 'bpatcher', 'live_mixer_device.maxpat',
    '@args', '/' + scriptingPath + '/mixer_device', '@presentation', 1, '@border', 1, '@patching_rect', [496, 522, 129, 198],
    '@presentation_rect', [0, 187, 129, 198], '@varname', 'mixer_device')
}

function recreateClipSlotsContainer () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var scriptingPath = apiObject.path.split(' ').join('/')
  this.patcher.remove(this.patcher.getnamed('clip_slots_container'))

  // Make clips if not return or master track
  if (path.substring(0, 12) === '/live_set/tr') {
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_clip_slots.maxpat',
      '@args', '/' + scriptingPath, '' + '@presentation', 1, '@enablevscroll', 1, '@border', 1, '@patching_rect', [730, 522, 129, 173],
      '@presentation_rect', [0, 26, 120, 135], '@enablehscroll', true, '@varname', 'clip_slots_container')
  }
}

function recreateDeviceList () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var scriptingPath = apiObject.path.split(' ').join('/')
  this.patcher.remove(this.patcher.getnamed('devices_container'))

  var numDevices = apiObject.getcount('devices')
  if (numDevices >= 1) {
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_devices.maxpat', '@args', '/' + scriptingPath,
      '@presentation', 1, '@border', 1, '@patching_rect', [932, 522, 220 * numDevices, 188], '@presentation_rect', [0, 400, 129, 197],
      '@enablehscroll', true, '@varname', 'devices_container')
  }
}

function updateGUI () {
  'use strict'

  var maxTrackNameLength = 25
  var guiTrackColor = [0.59, 0.59, 0.59, 1]
  var apiObject = new LiveAPI(path.split('/').join(' '))
  var trackLabel = this.patcher.getnamed('track_label')
  var trackName = apiObject.get('name')[0]
  var trackColor = apiObject.get('color')[0]

  if (trackColor !== 0) {
    guiTrackColor = [(trackColor >> 16 & 255) / 255, (trackColor >> 8 & 255) / 255, (trackColor & 255) / 255, 1.0]
  }

  trackLabel.message('bgcolor', guiTrackColor)
  trackLabel.message('text', trackName.substring(0, maxTrackNameLength))
}
