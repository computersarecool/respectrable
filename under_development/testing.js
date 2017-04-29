autowatch = 1;

function go () {
  post('hi');
  task = new Task(changePorts, this);
  task.schedule(2000);
}


function changePorts (channelUdpReceiver, messageUdpReceiver) {
  post('you made it here');
}


function anything () {
  "use strict";
  if (messagename === 'bang') {
    go();
  }
}
