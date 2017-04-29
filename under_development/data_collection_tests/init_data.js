autowatch = 1;

var propertiesToGet = {
   Application: {
    functions: [

    ]
  },
  Song: {
    properties: [
    'clip_trigger_quantization',
    'tempo',
    ],
    functions: [

    ],
  },
  Track: {
    properties: [
    'color',
    'name',
    ],
    functions: [

    ],
  },
  Device: {
    properties: [
    'name',
    'value',
    ],
    functions: [

    ]
  },
  MixerDevice: {
    properties: [
    'name',
    'value',
    ],
    functions: [

    ]
  },	
  DeviceParameter: {
    properties: [
    'name',
    'value',
    ],
    functions: [

    ]
  },
  Clip: {
    properties: [
    'name',
    'value',
    ],
    functions: [

    ]
  }
}


var LOM = {
	live_app: null,
	live_set: {
    children: [
    'tracks',
    'return_tracks',
    'master_track'
    ]
  }
}


function bang () { 
  var apiObj;
  var type;
  var dataHolder;
  var objects = Object.keys(propertiesToGet);
  var dataObj = {live_set: {}};

  LOM['live_set']['children'].forEach(function (child) {
    post(child);
    apiObj = new LiveAPI('live_set ' + child);
    type = apiObj.type;
    post(apiObj.unqotedpath);
    post();
    if (objects.indexOf(type) > -1) {
      dataHolder = {};
      propertiesToGet[type].properties.forEach(function (prop) {
        dataHolder[prop] = apiObj.get(prop);
      });
      dataObj['live_set'][apiObj.path] = dataHolder;
    }
  });
  post(JSON.stringify(dataObj, null, 2));
}