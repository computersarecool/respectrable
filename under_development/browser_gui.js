// This is work in progress code to make the GUI for respectrable in a web browser
function makeButtons () {
  let htmlString = ''

  for (let i = 0; i < 8; i++) {
    htmlString += '<button id="button' + i + '">Button ' + i + '</button>'
  }

  document.querySelector('#button-list').innerHTML = htmlString

  let buttons = Array.prototype.slice.call(document.querySelectorAll('#button-list button'))
  buttons.forEach((elem) => {
    primus.emit('toMax', {
      address: '/tomax/live_set/tracks/0/clip_slots/' + elem.id.slice(-1) + '/clip',
      args: ['get', 'name'],
      isChannel: false
  })

  elem.addEventListener('click', () => {
    primus.emit('toMax', {
      address: '/tomax/live_set/tracks/0/clip_slots/' + elem.id.slice(-1) + '/clip',
      args: ['call', 'fire'],
      isChannel: false
    })
  }, false)
}

// Add event listeners to buttons
document.querySelectorAll('button').forEach(elem => {
  elem.addEventListener('click', () => {
   getOrSet(elem.dataset.address, 'value', 1)
  }, false)
})

// Slider Specific Code
// Helper function to scale values
function convertRange (value, r1, r2) {
  return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

// Slider update code
function updateSlider (e) {
  let bounds = this.getBoundingClientRect();
  let touchPoint = e.touches[0];
  let knob = document.querySelector('#slider-knob');
  let knobBounds = knob.getBoundingClientRect();
  let value = Math.max(0, Math.min(1, convertRange(touchPoint.clientY, [bounds.bottom - knobBounds.height / 2, bounds.top + knobBounds.height / 2], [0, 1])));

  knob.style.bottom =  value * (bounds.height - knobBounds.height) + 'px';

  primus.emit('toMax', {
    address: '/live_set/return_tracks/0/mixer_device/volume/set/value',
    args: [value],
    isChannel: true,
  });
}

// Hard coded slider event listeners
document.querySelector('#call-fire').addEventListener('touchstart', getOrSet('/tomax/live_set', ['get', 'tracks']), false)
document.querySelector('#slider-base').addEventListener('touchmove', updateSlider, false)
document.querySelector('#slider-base').addEventListener('touchstart', updateSlider, false)


// SVG Specific Code
function describeArc (x, y, radius, startAngle, endAngle) {
  let start = polarToCartesian(x, y, radius, endAngle)
  let end = polarToCartesian(x, y, radius, startAngle)
  let largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

  let d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');

  return d;
}

function polarToCartesian (centerX, centerY, radius, angleInRadians) {
  angleInRadians = angleInRadians + Math.PI / 2
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

// SVG Loading information
document.querySelector('object').addEventListener('load', function () {
  let svgDoc = document.querySelector('#logo').contentDocument;
  let svg = svgDoc.querySelector('svg')
  let layerToMask = svgDoc.querySelector('#layer4')
  let maskContainer = svgDoc.querySelector('#mask-container')
  let maskPath = svgDoc.querySelector('#mask-path')
  let initialTransform = svg.createSVGTransformFromMatrix(layerToMask.getScreenCTM().inverse())

  maskContainer.transform.baseVal.initialize(initialTransform)
  
  // Draw the arc angle
  svgDoc.addEventListener('click', function (e) {
    let strokeWidth = 285
    let dialBounds = svg.getBoundingClientRect()
    let dialRadius = dialBounds.width / 2
    let dialCenterX = dialBounds.left + dialRadius
    let dialCenterY = dialBounds.top + dialRadius
    let newTransform = svg.createSVGTransformFromMatrix(svg.getScreenCTM().inverse())
    let scaleTransform = Math.sqrt(newTransform.matrix.a * newTransform.matrix.a + newTransform.matrix.b * newTransform.matrix.b)
    let angle = Math.atan2(dialCenterY - e.clientY, e.clientX - dialCenterX)
    
    angle = (3 * Math.PI / 2 - angle) % (2 * Math.PI)
    
    let result = describeArc(dialCenterX, dialCenterY, dialRadius, 0, angle)
    maskPath.setAttribute('d', result)
    maskPath.transform.baseVal.initialize(newTransform)
    maskPath.setAttribute('stroke-width', '' + strokeWidth / scaleTransform)
  }, false)
})