document.on('click', '.intro .play-button, span.info-button', function(e) {

	var intro = document.querySelector('.intro');
	var content = document.querySelector('.content');

	intro.hidden = !intro.hidden;
	intro.classList.toggle('attr-hidden', intro.hidden);

	content.dispatchEvent(new CustomEvent(intro.hidden ? 'colarity-deactivate' : 'colarity-activate'));

});

// swipe handler

var DIRECTION = {
	RIGHT: 1 << 0,
	LEFT: 1 << 1,
	UP: 1 << 2,
	DOWN: 1 << 3
};

document.on('touchstart touchend touchcancel', '.intro', function(e) {

	var data = this.dataset;
	var touches = Array.from(e.changedTouches);

	var options = {
		direction: DIRECTION.LEFT | DIRECTION.RIGHT,

		minimumMovement: 50,
		maximumMovement: Number.MAX_VALUE, // Infinity

		minimumSecondaryMovement: 0,
		maximumSecondaryMovement: 50,

		rateOfMinimumMovementDecay: .06,
		rateOfMaximumMovementDecay: .02,

		maximumDuration: 500
	};

	if (e.type === 'touchstart') {

		touches.forEach(function(touch) {

			data[touch.identifier + '_startPoint'] = Point.fromTouch(touch);
			data[touch.identifier + '_startTime'] = e.timeStamp;

		});

	} else {

		touches.forEach(function(touch) {

			var startPoint = Point.parse(data[touch.identifier + '_startPoint']);
			var startTime = +data[touch.identifier + '_startTime'];

			var currentPoint = Point.fromTouch(touch);
			var currentTime = Date.now();

			var acceleration = currentPoint.minus(startPoint);
			var duration = currentTime - startTime;

			if (duration > options.maximumDuration) return;

			// horizontal
			if (between(Math.abs(acceleration.x), options.minimumMovement, options.maximumMovement)) {

				var left = 0 > acceleration.x;

				var ev = new CustomEvent('-x-swipe', { bubbles: true });
				ev.direction = left ? DIRECTION.LEFT : DIRECTION.RIGHT;

				touch.target.dispatchEvent(ev);

			}

		});

	}

}, true);

document.on('-x-swipe', '.intro', function(e) {

	var button = this.querySelector(e.direction === DIRECTION.LEFT ? '.next' : '.prev');

	button.click();

});