/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]
var scriptingBaseName = 'clip_slot'

function anything () {
  'use strict'

  if (messagename === 'bang') {
    recreateClipSlots()
  }
}

function removeClipSlots (maxObj) {
  'use strict'

  if (maxObj.varname.substring(0, scriptingBaseName.length) === scriptingBaseName) {
    this.patcher.remove(maxObj)
    return true
  }
}

function recreateClipSlots () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var numClipSlots = apiObject.getcount('clip_slots')

  this.patcher.apply(removeClipSlots)

  if (numClipSlots) {
    for (var i = 0; i < numClipSlots; i += 1) {
      this.patcher.newdefault(200, 200, 'bpatcher', 'live_clip_slot.maxpat', '@args', path + '/clip_slots/' + i, i,
        '@presentation', 1, '@patching_rect', [128 + (i - 1) * 103, 462, 105, 32], '@presentation_rect', [0, 22 * i, 120, 22],
        '@varname', 'clip_slot_' + i)
    }
  }
}
