inlets = 1
outlets = 1
autowatch = 1

var LOM = {
  live_app: {}
}

// Messages will come in the form of "/canonical_path messageType property (value)" where canonical_path is the LiveAPI path with slashes instead of spaces
// canonical_path may also take the form /id/123 where 123 is an example ID
function anything () {
  'use strict'

  // data will be the result returned by the LiveAPI
  var data

  // Split the incoming OSC formatted path into a string with spaces (and remove the first blank returned by the split method)
  var pathArray = messagename.split('/')
  pathArray.shift()
  var path = pathArray.join(' ')
  var apiObj = new LiveAPI(path)
  var messageType = arguments[0]
  var property = arguments[1]
  var value = arguments[2]

  // Call the LiveAPI object with either get, set, propert or call methods and return data (the reponse from the LiveAPI)
  switch (messageType) {
    case  'get':
      data = apiObj.get(property)
      break
    case 'set':
      apiObj.set(property, value)
      // The data returned after this is usually wrong so use the incoming value (ideally it would be set to the returned value)
      data = value
      break
    case 'call':
      data = apiObj.call(property)
      break
    case 'property':
      data = apiObj[property]
      break
    case 'get_state':
      data = getState();
      break      
  }

  // Format and send back the returned data
  outlet(0, '/' + path.split(' ').join('/'), messageType, property, data)
}

function getState () {
  var track_properties = [
    'color'
  ]

  var track_children = [
    {
      base: 'devices',
      properties: [],
      children: []
    },
    {
      base: 'mixer_device',
      properties: [],
      children: []
    },
    {
      base: 'clip_slots',
      properties: [],
      children: []
    } 
  ]

  var live_set = {
    base: 'live_set',
    properties: [
      'clip_trigger_quantization'
    ],
    children: [
      {
        base: 'tracks',
        properties: track_properties,
        children: track_children
      },
      {
        base: 'return_tracks',
        properties: track_properties,
        children: track_children
      },
      {
        base: 'master_track',
        properties: track_properties,
        children: track_children
      }      
    ]
  }

  // Get live_app state
  var live_app_api = new LiveAPI('live_app')
  LOM['live_app'].major_version = live_app_api.call('get_major_version')
  LOM['live_app'].minor_version = live_app_api.call('get_minor_version')
  LOM['live_app'].bugfix_version = live_app_api.call('get_bugfix_version')
  
  // Get live_set state
  getAllChildrenState(live_set, '')

  post(JSON.stringify(LOM))
  return JSON.stringify(LOM)
}

function getAllChildrenState(obj, parentPath) {
  var apiPath = parentPath ? parentPath + ' ' + obj['base'] : obj['base']
  var api = new LiveAPI(apiPath)
  var path = api.unquotedpath.split(' ')

  // Add every property value to LOM
  obj.properties.forEach(function (prop) {
    var value = api.get(prop)
    var propPath = path.slice()
    propPath.push(prop)
    createNestedObject(LOM, propPath, value)
  })
  
  // PICKUP: Get children and call this function
  // Using setPropOnLom
  obj.children.forEach(function (child) {
    var apiChildren = api.get(child['base'])
    properties = child['properties']
    setPropOnLom(apiChildren, properties)
    //getAllChildrenState(child, apiPath)  
  })
}

function setPropOnLom (IDs, properties) {
  for (var i = 0; i < IDs.length; i += 2) {
    var api = new LiveAPI(IDs[i] + ' ' + IDs[i + 1])
    post(api.path)
    post()
  }
}

// Taken from http://stackoverflow.com/questions/5484673/javascript-how-to-dynamically-create-nested-objects-using-object-names-given-by
function createNestedObject(base, names, value) {
    // If a value is given, remove the last name and keep it for later:
    var lastName = arguments.length === 3 ? names.pop() : false;

    // Walk the hierarchy, creating new objects where needed.
    // If the lastName was removed, then the last object is not set yet:
    for( var i = 0; i < names.length; i++ ) {
        base = base[ names[i] ] = base[ names[i] ] || {};
    }

    // If a value was given, set it to the last name:
    if( lastName ) base = base[ lastName ] = value;

    // Return the last object in the hierarchy:
    return base;
}