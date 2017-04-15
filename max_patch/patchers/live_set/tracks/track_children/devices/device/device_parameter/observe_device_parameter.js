inlets = 1;
var charIndex = jsarguments[1];

function msg_float(value) {
  var indicator = this.patcher.parentpatcher.getnamed(charIndex);

  indicator.set(value);
}
