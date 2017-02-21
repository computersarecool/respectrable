autowatch = 1;
var parentPath = jsarguments[1];
var router = this.patcher.getnamed('clipSlotsRouter');


function removeClipSlots (maxObj) {
  "use strict";
  if (maxObj.varname.substring(0, 9) === 'clip_slot') {
    this.patcher.remove(maxObj);
    return true;
  }
}


function createClipSlots () {
  "use strict";
  var i;
  var index;
  var clipSlotPatch;
  var trackApi = new LiveAPI(parentPath.split('/').join(' '));
  var clipSlots = trackApi.get('clip_slots');

  // Master and return tracks do not have clip slots
  if (!clipSlots[0]) {
    return;
  }

  for (i = 0; i < clipSlots.length / 2; i += 1) {
    clipSlotPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'clip_slot.maxpat', '@args', parentPath + '/clip_slots/' + i, i, '@presentation', 1, '@patching_rect', [128 + (i - 1) * 103, 462, 105, 32], '@presentation_rect', [0, 22 * i, 120, 22], '@varname', 'clip_slot_' + i);
    this.patcher.connect(router, 0, clipSlotPatch, 0);
    this.patcher.connect(this.patcher.getnamed('playingIndex'), 0, clipSlotPatch, 1);
  }
}


function anything () {
  "use strict";
  if (messagename === 'bang') {
    this.patcher.apply(removeClipSlots);
    createClipSlots();
  }
}
