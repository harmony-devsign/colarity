var first = function(instance, callback) {
	return Array.prototype.first.call(instance, callback);
};

var themeStyleElement = (function() {

	var style = document.createElement('style');
	document.head.append(style);
	return style;

})();

var root = document.querySelector('.content');

var blockBgElement = root.querySelector('.block-background');
var linesBgElement = root.querySelector('.lines-background');

var blockElement = root.querySelector('.block');
var lineElements = Array.from(root.querySelectorAll('.lines div'));

var completeElement = root.querySelector('.complete');

function applyTheme(theme) {

	blockBgElement.style.setProperty('background', theme.primaryBackground);
	linesBgElement.style.setProperty('background', theme.secondaryBackground);

	blockElement.style.setProperty('background', theme.color);
	
	lineElements.forEach(function(lineElement, i) {
		var lineColour = theme.options[i];
		lineElement.style.setProperty('background', lineColour);
		lineElement.classList.toggle('selected', lineColour === theme.color);
	});

	return theme;
}

function createRandomTheme() {

	var hue = randomInt(0, 360);
	var saturation = 60;
	var lightness = 45;

	var primarySaturation = hue - 65;
	var secondarySaturation = hue + 65;

	var optionsCount = 4;

	var chosen = randomInt(0, optionsCount-1);

	var options = Array.apply(null, new Array(optionsCount)).map(function(_, i) {

		var optionlightness = i === chosen ? lightness : lightness + (randomOffsetInt(1, 3) * 3);
		var optionSaturation = i === chosen ? saturation : saturation + (randomOffsetInt(1, 3) * 3);

		return 'hsl('+hue+', '+optionSaturation+'%, '+optionlightness+'%)';
	});

	return {
		color: 'hsl('+hue+', '+saturation+'%, '+lightness+'%)',
		primaryBackground: 'hsl('+primarySaturation+', '+saturation+'%, '+lightness+'%)',
		secondaryBackground: 'hsl('+secondarySaturation+', '+saturation+'%, '+lightness+'%)',
		options: options
	};
}

function resetBars() {

	lineElements.forEach(function(line) {
		line.style.removeProperty('-webkit-transform');
	});

}

applyTheme(createRandomTheme());

root.on('colarity-activate', null, function() {

	resetBars();

});

function onPointerBegin(bar, position) {

	bar.classList.add('interacting');

	var barPosition = Point.fromRect(bar.getBoundingClientRect());

	bar.dataset.relativeX = position.x - barPosition.x;
	bar.dataset.relativeY = position.y - barPosition.y;

	if (!bar.dataset.startX) {
		bar.dataset.startX = barPosition.x;
		bar.dataset.startY = barPosition.y;
	}

}

function onPointerMove(bar, position) {

	var relativeX = +bar.dataset.relativeX;
	var relativeY = +bar.dataset.relativeY;

	var relativePosition = new Point(relativeX, relativeY);

	var rootRect = root.getBoundingClientRect();
	var rootPosition = Point.fromRect(rootRect);

	var barPosition = new Point(bar.dataset.startX, bar.dataset.startY);

	var centre = barPosition.minus(position).add(relativePosition);

	bar.style.setProperty('-webkit-transform', 'translate('+-centre.x+'px, '+-centre.y+'px)');

}

function onPointerEnd(bar, position) {

	bar.classList.remove('interacting');

	if (bar.matches('.selected')) {

		var blockRect = blockElement.getBoundingClientRect();
		var barRect = bar.getBoundingClientRect();
		var overlap = blockRect.intersect(barRect);

		if (overlap.width > 0 || overlap.height > 0) {

			completeElement.hidden = false;

			setTimeout(function() {

				completeElement.hidden = true;

				applyTheme(createRandomTheme());

				resetBars();

			}, 1000);

		}

	}

}

//

var capturingTarget;

root.on('mousedown', '.one-color .lines div', function(e) {
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

root.on('touchstart', '.one-color .lines div', function(e) {

	if (e.target.dataset.capturingIdentifier) return;

	var touch = e.changedTouches[0];
	e.target.dataset.capturingIdentifier = touch.identifier;

});

root.on('touchmove touchstart touchend touchcancel', '.one-color .lines div', function(e) {

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

root.on('touchend touchcancel', '.one-color .lines div', function(e) {
	delete e.target.dataset.capturingIdentifier;
	delete e.target.dataset.relativeX;
	delete e.target.dataset.relativeY;
});