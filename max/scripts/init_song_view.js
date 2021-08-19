/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    var apiObject = new LiveAPI(path.split('/').join(' '))

    outlet(0, 'id ' + apiObject.id)
  }
}
