autowatch = 1;
var path = jsarguments[1];
var router = this.patcher.getnamed('routerForDevices');


function removeDevices (maxObj) {
  "use strict";
  if (maxObj.varname.substring(0, 6) === 'device') {
    this.patcher.remove(maxObj);
    return true;
  }
}


function getDevices () {
  "use strict";
  var i;
  var devicePatch;
  var apiObject = new LiveAPI(path.split('/').join(' '));
  var devices = apiObject.get('devices').filter(function (element) {
    return element !== 'id';
  });
  
  this.patcher.apply(removeDevices);
  
  // Return if no devices or the master track
  if (!devices[0] || apiObject.unquotedpath == 'live_set master_track') {
    return;
  }

  for (i = 0; i < devices.length; i += 1) {
    devicePatch = this.patcher.newdefault(200, 200, 'bpatcher', 'device.maxpat', '@args', path + '/devices/' + i, i, '@presentation', 1, '@patching_rect', [33 + 227 * i, 194, 203, 175], '@presentation_rect', [i * 215, 0, 203, 175], '@varname', 'device' + i);
    this.patcher.connect(router, 0, devicePatch, 0);
  }
}


function anything () {
  "use strict";
  if (messagename === 'bang') {
    this.patcher.apply(removeDevices);
    getDevices();
  }
}
