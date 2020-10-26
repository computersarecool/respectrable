inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    makeChildren()
  }
}

function removeSends (maxObj) {
  'use strict'

  if (maxObj.varname.substring(0, 5) === 'sends') {
    this.patcher.remove(maxObj)
  }
  return true
}

function makeChildren () {
  'use strict'

  var knobWidth = 34
  var splitPath = path.split('/')
  var pathArray = splitPath.join(' ')
  var apiMixerDevice = new LiveAPI(pathArray)
  var trackIndex = parseInt(splitPath[splitPath.length - 2]) + 1 + ''

  // Remove and create sends
  this.patcher.apply(removeSends)
  var numSends = apiMixerDevice.getcount('sends')
  for (var i = 0; i < numSends; i += 1) {
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_device_parameter_send.maxpat', '@args', path + '/sends/' + i, i, '@presentation', 1, '@patching_rect', [1000 + i * knobWidth, 145, knobWidth, 39], '@presentation_rect', [knobWidth * (i % 2), knobWidth / 2 * i + (i / 2 * 5), knobWidth, 39], '@varname', 'sends' + i)
  }

  // Set default spacing
  if (!numSends) {
    numSends = 2
  }

  // Remove and create panning
  this.patcher.remove(this.patcher.getnamed('panning'))
  this.patcher.newdefault(200, 200, 'bpatcher', 'live_device_parameter_panning.maxpat', '@args', path + '/panning', '@presentation', 1, '@patching_rect', [900, 145, knobWidth, knobWidth], '@presentation_rect', [5, numSends / 2 * knobWidth * 2, knobWidth, knobWidth], '@varname', 'panning')

  // Remove and create activator if not master track
  this.patcher.remove(this.patcher.getnamed('trackActivator'))
  if (path !== '/live_set/master_track/mixer_device') {
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_device_parameter_activator.maxpat', '@args', path + '/track_activator', trackIndex, '@presentation', 1, '@patching_rect', [800, 145, 25, 25], '@presentation_rect', [10, numSends / 2 * knobWidth * 3, 25, 25], '@varname', 'trackActivator')
  }

  // Remove and create volume
  this.patcher.remove(this.patcher.getnamed('volume'))
  this.patcher.newdefault(200, 200, 'bpatcher', 'live_device_parameter_volume.maxpat', '@args', path + '/volume', '@presentation', 1, '@patching_rect', [700, 145, 19, 100], '@presentation_rect', [knobWidth + 5, knobWidth * numSends, 19, 100], '@varname', 'volume')
}
