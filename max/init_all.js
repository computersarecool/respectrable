autowatch = 1

// This function is called by the live.thisdevice in Max when the Live API is ready
// Remove and recreate the live_set patch
function anything () {
  'use strict'
 
  if (messagename === 'bang') {
    var liveSetPatch = this.patcher.getnamed('live_set')
    
    if (liveSetPatch) {
      this.patcher.remove(liveSetPatch);
    }

    this.patcher.newdefault(200, 200, 'bpatcher', 'live_set.maxpat', '@args', '/live_set', '@presentation', 1, '@enablevscroll', 1, '@enablehscroll', 1, '@patching_rect', [33.5, 232, 1200, 591], '@presentation_rect', [0, 0, 613, 169], '@varname', 'live_set')
    outlet(0, 'bang')
  }
}

