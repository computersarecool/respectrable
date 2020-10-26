inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]
var knobWidth = 54
var knobHeight = 86

function anything () {
  'use strict'

  if (messagename === 'bang') {
    makeParameters()

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

function makeParameters () {
  var apiObject = new LiveAPI(path.split('/').join(' '))
  var parameters = apiObject.get('parameters').filter(function (element) {
    return element !== 'id'
  })

  this.patcher.apply(removeParameters)
  this.patcher.getnamed('deviceLabel').message('set', apiObject.get('name'))

  // Skip Device on (first) and Chain Selector (last)
  for (var j = 1; j < parameters.length - 1; j += 1) {
    var i = j - 1
    var xOffset = knobWidth * (i % 4)
    var yOffset = Math.floor(i / 4) * knobHeight
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_device_parameter.maxpat', '@args', path + '/parameters/' + i, '@presentation', 1, '@patching_rect', [19 + xOffset, 525 + yOffset, 52, knobHeight], '@presentation_rect', [5 + xOffset, 19 + yOffset, 52, knobHeight], '@varname', 'parameter' + i)
  }
}
