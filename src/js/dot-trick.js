function degreesToRadians(degrees) {
	return degrees * (Math.PI/180);
}

function wrap(value, max) {
	value = value % max;
	if (0 > value) value += max;
	return value;
}

var root = document.querySelector('.content');
var primeSelected = root.querySelector('.left-dot');
var opposingSelected = root.querySelector('.right-dot');

var colours = [
	[53, 100, 77],
	[44, 100, 75],
	[24, 81, 69],
	[348, 79, 56],
	[340, 82, 56],
	[322, 53, 50],
];

var primeColours = ['#fff18c', '#ffde81', '#ec8845', '#e8385b', '#eb3270', '#c33d92'];
var opposingColours = ['#83529a', '#467cad', '#4fbbe2', '#43b497', '#33b079', '#a2c778'];

var renderScale = devicePixelRatio;
var coloursVisible = 3;

var sliceSize = 1/coloursVisible;

var progress = (sliceSize) * 0;
var countProgress = 0;

var barsDirty = true;

var primeCanvas = document.createElement('canvas');
var opposingCanvas = document.createElement('canvas');
var timerCanvas = document.createElement('canvas');

primeCanvas.classList.add('prime-bar');
opposingCanvas.classList.add('opposing-bar');
timerCanvas.classList.add('timer');

root.append(primeCanvas, opposingCanvas, timerCanvas);

var primeCtx = primeCanvas.getContext('2d');
var opposingCtx = opposingCanvas.getContext('2d');
var timerCtx = timerCanvas.getContext('2d');


on('load resize orientationchange', null, function() {
	
	var barWidth = 18;
	var dotCanvas = 16;

	primeCanvas.width = barWidth * renderScale;
	primeCanvas.height = root.offsetHeight * renderScale;
	primeCanvas.style.width = barWidth + 'px';
	primeCanvas.style.height = root.offsetHeight + 'px';

	opposingCanvas.width = barWidth * renderScale;
	opposingCanvas.height = root.offsetHeight * renderScale;
	opposingCanvas.style.width = barWidth + 'px';
	opposingCanvas.style.height = root.offsetHeight + 'px';

	timerCanvas.width = dotCanvas * renderScale;
	timerCanvas.height = dotCanvas * renderScale;
	timerCanvas.style.width = dotCanvas + 'px';
	timerCanvas.style.height = dotCanvas + 'px';

	primeCtx.scale(renderScale, renderScale);
	opposingCtx.scale(renderScale, renderScale);
	timerCtx.scale(renderScale, renderScale);

	barsDirty = true;

});

function draw() {

	var canvasWidth = primeCanvas.offsetWidth;
	var canvasHeight = primeCanvas.offsetHeight;

	// draw the timer dot

	var dotsize = 8;

	timerCtx.clearRect(0, 0, dotsize * 2, dotsize * 2);

	timerCtx.beginPath();
	timerCtx.ellipse(dotsize, dotsize, dotsize, dotsize);
	timerCtx.closePath();

	timerCtx.fillStyle = '#a8a79c';
	timerCtx.fill();

	timerCtx.beginPath();
	timerCtx.arc(dotsize, dotsize, dotsize, degreesToRadians(-90), degreesToRadians((-360 * (1-countProgress))-90), true);
	timerCtx.lineTo(dotsize, dotsize);
	timerCtx.closePath();

	timerCtx.fillStyle = '4e4e49';
	timerCtx.fill();

	// draw the selected colour bars

	if (barsDirty) {

		var barWidth = canvasWidth;
		var barHeight = canvasHeight / coloursVisible;

		var primeHeight = barHeight * primeColours.length;
		var opposingHeight = barHeight * opposingColours.length;

		var opposingX = canvasWidth - barWidth;

		var offset = primeHeight * progress;

		primeCtx.clearRect(0, 0, barWidth, primeHeight);

		primeColours.forEach(function(colour, i) {

			primeCtx.beginPath();
			primeCtx.rect(0, (barHeight * i) + offset, barWidth, barHeight);
			primeCtx.closePath();

			primeCtx.fillStyle = colour;
			primeCtx.fill();

			primeCtx.beginPath();
			primeCtx.rect(0, (barHeight * i) + offset - primeHeight, barWidth, barHeight);
			primeCtx.closePath();

			primeCtx.fillStyle = colour;
			primeCtx.fill();

		});

		opposingCtx.clearRect(opposingX, 0, barWidth, primeHeight);

		opposingColours.forEach(function(colour, i) {

			opposingCtx.beginPath();
			opposingCtx.rect(opposingX, (barHeight * i) + offset, barWidth, barHeight);
			opposingCtx.closePath();

			opposingCtx.fillStyle = colour;
			opposingCtx.fill();

			opposingCtx.beginPath();
			opposingCtx.rect(opposingX, (barHeight * i) + offset - opposingHeight, barWidth, barHeight);
			opposingCtx.closePath();

			opposingCtx.fillStyle = colour;
			opposingCtx.fill();

		});
		
		barsDirty = false;

	}

}

