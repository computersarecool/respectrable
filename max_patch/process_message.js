inlets = 1
outlets = 1
autowatch = 1

function anything () {
  'use strict'
  var data
  var idBased
  var pathArray = messagename.split('/')
  pathArray.splice(0, 2)
  if (pathArray[0] === 'id') {
    idBased = true
  }
  var path = pathArray.join(' ')
  var apiObj = new LiveAPI(path)
  var kind = arguments[0]
  var property = arguments[1]
  var value = arguments[2]

  // Call the LiveAPI object with either get, set or call methods
  if (kind === 'get') {
    data = apiObj.get(property)
  } else if (kind === 'set') {
    apiObj.set(property, value)
    // The data returned after this is frequently wrong so use the incoming value
    // Ideally it would be set to the returned value
    data = value
  } else if (kind === 'call') {
    data = apiObj.call(property)
  } else if (kind === 'property') {
    // return the value of a LiveAPI object's property
    data = apiObj[property]
  }
  // Strip the string 'id' from any response
  if (Array.isArray(data)) {
    if (data[0] === 'id') {
      data = data.filter(function (element) {
        return element !== 'id'
      })
    }
  }
  if (idBased) {
    path = apiObj.unquotedpath
  }
  outlet(0, '/' + path.split(' ').join('/') + '/' + property, data)
}
