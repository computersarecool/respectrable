inlets = 1;
outlets = 4;

var liveProperties;
var settingsString = '';
var inFile = new File('..\\..\\settings.json', 'read', 'JSON');

// Read settings
if (inFile.isopen) {
  while (inFile.position < inFile.eof) {
    settingsString += inFile.readstring(800);
  }
  inFile.close();
  liveProperties = JSON.parse(settingsString).LiveProperties;
} else {
  throw new Error('Could not read JSON file');
}

// This function sends out an initial amount of information about the current app and set
function getSetInformation () {
  "use strict";
  var i;

  for (i = 0; i < liveProperties.startUpObjects.length; i++) {
    sendInformation(liveProperties.startUpObjects[i], 'data', getPropertiesAndMethods(liveProperties.startUpObjects[i], null, null));
  }
}

// Call methods, get properties and send all infomation specified in settings

// Incrementally
// function getPropertiesAndMethods (lomPath, special, subPath) {
//   "use strict";
//   var i;
//   var j;
//   var k;
//   var l;
//   var returnValue;
//   var childApiObj;
//   var idArray;
//   var apiMethods;  
//   var apiProperties; 
//   var apiObj = new LiveAPI(lomPath);
//   var apiType = apiObj.type;
//   var apiChildren = liveProperties.apiTypes[apiType].children;

//   // Only read the relevant properties and methods
//   if (special) {
//     apiMethods = liveProperties.apiTypes[subPath].methods;
//     apiProperties = liveProperties.apiTypes[subPath].properties;
//   } else {
//     apiMethods = liveProperties.apiTypes[apiType].methods;
//     apiProperties = liveProperties.apiTypes[apiType].properties;
//   }

//   // Call each specified method
//   for (i = 0; i < apiMethods.length; i++) {
//     returnValue = apiObj.call(apiMethods[i]);
//     sendInformation(apiObj.unquotedpath, apiMethods[i], returnValue);
//   }

//   // Get each specified property
//   for (j = 0; j < apiProperties.length; j++) {
//     returnValue = apiObj.get(apiProperties[j]);
//     sendInformation(apiObj.unquotedpath, apiProperties[j], returnValue);
//   }

//   // Repeat the process for each monitored child
//   for (k = 0; k < apiChildren.length; k++) {
//     idArray = apiObj.get(apiChildren[k].subPath);
//     for (l = 0; l < idArray.length; l += 2) {
//       getPropertiesAndMethods(idArray[l] + ' ' + idArray[l + 1], apiChildren[k].special, apiChildren[k].subPath);
//     }
//   }
// }

// All at once
function getPropertiesAndMethods (lomPath, special, subPath) {
  "use strict";
  var i;
  var j;
  var k;
  var l;
  var returnValue;
  var childApiObj;
  var idArray;
  var apiMethods;  
  var apiProperties;
  var apiObj = new LiveAPI(lomPath);
  var apiType = apiObj.type;
  var apiChildren = liveProperties.apiTypes[apiType].children;
  var output = {
    path: lomPath,
    properties: {},
    type: apiType,
    children: [],
  };

  // Only read the relevant properties and methods
  if (special) {
    apiMethods = liveProperties.apiTypes[subPath].methods;
    apiProperties = liveProperties.apiTypes[subPath].properties;
  } else {
    apiMethods = liveProperties.apiTypes[apiType].methods;
    apiProperties = liveProperties.apiTypes[apiType].properties;
  }

  // Call each specified method
  for (i = 0; i < apiMethods.length; i++) {
    output.properties[apiMethods[i]] = apiObj.call(apiMethods[i]);
  }

  // Get each specified property
  for (j = 0; j < apiProperties.length; j++) {
    output.properties[apiProperties[j]] = apiObj.get(apiProperties[j]);
  }

  // Repeat the process for each monitored child
  for (k = 0; k < apiChildren.length; k++) {
    idArray = apiObj.get(apiChildren[k].subPath);
    for (l = 0; l < idArray.length; l += 2) {
      output.children.push(getPropertiesAndMethods(idArray[l] + ' ' + idArray[l + 1], apiChildren[k].special, apiChildren[k].subPath));
    }
  }
  return output;
}

// Helper function to send information
function sendInformation (lomPath, property, value) {
  "use strict";
  outlet(0, '/frommax');
  outlet(1, JSON.stringify({
    'path': lomPath,
    'property': property,
    'value': value,
  }));
}

// This function is called when a property is set, gotten or function calledd
function anything () {
  "use strict";
  var obj = JSON.parse(messagename);
  var path = obj.path;
  var messageType= obj.messageType;
  var property = obj.property;
  var liveObj;
  var value;
  
  // Set live path if it exists
  if (obj.path) {
    liveObj = new LiveAPI(path);
  }

  // Getting a property
  if (messageType === 'get') {
  	value = liveObj.get(property);
    sendInformation(liveObj.unquotedpath, property, value);
  // Setting a property
  } else if (messageType === 'set') {
    liveObj.set(property, obj.value);  
  // Calling a method
  } else if (messageType === 'call') {
  	value = liveObj.call(property);
    return;
  // Setting a parameter (i.e. using the remote)
  } else if (messageType === 'setParameter') {
    outlet(3, 'id ' + liveObj.id);
    outlet(2, obj.value);
  // Send out all information  
  } else if (messageType === 'getSetInformation') {
    getSetInformation();
  }
}