function render() {
	TWEEN.update();
	draw();
	requestAnimationFrame(render);
}

render();

root.on('colour-change', null, function(e) {

	primeSelected.style.background = primeColours[e.picked];
	opposingSelected.style.background = opposingColours[e.picked];

	console.log('%c%s', 'font-size: 5em;color:white;background: ' + e.picked, e.picked);
});

// 

function onPointerBegin(target, position) {

	target.dataset.startProgress = progress;
	target.dataset.capturingX = position.x;
	target.dataset.capturingY = position.y;
	
}

function onPointerMove(target, position) {

	var startProgress = +target.dataset.startProgress;
	var startingY = +target.dataset.capturingY;

	var delta = startingY - position.y;

	var deltaProgress = (delta / target.offsetHeight) / 2;

	progress = wrap(startProgress - deltaProgress, 1);

	barsDirty = true;

	target.dataset.didmove = true;
	
}

function onPointerEnd(target, position) {

	if (!target.dataset.didmove) return;

	var selection = nearest(progress, sliceSize / 2);

	new TWEEN.Tween({ progress: progress })
		.to({ progress: selection }, 250)
		.easing(TWEEN.Easing.Cubic.Out)
		.onUpdate(function() {
			progress = this.progress;
			barsDirty = true;
		})
		.start();

	var index = primeColours.length-~~((primeColours.length * selection)-1);

	var ev = new CustomEvent('colour-change');
	ev.picked = wrap(index, primeColours.length);

	root.dispatchEvent(ev);

	// var startProgress = +target.dataset.startProgress;
	// var startingY = +target.dataset.capturingY;

	// var delta = startingY - capturingTouch.pageY;

	// var deltaProgress = (delta / target.offsetHeight);

	// progress = wrap(startProgress - deltaProgress, 1);

	// barsDirty = true;
}

//

var capturingTarget;
var didmove;

root.on('mousedown', null, function(e) {
	capturingTarget = this;
	didmove = void 0;
	onPointerBegin(capturingTarget, new Point(e.pageX, e.pageY));
});

root.on('mousemove', null, function(e) {
	if (!capturingTarget) return;
	didmove = true;
	onPointerMove(capturingTarget, new Point(e.pageX, e.pageY));
});

root.on('mouseup', null, function(e) {
	if (!capturingTarget) return;
	onPointerEnd(capturingTarget, new Point(e.pageX, e.pageY));
	setImmediate(function() {
		capturingTarget = void 0;
	})
});

root.on('click', null, function(e) {
	if (!didmove) return;
	e.stopImmediatePropagation();
}, true);

//

root.on('touchstart', null, function(e) {
	if (this.dataset.capturingIdentifier) return;

	var touch = e.changedTouches[0];
	this.dataset.capturingIdentifier = touch.identifier;

});

root.on('touchstart touchmove touchend touchcancel', null, function(e) {

	var target = this;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == target.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	var position = Point.fromTouch(capturingTouch);

	if (e.type === 'touchstart') {
		onPointerBegin(target, position);
	} else if (e.type === 'touchmove') {
		onPointerMove(target, position);
	} else {
		onPointerEnd(target, position);
	}

});

root.on('touchend touchcancel', null, function(e) {
	delete this.dataset.capturingIdentifier;
});

// 

var countdownTween;

root.on('click', null, function() {

	primeSelected.hidden = opposingSelected.hidden = false;

	if (countdownTween)
		countdownTween.stop();

	countdownTween = new TWEEN.Tween({ progress: 0 })
		.to({ progress: 1 }, 15000)
		.onUpdate(function() {
			countProgress = this.progress;

			if (this.progress === 1) {
				primeSelected.hidden = opposingSelected.hidden = true;
			}
		})
		.onComplete(function() {



		})
		//.repeat(Infinity)
		.start();

});