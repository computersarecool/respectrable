autowatch = 1

var parentPath = jsarguments[1]

function anything () {
  'use strict'

  if (messagename === 'bang') {
    createClip()
  }
}

function createClip () {
  'use strict'

  var path = parentPath.split('/').join(' ')
  var apiClip = new LiveAPI(path)
  
  this.patcher.remove(this.patcher.getnamed('clip'))
  if (apiClip.get('has_clip')[0]) {
  	var clipPatch = this.patcher.newdefault(200, 200, 'bpatcher', 'clip.maxpat', '@args', parentPath + '/clip', '@presentation', 1, '@patching_rect', [295, 171, 125, 33], '@presentation_rect', [0, 0, 125, 33], '@varname', 'clip')	
  	this.patcher.connect(this.patcher.getnamed('clipSlotRouter'), 3, clipPatch, 0)
    this.patcher.connect(this.patcher.getnamed('clip_playing'), 0, clipPatch, 1)
    this.patcher.connect(this.patcher.getnamed('clip_not_playing'), 0, clipPatch, 1)
  }
  
  outlet(0, 'id ' + apiClip.id)
}

