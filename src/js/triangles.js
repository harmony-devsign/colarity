var root = document.querySelector('.content');

var display = root.querySelector('.display');
var title = root.querySelector('h1');
var description = root.querySelector('h2');
var states = Array.from(root.querySelectorAll('li'));

function getPositions(el) {

  return el.getAttribute('data-selected').split(/\s*,\s*/).reduce(function(agg, i) { 
    agg[i-1] = true;
    return agg;
  }, {});
}

// 
Array.from(display.querySelectorAll('path')).forEach(function(triangle, i) {
	triangle.index = i;
});

states.forEach(function(state) {

  var minidisplay = display.cloneNode(true);

  minidisplay.removeAttributeNS(null, 'class');

  var triangles = Array.from(minidisplay.querySelectorAll('path'));

  var positions = getPositions(state);

  triangles.forEach(function(triangle, i) {
    triangle.setAttributeNS(null, 'class', i in positions ? 'selected' : '');
  });

  state.append(minidisplay);

});


function displayState(state) {

  var triangles = Array.from(display.querySelectorAll('path'));

  if (state) {

    var positions = getPositions(state);

    triangles.forEach(function(triangle, i) {
      triangle.className 
      triangle.setAttributeNS(null, 'class', i in positions ? 'selected' : '');
    });

  }

  states.forEach(function(otherState) {
    if (otherState === state) {
      otherState.classList.add('selected');
    } else {
      otherState.classList.remove('selected');
    }
  });

  title.textContent = state ? state.textContent : '';
  description.textContent = state ? state.getAttribute('data-description') : '';

}

var _touches = {};

// 

var capturingTarget;

root.on('mousedown', null, function(e) {
  capturingTarget = e.target;
});

root.on('mousedown mousemove', null, function(e) {

  if (!capturingTarget) return;

  var target = e.target;

  if (!target.matches('.display path')) return;

  if (!('0' in _touches))
    _touches[0] = target.matches('.selected');

  target.setAttributeNS(null, 'class', _touches[0] ? '' : 'selected');

  var triangles = Array.from(display.querySelectorAll('.selected')).map(function(triangle) {
    return 1+ +triangle.index;
  });

  var matchingState = document.querySelector('[data-selected="'+triangles.join(', ')+'"]');

  displayState(matchingState);

});

root.on('mouseup', null, function(e) {
  capturingTarget = void 0;
  delete _touches[0];
});

//

root.on('touchstart touchmove', null, function(e) {

  var starter = this;

  var touches = Array.from(e.changedTouches);

  touches.forEach(function(touch) {

    var target = document.elementFromPoint(touch.pageX, touch.pageY);

    if (!target.matches('.display path')) return;

    if (!(touch.identifier in _touches))
      _touches[touch.identifier] = target.matches('.selected');

    target.setAttributeNS(null, 'class', _touches[touch.identifier] ? '' : 'selected');

    if (e.type === 'touchend' && e.touches.length) return;

    var triangles = Array.from(display.querySelectorAll('.selected')).map(function(triangle) {
      return 1+ +triangle.index;
    });

    var matchingState = document.querySelector('[data-selected="'+triangles.join(', ')+'"]');

    displayState(matchingState);

  });

});

root.on('touchend touchcancel', null, function(e) {

  var touches = Array.from(e.changedTouches);

  touches.forEach(function(touch) {

    delete _touches[touch.identifier];

  });

});

var currentState = states.filter(function(state) { return state.classList.contains('selected'); })[0];

displayState(currentState);