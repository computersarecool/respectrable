/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]
var scriptingName = 'track'

function anything () {
  'use strict'

  if (messagename === 'bang') {
    recreateChildren()
  }
}

function removeTracks (maxObj) {
  'use strict'

  if (maxObj.varname.substring(0, 5) === scriptingName) {
    this.patcher.remove(maxObj)
    return true
  }
}

function recreateChildren () {
  'use strict'

  var trackIds
  var trackpath = 'live_track.maxpat'
  var liveSet = new LiveAPI('live_set')

  this.patcher.apply(removeTracks)

  // Get id and track type
  if (path === '/live_set/tracks') {
    trackIds = liveSet.get('tracks').filter(function (element) {
      return element !== 'id'
    })
  } else if (path === '/live_set/return_tracks') {
    trackpath = 'live_track_no_clips.maxpat'
    trackIds = liveSet.get('return_tracks').filter(function (element) {
      return element !== 'id'
    })
  }

  if (trackIds) {
    for (var i = 0; i < trackIds.length; i += 1) {
      var currentTrack = new LiveAPI('id ' + trackIds[i])

      this.patcher.newdefault(200, 200, 'bpatcher', trackpath, '@args', '/' + currentTrack.unquotedpath.split(' ').join('/'),
        i, '@presentation', 1, '@border', 1, '@patching_rect', [i * 121 + (i * 30) + 20, 176, 121, 595], '@presentation_rect',
        [i * 121, 0, 121, 595], '@varname', scriptingName + i)
    }
  }
}
