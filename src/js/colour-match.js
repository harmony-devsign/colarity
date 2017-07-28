function clamp(value, min, max) {
	min = min || 0;
	max = max || 1;
	return Math.max(Math.min(value, max), min);
}

var themeStyleElement = (function() {

	var style = document.createElement('style');
	document.head.append(style);
	return style;

})();

var root = document.querySelector('.content');

var lowerBgElement = root.querySelector('.lower-background');
var higherBgElement = root.querySelector('.higher-background');

var leftBar = lowerBgElement.querySelector('.bar');
var rightBar = higherBgElement.querySelector('.bar');

var completeElement = root.querySelector('.complete');


function applyTheme(theme) {

	lowerBgElement.style.setProperty('background', theme.primaryBackground);
	higherBgElement.style.setProperty('background', theme.secondaryBackground);

	leftBar.style.setProperty('background', theme.color);
	rightBar.style.setProperty('background', theme.color);

	return theme;
}

function createRandomTheme() {

	var hue = randomInt(0, 360);
	var saturation = 60;
	var lightness = 45;

	var primarySaturation = hue - 65;
	var secondarySaturation = hue + 65;
	
	return {
		color: 'hsl('+hue+', '+saturation+'%, '+lightness+'%)',
		primaryBackground: 'hsl('+primarySaturation+', '+saturation+'%, '+lightness+'%)',
		secondaryBackground: 'hsl('+secondarySaturation+', '+saturation+'%, '+lightness+'%)'
	};
}

applyTheme(createRandomTheme());

function render() {
	TWEEN.update();
	requestAnimationFrame(render);
}

render();

var isPortrait;

on('load resize orientationchange', null, function(e) {

	isPortrait = matchMedia('screen and (orientation: portrait)').matches;

});

function setScale(el, value) {
	el.style.setProperty('-webkit-transform', 'scale('+(isPortrait ? 1 : value)+', '+(isPortrait ? value : 1)+')');
	el.dataset.scale = value;
}

function getScale(el) {
	return el.dataset.scale;
}

function resetBar(bar)  {

	var tween = new TWEEN.Tween({ scale: getScale(bar) || 1 })
		.to({ scale: 1 }, 150)
		.easing(TWEEN.Easing.Cubic.In)
		.onUpdate(function() {
			setScale(bar, this.scale);
		})
		.start();
}

//

function onPointerBegin(bar, position) {
	bar.classList.add('interacting');
	bar.dataset.startPosition = position;
}

function onPointerMove(bar, position) {

	var isPrimary = bar.matches('.lower-background .bar');

	var startPosition = Point.parse(bar.dataset.startPosition);

	var delta = position.minus(startPosition);

	// invert coords for the non primary side
	if (!isPrimary)
		delta = delta.mul(new Point(-1, -1));

	if (isPortrait) {

		var maximum = root.offsetHeight * .5;

		var scale = 1 + (clamp(delta.y, 0, maximum) / bar.offsetHeight);

		setScale(bar, scale);

	} else {

		var maximum = root.offsetWidth * .5;

		var scale = 1 + (clamp(delta.x, 0, maximum) / bar.offsetWidth);

		setScale(bar, scale);

	}

}

function onPointerEnd(bar) {

	bar.classList.remove('interacting');

	function animateBars() {
		resetBar(leftBar);
		resetBar(rightBar);
	}

	var overlap = leftBar.getBoundingClientRect().intersect(rightBar.getBoundingClientRect());

	if (overlap) {

		completeElement.hidden = false;

		setTimeout(function() {

			completeElement.hidden = true;

			applyTheme(createRandomTheme());

			animateBars();

		}, 1000);

	} else {

		resetBar(bar);

	}
}

//

var capturingTarget;

root.on('mousedown', '.bar', function(e) {
	capturingTarget = e.target;
	onPointerBegin(e.target, new Point(e.pageX, e.pageY));
});

root.on('mousemove', null, function(e) {
	if (!capturingTarget) return;
	onPointerMove(capturingTarget, new Point(e.pageX, e.pageY));
});

root.on('mouseup', null, function(e) {
	onPointerEnd(capturingTarget, new Point(e.pageX, e.pageY));
	capturingTarget = void 0;
});

//

root.on('touchstart', '.bar', function(e) {
	if (!e.target.dataset.capturingIdentifier) e.target.dataset.capturingIdentifier = e.changedTouches[0].identifier;
});

root.on('touchstart touchmove touchend touchcancel', '.bar', function(e) {

	var bar = e.target;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == bar.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	var position = Point.fromTouch(capturingTouch);

	if (e.type === 'touchstart') {
		onPointerBegin(bar, position);
	} else if (e.type === 'touchmove') {
		onPointerMove(bar, position);	
	} else {
		onPointerEnd(bar, position);
	}

});

root.on('touchend', '.bar', function(e) {
	delete e.target.dataset.capturingIdentifier;
});