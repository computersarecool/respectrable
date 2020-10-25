inlets = 1
outlets = 1
autowatch = 1

function anything () {
  "use strict"

  if (messagename === 'bang') {
    this.patcher.remove(this.patcher.getnamed('tracks_list'))
    this.patcher.remove(this.patcher.getnamed('return_tracks_list'))
    this.patcher.remove(this.patcher.getnamed('master_track'))

    makeTracks()

    var path = jsarguments[1]
    var apiSet = new LiveAPI(path.split('/').join(' '))

    outlet(0, 'id ' + apiSet.id)  
  }
}

function makeTracks () {
  "use strict"
  
  var router = this.patcher.getnamed('setRouter')
  var spaceOffset = 50
  var apiSong = new LiveAPI('live_set')
  var numTracks = Math.floor(apiSong.get('tracks').length / 2)
  var numReturns = Math.floor(apiSong.get('return_tracks').length / 2)

  if (numTracks) {
    var tracksListPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'tracks.maxpat', '@args', '/live_set/tracks', '@presentation', 1, '@patching_rect', [530, 166, 121 * numTracks, 591], '@presentation_rect', [0, 0, 121 * numTracks, 591], '@varname', 'tracks_list')
    this.patcher.connect(router, 3, tracksListPatch, 0)
  }

  if (numReturns) {
    var returnTracksListPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'tracks.maxpat', '@args', '/live_set/return_tracks', '@presentation', 1, '@patching_rect', [630 + spaceOffset + 121 * numTracks, 166, 121 * numReturns, 591], '@presentation_rect', [spaceOffset + 121 * numTracks, 0, 121 * numReturns, 591], '@varname', 'return_tracks_list')
    this.patcher.connect(router, 3, returnTracksListPatch, 0)
  }

  
  var masterTrack = this.patcher.newdefault(200, 200, 'bpatcher', 'track.maxpat', '@args', '/live_set/master_track', '@presentation', 1, '@border', 1, '@patching_rect', [630 + spaceOffset + 121 * numTracks + 121 * numReturns, 166, 121, 591], '@presentation_rect', [spaceOffset + 121 * numTracks + 121 * numReturns, 0, 121, 591], '@varname', 'master_track')
  this.patcher.connect(router, 3, masterTrack, 0)
}