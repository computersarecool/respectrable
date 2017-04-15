autowatch = 1;
var path = jsarguments[1];
var router = this.patcher.getnamed('mixerDeviceRouter');

function getChildren () {
  "use strict";
  var mixerDeviceChildrenPatch;

  mixerDeviceChildrenPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'mixer_device_children.maxpat', '@args', path, '@presentation', 1, '@patching_rect', [42, 191, 100, 250], '@presentation_rect', [20, 1, 100, 250], '@varname', 'mixer_device_children');
  this.patcher.connect(router, 0, mixerDeviceChildrenPatch, 0);
}

function anything () {
  "use strict";
  if (messagename === 'bang') {
    this.patcher.remove(this.patcher.getnamed('mixer_device_children'));
    getChildren();
  }
}
