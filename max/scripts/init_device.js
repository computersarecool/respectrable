/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    recreateParameters()

    var apiObject = new LiveAPI(path.split('/').join(' '))
    outlet(0, 'id ' + apiObject.id)
  }
}

function removeParameters (maxObj) {
  'use strict'

  if (maxObj.varname.substring(0, 6) === 'parame') {
    this.patcher.remove(maxObj)
  }
}

function recreateParameters () {
  var knobWidth = 54
  var knobHeight = 86
  var apiObject = new LiveAPI(path.split('/').join(' '))

  var parameterIds = apiObject.get('parameters').filter(function (element) {
    return element !== 'id'
  })

  this.patcher.apply(removeParameters)
  this.patcher.getnamed('deviceLabel').message('set', apiObject.get('name'))

  // Skip Device On (first) and Chain Selector (last)
  for (var j = 1; j < parameterIds.length - 1; j += 1) {
    var i = j - 1
    var xOffset = knobWidth * (i % 4)
    var yOffset = Math.floor(i / 4) * knobHeight

    this.patcher.newdefault(200, 200, 'bpatcher', 'live_device_parameter.maxpat', '@args', path + '/parameters/' + j,
      '@presentation', 1, '@patching_rect', [19 + xOffset, 525 + yOffset, 52, knobHeight],
      '@presentation_rect', [5 + xOffset, 19 + yOffset, 52, knobHeight], '@varname', 'parameter' + j)
  }
}
