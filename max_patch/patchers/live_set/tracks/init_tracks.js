autowatch = 1;
outlets = 1;
var router = this.patcher.getnamed('trackRouter');
var path = jsarguments[1];


function removeTracks (maxObj) {
  "use strict";
  if (maxObj.varname.substring(0, 6) === 'track_' || maxObj.varname.substring(0, 6) === 'return' || maxObj.varname.substring(0, 6) === 'master') {
    this.patcher.remove(maxObj);
    return true;
  }
}


function makeTracks () {
  "use strict";
  var i;
  var trackIds;
  var scriptingName;
  var trackPatch;
  var currentTrack;
  var bPatcherYP = 176;
  var bPatcherW = 121;
  var bPatcherH = 591;
  var liveSet = new LiveAPI('live_set');
  
  if (path === '/live_set/tracks') {
    trackIds = liveSet.get('tracks').filter(function (element) {
      return element !== 'id';
    });
    scriptingName = 'tracks_';
  } else if (path === '/live_set/return_tracks') {
    trackIds = liveSet.get('return_tracks').filter(function (element) {
      return element !== 'id';
    });
    scriptingName = 'return_tracks_';
  } else {
    trackIds = liveSet.get('master_track')[1];
    scriptingName = 'master_tracks';
  }

  this.patcher.apply(removeTracks);

  for (i = 0; i < trackIds.length; i += 1) {
    currentTrack = new LiveAPI('id ' + trackIds[i]);
    trackPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'track.maxpat', '@args', '/' + currentTrack.unquotedpath.split(' ').join('/'), i, '@presentation', 1, '@border', 1,  '@patching_rect', [i * bPatcherW + (i * 30) + 20, bPatcherYP, bPatcherW, bPatcherH], '@presentation_rect', [i * bPatcherW, 0, bPatcherW, bPatcherH], '@varname', trackIds.length > 1 ? scriptingName + i : scriptingName);
    this.patcher.connect(router, 0, trackPatch, 0);
  }
}


function anything () {
  "use strict";
  if (messagename === 'bang') {
    if (path === '/live_set/return_tracks') {
      outlet(0, 'return_tracks');
    }
    makeTracks();
  }
}
