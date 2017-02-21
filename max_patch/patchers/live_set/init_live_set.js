inlets = 1;
outlets = 1;
autowatch = 1;
var path = jsarguments[1];
var router = this.patcher.getnamed('setRouter');


function makeAllTrackTypes () {
  "use strict";
  var tracksListPatch;
  var returnTracksListPatch;
  var masterTrack;
  var spaceOffset = 50;
  var apiSong = new LiveAPI('live_set');
  var numTracks = apiSong.get('tracks').length / 2;
  var numReturns = apiSong.get('return_tracks').length / 2;

  tracksListPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'tracks.maxpat', '@args', '/live_set/tracks', '@presentation', 1, '@patching_rect', [312, 166, 121 * numTracks, 591], '@presentation_rect', [0, 0, 121 * numTracks, 591], '@varname', 'tracks_list');
  this.patcher.connect(router, 3, tracksListPatch, 0);
  
  returnTracksListPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'tracks.maxpat', '@args', '/live_set/return_tracks', '@presentation', 1, '@patching_rect', [412 + spaceOffset + 121 * numTracks, 166, 121 * numReturns, 591], '@presentation_rect', [spaceOffset + 121 * numTracks, 0, 121 * numReturns, 591], '@varname', 'return_tracks_list');
  this.patcher.connect(router, 3, returnTracksListPatch, 0);
  
  masterTrack = this.patcher.newdefault(200, 200, 'bpatcher', 'track.maxpat', '@args', '/live_set/master_track', '@presentation', 1, '@border', 1, '@patching_rect', [412 + spaceOffset + 121 * numTracks + 121 * numReturns, 166, 121, 591], '@presentation_rect', [spaceOffset + 121 * numTracks + 121 * numReturns, 0, 121, 591], '@varname', 'master_track');
  this.patcher.connect(router, 3, masterTrack, 0);
}


function anything () {
  "use strict";
  var apiSet;

  if (messagename === 'bang') {
    this.patcher.remove(this.patcher.getnamed('tracks_list'));
    this.patcher.remove(this.patcher.getnamed('return_tracks_list'));
    this.patcher.remove(this.patcher.getnamed('master_track'));
    makeAllTrackTypes();
    apiSet = new LiveAPI(path.split('/').join(' '));
    outlet(0, 'id ' + apiSet.id);  
  }
}
