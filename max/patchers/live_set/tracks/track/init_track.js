inlets = 1
outlets = 2
autowatch = 1

var path = jsarguments[1]
var router = this.patcher.getnamed('trackRouter')

function anything () {
  "use strict"

  if (messagename === 'bang') {
    var apiObject
    var scriptingPath
    
    if (path === '/live_set/master_track') {
      outlet(1, 'master_track')
      apiObject = new LiveAPI('live_set ' + path.split('/').join(' '))
      scriptingPath = apiObject.path.split(' ').join('/')
      this.patcher.remove(this.patcher.getnamed('solo_observer'))
      this.patcher.remove(this.patcher.getnamed('solo_toggle'))
      this.patcher.remove(this.patcher.getnamed('position_indicator'))
      this.patcher.remove(this.patcher.getnamed('length_indicator'))
      this.patcher.remove(this.patcher.getnamed('stop_button'))
    } else {
      apiObject = new LiveAPI(path.split('/').join(' '))
      scriptingPath = apiObject.path.split(' ').join('/')
    }

    // Remove and remake existing devices, mixer_device and clip_slots
    this.patcher.remove(this.patcher.getnamed('devices_list'))
    this.patcher.remove(this.patcher.getnamed('mixer_device'))
    this.patcher.remove(this.patcher.getnamed('clip_slot_list'))
    
    fillLabel(apiObject)
    createDevicelist(apiObject, scriptingPath)
    createMixerDevice(scriptingPath)

    if (path !== 'master_track') {
      createClipSlotsContainer(scriptingPath)
    }

    outlet(0, 'id ' + apiObject.id)
  }
}

function fillLabel (apiObject) {
  "use strict"

  var maxTrackColor
  var trackUi = this.patcher.getnamed('track_ui')
  var trackName = apiObject.get('name')[0]
  var trackColor = apiObject.get('color')[0]

  if (trackColor === 0) {
    maxTrackColor = [.59, .59, .59, 1]
  } else {
    maxTrackColor = [(trackColor >> 16 & 255) / 255, (trackColor >> 8 & 255) / 255, (trackColor & 255) / 255, 1.0]
  }
  trackUi.message('text', trackName.substring(0, 25))
  trackUi.message('bgcolor', maxTrackColor)
}


function createMixerDevice (scriptingPath) {
  "use strict"

  var mixerDevicePatch = this.patcher.newdefault(200, 200, 'bpatcher', 'mixer_device.maxpat', '@args', '/' + scriptingPath + '/mixer_device', '@presentation', 1, '@border', 1, '@patching_rect', [496, 522, 129, 198], '@presentation_rect', [0, 187, 129, 198], '@varname', 'mixer_device')
  this.patcher.connect(router, 3, mixerDevicePatch, 0)
}


function createClipSlotsContainer (scriptingPath) {
  "use strict"
  
  var clipSlotContainer = this.patcher.newdefault(200, 200, 'bpatcher', 'clip_slots.maxpat', '@args', '/' + scriptingPath, '@presentation', 1, '@enablevscroll', 1, '@border', 1, '@patching_rect', [730, 522, 129, 173], '@presentation_rect', [0, 26, 120, 135], '@varname', 'clip_slot_list')
  this.patcher.connect(router, 3, clipSlotContainer, 0)
  this.patcher.connect(this.patcher.getnamed('playing_index_observer'), 0, clipSlotContainer, 1)
}


function createDevicelist (apiObject, scriptingPath) {
  "use strict"

  if (path === '/live_set/master_track') {
    this.patcher.remove(this.patcher.getnamed('playing_index_observer'))
    this.patcher.remove(this.patcher.getnamed('playing_color_observer'))
    return
  }

  var numDevices = apiObject.get('devices').length / 2
  
  if (numDevices >= 1) {
    var devicesList = this.patcher.newdefault(200, 200, 'bpatcher', 'devices_list.maxpat', '@args', '/' + scriptingPath, '@presentation', 1, '@border', 1, '@patching_rect', [932, 522, 210 * numDevices, 173], '@presentation_rect', [0, 400, 110, 188], '@enablehscroll', true, '@varname', 'devices_list')
    this.patcher.connect(router, 3, devicesList, 0)
  }
}



