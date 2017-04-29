inlets = 1

function msg_float(value) {
  var indicator = this.patcher.getnamed('indicator')

  //indicator.set(value)
}

function bang () {
  var indicator = this.patcher.getnamed('indicator')

  indicator.set(0.5)	
}