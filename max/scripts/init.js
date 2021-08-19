/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

// Remove and recreate live_set patch
function anything () {
  'use strict'

  if (messagename === 'bang') {
    this.patcher.remove(this.patcher.getnamed('live_set'))

    this.patcher.newdefault(200, 200, 'bpatcher', 'live_song.maxpat', '@args', '/live_set', '@presentation', 1,
      '@enablevscroll', 1, '@enablehscroll', 1, '@patching_rect', [33.5, 232, 1200, 591],
      '@presentation_rect', [0, 0, 613, 169], '@varname', 'live_set')

    outlet(0, 'bang')
  }
}
