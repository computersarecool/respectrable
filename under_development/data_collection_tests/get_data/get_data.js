inlets = 1;
outlets = 1;

// Get a live ID from a path
function IDfromPath (path) {
  var api = new LiveAPI(path);
  return api.id;
}

// Remove the possibility of there being an 'id' in front of path
function checkID (id) {
  var testID = "" + id;
  if (testID.substring(0, 3) !== 'id ') {
    return 'id ' + testID;
  }
}

// Where the magic happens
function getData (liveID) {
  var fullID = checkID(liveID);
  var api = new LiveAPI(fullID);

  // Make a blank object to store data
  var obj = {
    id: api.id,
    path: api.unquotedpath,
    type: null,
    description: null,
    properties: {},
    functions: [],
    singleChildren: {},
    listChildren: {},
  };

  // Make an array of the various properties and functions to be gotten
  var info = api.info.split('\u000a');
  info.splice(info.length - 1, 1);

  // Loop through each of these to get all the information
  for (var i = 0; i < info.length; i++) {  
    var propArray = info[i].split(" ");
    // propertyType is the type of information we are getting (i.e. property, children, function) 
    // propertyName is the name of the property we are getting (i.e. clip_slots, devices, sends) 
    // returnType is the type returned by calling a function     
    var propertyType = propArray[0];
    var propertyName = propArray[1];
    var returnType = propArray[2];

    if (propertyType === 'description') {
      // TODO: Remove four backslashes in text
      propArray.shift();
      obj[propertyType] = propArray.join(' ');
    } else if (propertyType === 'function') {
      obj['functions'].push(propertyName);
    } else if (propertyType === 'property') {
      // Properties (all need to have their values evaluated with 'get')
      obj['properties'][propertyName] = {
        'value': (function () { 
          return api.get(propertyName)
        })(),
        'returnType': returnType,
      }
    } else if (propertyType === 'child') {
        // This is a single child (not a list of children)
        if (propertyName === 'canonical_parent') {
          obj['singleChildren']['canonical_parent'] = new LiveAPI(api.unquotedpath + ' ' + propertyName).unquotedpath;
        } else {
          // Check to make sure the ID is a a valid one (i.e. not a clip index that is not existent on a particular track)
          var idExists = new LiveAPI(api.unquotedpath + " " + propertyName).id;
          if (idExists !== '0') {
            obj['singleChildren'][propertyName] = getData(idExists);
          }
        }
    } else if (propertyType === 'children') {
      // Getting the property name will return an array, store these in childIDlist and store the returned results in childCare 
      var childCare = [];
      var childIDList = api.get(propertyName);
      for (var j = 0; j < childIDList.length; j++) {
        // childIDList[j] is an ID. Filter out just the part that comes after "id"
        if (typeof childIDList[j] === 'number') {
          var topLevel = getData(childIDList[j]);
          childCare.push(topLevel);
        }
      }
      obj['listChildren'][propertyName] = childCare;
    } else {
      obj[propertyType] = propertyName;
    }
  }
  return obj;
}


function bang () {
  // var setInfo = getData(IDfromPath('live_set'));
  // var appInfo = getData(IDfromPath('live_app'));
  
  // var apiObj = {
  //   'live_set': setInfo,
  //   'live_app': appInfo,
  // }

  // var stringified = JSON.stringify(apiObj, null, 2);

  // //Write the file
  // var fout = new File('..\\data\\data.json', 'write', 'TEXT');
  // if (fout.isopen) {
  //   fout.eof = 0;
  //   while (fout.position < stringified.length) {
  //     fout.writechars([stringified[fout.position]]);
  //   }
  //   fout.close();
  // } else {
  //   post("\ncould not create json file: ");
  // }

  ////DEBUG
  //var g = new LiveAPI("live_set tracks 0 clip_slots 4 clip");
  // post();
  // post();
  // var t = new LiveAPI('live_set tracks 4 clip_slots 1 clip');
  // for (var k in t) {
  //   post(k, t[k]);
  //   post();
  // }

  // outlet(0, 'bang');
  post('\ndone');
}
