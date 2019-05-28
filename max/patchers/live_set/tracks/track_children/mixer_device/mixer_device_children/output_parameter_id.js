outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  "use strict"

  if (messagename === 'bang') {
    outputId();
  }
}

function outputId () {
  "use strict";

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var indicator = this.patcher.getnamed('indicator')

  indicator.set(parseFloat(apiObject.get('value')[0]))

  outlet(0, 'id ' + apiObject.id)
}
