var first = function(instance, callback) {
	return Array.prototype.first.call(instance, callback);
};

var colors = [
	'#e5a124', '#d76f27', 
	'#d25e27', '#c23227'
];

var progress = 0;

var root = document.querySelector('.content');
var container = root;

var canvas = document.createElement('canvas');
container.appendChild(canvas);

var ctx = canvas.getContext('2d');

on('ready load resize orientationchange', null, function() {

	canvas.width = container.offsetWidth;
	canvas.height = container.offsetHeight;

});

function draw() {

	var rowHeight = canvas.height / colors.length;
	var rowWidth = canvas.width * 1.5;
	var rowX = (canvas.width - rowWidth) * .5;
	var xMid = rowWidth * .5;
	var yMid = rowHeight * .5;

	colors.forEach(function(color, i) {

		var y = i * rowHeight;

		ctx.beginPath();
		ctx.rect(rowX, y, rowWidth, rowHeight);
		ctx.ellipse(rowX + xMid, y, xMid, Math.max(0, yMid * 5.8 * (1-progress)));
		ctx.closePath();

		ctx.fillStyle = color;
		ctx.fill();

	});

}

function render() {
	TWEEN.update();
	draw();
	requestAnimationFrame(render);
}

render();

// 

function onPointerBegin(target, position) {

	target.dataset.capturingX = position.x;
	target.dataset.capturingY = position.y;

}

function onPointerMove(target, position) {

	var startingY = +target.dataset.capturingY;

	var containerRect = target.getBoundingClientRect();
	var containerPosition = new Point.fromRect(containerRect);

	var offset = position.minus(containerPosition);

	progress = clamp(((offset.y - startingY) / ((containerRect.height  * .8) - startingY)) * 1);

}

function onPointerEnd(target, position) {

	var tween = new TWEEN.Tween({ t: progress })
		.to({ t: 0 }, 300)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(function() {
			progress = this.t;
		})
		.start();

}

//

var capturingTarget;

root.on('mousedown', null, function(e) {
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

root.on('touchstart', null, function(e) {

	var target = this;

	if (target.dataset.capturingIdentifier) return;
	
	var touch = e.changedTouches[0];
	target.dataset.capturingIdentifier = touch.identifier;

});

root.on('touchmove', null, function(e) {

	var target = this;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == target.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	onPointerMove(target, Point.fromTouch(capturingTouch));

});

root.on('touchend touchcancel', null, function(e) {

	var target = this;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == target.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	onPointerEnd(target, Point.fromTouch(capturingTouch));

});

root.on('touchend', null, function(e) {
	delete this.dataset.capturingIdentifier;
	delete this.dataset.capturingX;
	delete this.dataset.capturingY;
});