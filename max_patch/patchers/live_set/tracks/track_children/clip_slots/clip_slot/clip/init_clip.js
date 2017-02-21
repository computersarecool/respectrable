var path = jsarguments[1];

function setId (id) {
  outlet(0, 'id ' + id);
}


function initializeClip () {
  "use strict";
  var apiClip = new LiveAPI(path.split('/').join(' '));
  var clipName = apiClip.get('name')[0];
  var clipColor = apiClip.get('color')[0];
  var clipUi = this.patcher.getnamed('clip_ui')
  
  clipUi.message('text', clipName.substring(0, 25));
  clipUi.message('bgcolor', [(clipColor >> 16 & 255) / 255, (clipColor >> 8 & 255) / 255, (clipColor & 255) / 255, 1.0]);
  setId(apiClip.id);
}


function anything () {
  "use strict";
  if (messagename === 'bang') {
    initializeClip();
  }
}