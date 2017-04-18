inlets = 1
outlets = 1
autowatch = 1

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
      post('need to get state')
      break      
  }

  // Format and send back the returned data
  outlet(0, '/' + path.split(' ').join('/'), messageType, property, data)
}
