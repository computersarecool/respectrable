inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]
var scriptingName = 'device'

function anything () {
  'use strict'

  if (messagename === 'bang') {
    makeDevices()

    var apiObject = new LiveAPI(path.split('/').join(' '))

    outlet(0, 'id ' + apiObject.id)
  }
}

function removeDevices (maxObj) {
  'use strict'

  if (maxObj.varname.substring(0, 6) === scriptingName) {
    this.patcher.remove(maxObj)
    return true
  }
}

function makeDevices () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var numDevices = apiObject.getcount('devices')

  this.patcher.apply(removeDevices)

  // Return if no devices or the master track
  if (!numDevices || apiObject.unquotedpath === 'live_set master_track') {
    return
  }

  for (var i = 0; i < numDevices; i += 1) {
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_device.maxpat', '@args', path + '/devices/' + i, i, '@presentation', 1, '@patching_rect', [33 + 227 * i, 194, 203, 175], '@presentation_rect', [i * 215, 0, 203, 175], '@varname', scriptingName + i)
  }
}
