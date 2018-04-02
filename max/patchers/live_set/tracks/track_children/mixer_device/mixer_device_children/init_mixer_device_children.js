outlets = 1
autowatch = 1

var path = jsarguments[1]
var router = this.patcher.getnamed('mixerDeviceChildRouter')

function removeSends (maxObj) {
  "use strict"

  // Master and return tracks don't have sends
  if (maxObj && maxObj.varname.substring(0, 5) === 'sends') {
    this.patcher.remove(maxObj)
  }
  return true
}

function makeChildren () {
  "use strict"

  var i
  var sends
  var apiId
  var sendsPatch
  var panningPatch
  var volumePatch
  var trackActivatorPatch
  var numSends = 0
  var knobWidth = 34
  var splitPath = path.split('/')
  var pathArray = splitPath.join(' ')
  var apiMixerDevice = new LiveAPI(pathArray)
  var trackIndex = parseInt(splitPath[splitPath.length - 2]) + 1 + ''

  // Master track doesn't have sends
  sends = apiMixerDevice.get('sends')
  if (sends[0]) {
    for (i = 0; i < sends.length / 2; i += 1) {
      sendsPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'sends.maxpat', '@args', path + '/sends/' + i, i, '@presentation', 1, '@patching_rect', [210 + i * knobWidth, 145, knobWidth, 39], '@presentation_rect', [knobWidth * (i % 2), knobWidth / 2 * i + (i / 2 * 5), knobWidth, 39], '@varname', 'sends' + i)
      this.patcher.connect(router, 3, sendsPatch, 0)
      numSends += 1
    }
  }

  // Set some default spacing
  if (!numSends) {
    numSends = 2
  }

  this.patcher.remove(this.patcher.getnamed('panning'))
  panningPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'panning.maxpat', '@args', path + '/panning', '@presentation', 1, '@patching_rect', [42, 145, knobWidth, knobWidth], '@presentation_rect', [5, numSends / 2 * knobWidth * 2, knobWidth, knobWidth], '@varname', 'panning')
  this.patcher.connect(router, 0, panningPatch, 0)

  this.patcher.remove(this.patcher.getnamed('trackActivator'))
  // Only create actvivator bpatch if this is not the master track
  if (path !== '/live_set/master_track/mixer_device') {
    trackActivatorPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'track_activator.maxpat', '@args', path + '/track_activator', trackIndex, '@presentation', 1, '@patching_rect', [98, 145, 25, 25], '@presentation_rect', [10, numSends / 2 * knobWidth * 3, 25, 25], '@varname', 'trackActivator')
    this.patcher.connect(router, 1, trackActivatorPatch, 0)
  }

  this.patcher.remove(this.patcher.getnamed('volume'))
  volumePatch = this.patcher.newdefault(200, 200, 'bpatcher', 'mixer_device_volume.maxpat', '@args', path + '/volume', '@presentation', 1, '@patching_rect', [154, 145, 19, 100], '@presentation_rect', [knobWidth + 5, knobWidth * numSends, 19, 100], '@varname', 'volume')
  this.patcher.connect(router, 2, volumePatch, 0)
}

function anything () {
  "use strict"
  
  if (messagename === 'bang') {
    this.patcher.apply(removeSends)
    makeChildren()
  }
}