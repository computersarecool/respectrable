inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]
var scriptingBaseName = 'device'

function anything () {
  'use strict'

  if (messagename === 'bang') {
    makeDevices()
  }
}

function removeDevices (maxObj) {
  'use strict'

  if (maxObj.varname.substring(0, 6) === scriptingBaseName) {
    this.patcher.remove(maxObj)
    return true
  }
}

function makeDevices () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var numDevices = apiObject.getcount('devices')

  this.patcher.apply(removeDevices)

  if (numDevices) {
    for (var i = 0; i < numDevices; i += 1) {
      this.patcher.newdefault(200, 200, 'bpatcher', 'live_device.maxpat', '@args', path + '/devices/' + i, i, '@presentation', 1, '@patching_rect', [33 + 227 * i, 194, 219, 188], '@presentation_rect', [i * 215, 0, 220, 188], '@varname', scriptingBaseName + i)
    }
  }
}
