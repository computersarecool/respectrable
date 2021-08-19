/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    recreateChildren()

    var apiObject = new LiveAPI(path.split('/').join(' '))
    outlet(0, 'id ' + apiObject.id)
  } else if (messagename === 'tracks') {
    recreateChildren()
  }
}

function recreateChildren () {
  'use strict'

  var trackSpacing = 50
  var apiSong = new LiveAPI('live_set')
  var numTracks = apiSong.getcount('tracks')
  var numReturns = apiSong.getcount('return_tracks')

  this.patcher.remove(this.patcher.getnamed('tracks'))
  this.patcher.remove(this.patcher.getnamed('return_tracks'))
  this.patcher.remove(this.patcher.getnamed('master_track'))

  if (numTracks) {
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_tracks.maxpat', '@args', '/live_set/tracks',
      '@presentation', 1, '@patching_rect', [530, 166, 121 * numTracks, 595],
      '@presentation_rect', [0, 0, 121 * numTracks, 595], '@varname', 'tracks')
  }

  if (numReturns) {
    this.patcher.newdefault(200, 200, 'bpatcher', 'live_tracks.maxpat', '@args', '/live_set/return_tracks',
      '@presentation', 1, '@patching_rect', [630 + trackSpacing + 121 * numTracks, 166, 121 * numReturns, 595],
      '@presentation_rect', [trackSpacing + 121 * numTracks, 0, 121 * numReturns, 595], '@varname', 'return_tracks')
  }

  // Master track
  this.patcher.newdefault(200, 200, 'bpatcher', 'live_track.maxpat', '@args', '/live_set/master_track',
    '@presentation', 1, '@border', 1, '@patching_rect', [630 + trackSpacing + 121 * numTracks + 121 * numReturns, 166, 121, 595],
    '@presentation_rect', [trackSpacing + 121 * numTracks + 121 * numReturns, 0, 121, 595], '@varname', 'master_track')
}
