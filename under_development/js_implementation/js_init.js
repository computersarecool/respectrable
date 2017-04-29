// Initialize everything
function initialize (settings) {
  "use strict";
  var parameterIds;
  var liveProperties = settings.LiveProperties;
  
  changePort('incomingmessage', settings.networking.goingToMaxMessage.port);
  changePort('incomingchannel', settings.networking.goingToMaxChannel.port);

  //Observe all set properties
  setupObservers('live_set', '', liveProperties.setProperties);

  // Observe all track properties
  setupObservers('live_set', 'tracks', liveProperties.trackProperties);

  // Observe clip properties
  observeChildren('live_set', 'tracks', 'clip_slots', 'clip', liveProperties.clipProperties);

  // Observe devices and get parameters
  parameterIds = observeDevices('live_set', 'tracks', 'devices' , liveProperties.deviceProperties);
  observeParameters(parameterIds, liveProperties.deviceParameterProperties);

  // Observe all return track properties
  setupObservers('live_set', 'return_tracks', liveProperties.trackProperties);

  // Observe all master track properties
  setupObservers('live_set', 'master_track', liveProperties.masterTrackProperties);
}


// Setup an observer function for each child of an element
function setupObservers (lomPath, subPath, properties) {
  "use strict";
  var i;
  var ids;
  var id;
  var apiObj = new LiveAPI(lomPath);

  if (subPath) {
    ids = apiObj.get(subPath);
    for (i = 0; i < ids.length - 1; i += 2) {
      id = ids[i] + ' ' + ids[i + 1];
      observeProperties(properties, id, new LiveAPI(id).unquotedpath);
    }
  } else {
    observeProperties(properties, lomPath, apiObj.unquotedpath);
  }
}


// Setup a callback for each specified property of an LOM object
function observeProperties (properties, apiId, apiPath) {
  "use strict";
  var i;
  var observer;

  for (i = 0; i < properties.length; i++) {
    observer = new LiveAPI(observe(apiPath), apiId);
    observer.property = properties[i];
  }
}

//  Setup observers for the children of a specific path
function observeChildren (parentPath, parentKey, thingToGet, finalElement, properties) {
  "use strict";
  var i;
  var j;
  var parentIds;
  var trackPath;
  var parents = consolidateIds(new LiveAPI(parentPath).get(parentKey));

  for (i = 0; i < parents.length; i++) {
    parentIds = consolidateIds(new LiveAPI(parents[i]).get(thingToGet));
    for (j = 0; j < parentIds.length; j++) {
      trackPath = new LiveAPI(parentIds[j]).unquotedpath;
      setupObservers(trackPath + ' ' + finalElement, '', properties);
    }
  }
}


// Observe all devices on a track
function observeDevices (parentPath, parentKey, thingToGet, properties) {
  "use strict";
  var i;
  var j;
  var parentIds;
  var apiObj;
  var parameterIds = [];
  var parents = consolidateIds(new LiveAPI(parentPath).get(parentKey));

  for (i = 0; i < parents.length; i++) {
    parentIds = consolidateIds(new LiveAPI(parents[i]).get(thingToGet));
    for (j = 0; j < parentIds.length; j++) {
      apiObj = new LiveAPI(parentIds[j]);
      setupObservers(apiObj.unquotedpath, '', properties);
      parameterIds = parameterIds.concat(consolidateIds(apiObj.get('parameters')));
    }
  }
  return parameterIds;
}


// Observe all parameters of a device
function observeParameters (ids, properties) {
  "use strict";
  var i;
  var parameterPath;

  for (i = 0; i < ids.length; i++) {
    parameterPath = new LiveAPI(ids[i]).unquotedpath;
    setupObservers(parameterPath, '', properties);
  }
}


// Send a changed property value via an output
function observe (apiPath) {
  "use strict";
  return function (args) {
    outlet(1, '/frommax/' + apiPath.split(' ').join('/') + '/' + args[0]);
    outlet(2, args[1]);
  };
}

// Helpers
// Combine 'id' and number into one item in array
function consolidateIds (idArray) {
  "use strict";
  var i;
  var arr = [];

  // Remove the undefined value added in device array
  for (i = 0; i < idArray.length; i += 2) {
    if (idArray[i]) {
      arr.push(idArray[i] + ' ' + idArray[i + 1]);
    }
  }
  return arr;
}