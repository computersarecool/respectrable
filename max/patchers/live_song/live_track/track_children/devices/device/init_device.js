autowatch = 1
outlets = 8

var path = jsarguments[1]

function removeParameters (maxObj) {
  'use strict'
  
  if (maxObj.varname.substring(0, 6) === 'parame') {
    this.patcher.remove(maxObj)
  }
}

function makeParameters () {
  var dial
  var apiParameter
  var parameterPatch
  var charIndex
  var apiObject = new LiveAPI(path.split('/').join(' '))
  var parameters = apiObject.get('parameters').filter(function (element) {
    return element !== 'id'
  })

  this.patcher.apply(removeParameters)

  for (var i = 1; i < parameters.length; i += 1) {
    if (i < 9) {
      charIndex = String.fromCharCode(96 + i)
      apiParameter = new LiveAPI('id ' + parameters[i])
      dial = this.patcher.getnamed(charIndex)
      parameterPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'device_parameter.maxpat', '@args', path + '/parameters/' + (i - 1), charIndex, '@presentation', 0, '@patching_rect', [19 + 54 * (i - 1), 378, 42, 164], '@presentation_rect', [0, 0, 0, 0], '@varname', 'parameter' + (i - 1))
      this.patcher.connect(parameterPatch, 0, dial, 0)
      this.patcher.connect(dial, 0, parameterPatch, 0)
      this.patcher.connect(this.patcher.getnamed('router'), i - 1, parameterPatch, 1)
      this.patcher.connect(this.patcher.getnamed('js'), i - 1, parameterPatch, 2)
      outlet(i - 1, 'id ' + parameters[i])
    }
  }
  this.patcher.getnamed('deviceLabel').message('set', apiObject.get('name'))
}

function anything () {
  'use strict'

  if (messagename === 'bang') {
    makeParameters()
  }
}
