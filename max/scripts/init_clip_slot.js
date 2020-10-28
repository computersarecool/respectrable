inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    var apiObject = new LiveAPI(path.split('/').join(' '))

    this.patcher.remove(this.patcher.getnamed('clip'))

    if (apiObject.get('has_clip')[0]) {
      this.patcher.newdefault(200, 200, 'bpatcher', 'live_clip.maxpat', '@args', path + '/clip', '@presentation', 1, '@patching_rect', [726, 224, 125, 33], '@presentation_rect', [0, 0, 144, 26], '@varname', 'clip')
    }

    outlet(0, 'id ' + apiObject.id)
  }
}
