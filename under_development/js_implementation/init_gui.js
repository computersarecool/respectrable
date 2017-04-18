inlets = 1;
outlets = 5;
settingsFilePath = '..\\..\\settings.json';

function filterIds (ids) {
  var filtered = ids.filter(function (id) {
    return id !== 'id';
  }).map(function (id) {
    return new LiveAPI('id ' + id).unquotedpath;
  });
  return filtered;
}

function getImportantInfo (path, obj, props, addAschild, subkey) {
  var tempObj = {};
  var apiObj = new LiveAPI(path);
  // Check to make sure it is a valid id
  if (apiObj.id === '0') {
    return null;
  }

  // Every object's name is gotten
  var name = apiObj.get('name')[0];
  
  // Add non 'getable' properties
  tempObj.id = apiObj.id;
  tempObj.path = apiObj.unquotedpath;
  tempObj.name = name;

  // Add each property to property array
  for (var j = 0; j < props.length; j++) {
    var vals = apiObj.get(props[j]);
    if (vals.length === 1) {
      tempObj[props[j]] = vals[0];
    } else {
      tempObj[props[j]] = vals;
    }
  }
  
  // Add property as object value or add to the child array
  if (addAschild) {
    if (obj.children) {
      if (subkey) {
        if (obj.children[subkey]) {
          obj.children[subkey].push(tempObj);
        } else {
          obj.children[subkey] = [tempObj]
        }
      } else {
        obj.children[name] = tempObj;
      }
    } else {
      obj.children = {};
      obj.children[name] = tempObj;
    }
  } else {
    obj = tempObj;
  }
  return obj;
}

function getTrackInfo (path, settings) {
  // Get Track information
  // Debug skip if not an audio track
  if (!settings.trackProperties) {
    return {};
  }

  var trackProps = settings.trackProperties;
  var trackInfo = getImportantInfo(path, {}, trackProps);

  // Get MixerDevice information
  var mixerDeviceProps = settings.mixerDeviceProperties;
  var mixerDeviceParams = settings.mixerDeviceParameters;
  for (var i = 0; i < mixerDeviceParams.length; i++) {
    getImportantInfo(path + ' mixer_device ' + mixerDeviceParams[i], trackInfo, mixerDeviceProps, true);
  }

  // Get Clip information
  var clipCount = new LiveAPI(path).getcount('clip_slots');
  var clipProps = settings.clipProperties;
  for (var h = 0; h < clipCount; h++) {
    getImportantInfo(path + ' clip_slots ' + h + ' clip', trackInfo, clipProps, true, 'clips');
  }

  // Get Device information
  var devices = [];
  var deviceCount = new LiveAPI(path).getcount('devices');
  for (var g = 0; g < deviceCount; g++) {
    var deviceObject = {parameters: []};
    var apiDevice = new LiveAPI(path + ' devices ' + g);
    var parameterCount = apiDevice.getcount('parameters');
    deviceObject.id = apiDevice.id;
    deviceObject.path = apiDevice.unquotedpath;
    deviceObject.name = apiDevice.get('name')[0];

    // Get DeviceParameter information
    for (var f = 0; f < parameterCount; f++) {
      var parameterObj = {};
      var apiParameter = new LiveAPI(deviceObject.path + ' parameters ' + f);
      parameterObj.id = apiParameter.id;
      parameterObj.path = apiParameter.unquotedpath;
      parameterObj.name = apiParameter.get('name')[0];
      parameterObj.value = apiParameter.get('value')[0];
      deviceObject.parameters.push(parameterObj);
    }
    devices.push(deviceObject);
  }
  trackInfo.children.devices = devices;
  return trackInfo;   
}

function readSettings (filePath) {
  var settingsString = '';
  var inFile = new File(filePath, 'read', 'JSON');
    
  if (inFile.isopen) {
    while (inFile.position < inFile.eof) {
      settingsString += inFile.readstring(800);
    }
    inFile.close();
    return JSON.parse(settingsString);
  } else {
    throw new Error('Could not read JSON file');
  }
}

