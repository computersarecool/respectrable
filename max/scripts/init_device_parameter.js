inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    var apiObject = new LiveAPI(path.split('/').join(' '))

    // Every parameter except on / off has a label
    var label = this.patcher.getnamed('label')
    if (label) {
      label.message('set', apiObject.get('name'))
    }
    outlet(0, 'id ' + apiObject.id)
  }
}
