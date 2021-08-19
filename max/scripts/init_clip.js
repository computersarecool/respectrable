/* global post, messagename, outlet, LiveAPI, jsarguments */

inlets = 1
outlets = 1
autowatch = 1

var path = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    initializeClip()
  }
}

function initializeClip () {
  'use strict'

  var apiObject = new LiveAPI(path.split('/').join(' '))
  var clipName = '' + apiObject.get('name')[0]
  var clipColor = apiObject.get('color')[0]
  var clipObject = this.patcher.getnamed('clip_ui')

  clipObject.message('text', clipName.substring(0, 25))
  clipObject.message('bgcolor', [(clipColor >> 16 & 255) / 255, (clipColor >> 8 & 255) / 255, (clipColor & 255) / 255, 1.0])

  outlet(0, 'id ' + apiObject.id)
}