function makeMaxUI (setObj) {
  // Create the track Max UI "observers"
  var trackPatch;
  var bPatcherX = 33;
  var bPatcherY = 18;
  var bPatcherYP = 350;
  var bPatcherW = 121;
  var bPatcherH = 416;
  var jsPatch = this.patcher.getnamed('jsinit');
  var spacingIndex = 0;

  // Remove old tracks
  for (var i = 0; i < 20; i++) {
    this.patcher.remove(this.patcher.getnamed('track_' + i));
    this.patcher.remove(this.patcher.getnamed('returntrack' + i));
  }

  // Create track Max GUI objects
  for (var i = 0; i < setObj.tracks.length; i++) {
    var currentTrack = setObj.tracks[i];
    if (currentTrack.has_midi_input) {
      //TODO:
      // Create a midi track bPatcher
      trackPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'midi_track.maxpat', '@args', i, '@presentation', 1, '@patching_rect', [bPatcherX + (i  * bPatcherW), bPatcherYP, bPatcherW, bPatcherH], '@presentation_rect', [bPatcherX + (i  * bPatcherW), bPatcherY, bPatcherW, bPatcherH], '@varname', 'track_' + i);
    } else {
      // Create an audio track bPatcher
      trackPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'audio_track.maxpat', '@args', i, '@presentation', 1, '@patching_rect', [bPatcherX + (i * bPatcherW), bPatcherYP, bPatcherW, bPatcherH], '@presentation_rect', [bPatcherX + (i * bPatcherW), bPatcherY, bPatcherW, bPatcherH], '@varname', 'track_' + i);
      this.patcher.connect(jsPatch, 0, trackPatch, 0);
    }
    ++spacingIndex;
  }

  // Create return track gui objects
  for (var i = 0; i < setObj.returnTracks.length; i++) {
    trackPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'midi_track.maxpat', '@args', i, '@presentation', 1, '@patching_rect', [bPatcherX + (spacingIndex  * bPatcherW), bPatcherYP, bPatcherW, bPatcherH], '@presentation_rect', [bPatcherX + (spacingIndex  * bPatcherW), bPatcherY, bPatcherW, bPatcherH], '@varname', 'track_' + i);
    ++spacingIndex;
  }
  //TODO:
  // Create master track gui object
  trackPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'midi_track.maxpat', '@args', i, '@presentation', 1, '@patching_rect', [bPatcherX + (spacingIndex  * bPatcherW), bPatcherYP, bPatcherW, bPatcherH], '@presentation_rect', [bPatcherX + (spacingIndex  * bPatcherW), bPatcherY, bPatcherW, bPatcherH], '@varname', 'track_' + i);
}

function bang () {
  // Read the settings file and create the settings object
  var globalSettings = readSettings(settingsFilePath);
  var liveProperties = globalSettings.LiveProperties;
  var setApi = new LiveAPI('live_set');
  var setObj = {
    tracks: [],
    returnTracks: [],
    masterTrack: null,
  };

  // Get all set properties
  for (var i = 0; i < liveProperties.setProperties.length; i++) {
    var property = liveProperties.setProperties[i];
    setObj[property] = setApi.get(property)[0];
  }
  
  // Get all track information
  var trackIds = setApi.get('tracks');
  var trackPaths = filterIds(trackIds);
  for (var i = 0; i < trackPaths.length; i++) {
    setObj.tracks.push(getTrackInfo(trackPaths[i], liveProperties));
  }
  
  //TODO:
  // Get all return track information
  var returnTrackIds = setApi.get('return_tracks');
  var returnTrackPaths = filterIds(returnTrackIds);
  for (var i = 0; i < returnTrackPaths.length; i++) {
    setObj.returnTracks.push(getTrackInfo(returnTrackPaths[i], liveProperties));
  }
  
  //TODO:
  // Get all master track information
  var masterTrackId = setApi.get('master_track');
  var masterTrackPath = filterIds(masterTrackId);
  setObj.masterTrack = getTrackInfo(masterTrackPath, {});

  // Make the UI Objects
  makeMaxUI(setObj);

  // Set ports and output data
  function changePort (port) {
    outlet(4, 'incoming', 'port', port);
    outlet(3, JSON.stringify(setObj));
    outlet(2, 'allData');
    outlet(1, '/live_set'); 
    outlet(0, 'bang');
  }

  outlet(4, 'outgoing', 'port', globalSettings.maxOutgoingPort);
  outlet(4, 'incoming', 'port', globalSettings.maxTempIncomingPort);
  var task = new Task(changePort, this, globalSettings.maxIncomingPort);
  task.schedule(200);
}
