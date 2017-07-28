var radians = Math.PI / 180;

var hslcolours = [
	[197, 72, 61],
	[211, 44, 49],
	[279, 29, 46],
	[323, 54, 52],
	[339, 80, 56],
	[349, 79, 56],
	[16, 82, 66],
	[45, 98, 74],
	[54, 93, 76],
	[91, 43, 63],
	[153, 55, 45],
	[167, 49, 47]
];

var root = document.querySelector('.content');

var colours = hslcolours.map(function(hsl) {
	return 'hsl('+hsl[0]+','+hsl[1]+'%,'+hsl[2]+'%)';
});

var selectedColour = hslcolours[~~(colours.length / 4) * 3]; // cheap trick

var segmentAngle = 360 / colours.length;

function createSvg(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function arc(centerX, centerY, startAngle, endAngle, innerR, outerR) {

	largeArc = +(endAngle - startAngle > 180);

	// calculate the start and end points for both inner and outer edges of the arc segment
	// the -90s are about starting the angle measurement from the top get rid of these if this doesn't suit your needs
	outerX1 = centerX + outerR * Math.cos((startAngle-90) * radians),
	outerY1 = centerY + outerR * Math.sin((startAngle-90) * radians),
	outerX2 = centerX + outerR * Math.cos((endAngle-90) * radians),
	outerY2 = centerY + outerR * Math.sin((endAngle-90) * radians),
	innerX1 = centerX + innerR * Math.cos((endAngle-90) * radians),
	innerY1 = centerY + innerR * Math.sin((endAngle-90) * radians),
	innerX2 = centerX + innerR * Math.cos((startAngle-90) * radians),
	innerY2 = centerY + innerR * Math.sin((startAngle-90) * radians);

	// build the path array
	var path = [
		["M", outerX1, outerY1], // move to the start point
		["A", outerR, outerR, 0, largeArc, 1, outerX2, outerY2], // draw the outer edge of the arc
		["L", innerX1, innerY1], // draw a line inwards to the start of the inner edge of the arc
		["A", innerR, innerR, 0, largeArc, 0, innerX2, innerY2], // draw the inner arc
		["z"] // close the path
	];

	var pathString = path.map(function(part) {
		return part[0] + part.slice(1).join(' ');
	}).join(' ');

	return pathString;
}

var dialPathdata = 'M100.049,50.034c-22,0-40.668,14.216-47.354,33.959L28.1,99.172c-0.299,0.185-0.481,0.511-0.481,0.862\
	s0.182,0.678,0.481,0.862l24.595,15.182c6.687,19.74,25.354,33.957,47.354,33.957c27.615,0,50-22.387,50-50.001\
	S127.664,50.034,100.049,50.034z M30.561,100.034l21.236-13.105c-1.132,4.178-1.747,8.569-1.747,13.105s0.615,8.929,1.748,13.106\
	L30.561,100.034z';

function createWheel(reverse) {

	var radius = 100;
	var diameter = radius * 2;
	var angleOffset = segmentAngle / 2;

	var segments = colours.map(function(color, i) {

		var startAngle = (segmentAngle * i) - angleOffset;
		var pathData = arc(radius, radius, startAngle, startAngle + segmentAngle, 10, radius-2);

		var path = createSvg('path');
		path.setAttributeNS(null, 'd', pathData);
		path.setAttributeNS(null, 'fill', color);
		path.setAttributeNS(null, 'stroke', color);

		return path;

	});

	var wheel = createSvg('svg');
	wheel.setAttributeNS(null, 'viewBox', '0 0 '+diameter+' '+diameter);

	var coverRect = createSvg('rect');
	coverRect.setAttributeNS(null, 'width', 200);
	coverRect.setAttributeNS(null, 'height', 200);
	coverRect.setAttributeNS(null, 'fill', '#fff');

	var dial = createSvg('path');
	dial.setAttributeNS(null, 'd', dialPathdata);

	var mask = createSvg('mask');
	mask.setAttributeNS(null, 'id', 'dial');

	mask.append(coverRect, dial);

	var g = createSvg('g');
	//g.setAttributeNS(null, 'mask', 'url(#dial)');

	var defs = createSvg('defs');
	defs.append(mask);

	g.append.apply(g, segments);

	wheel.append(defs, g);

	if (reverse) {
		g.setAttributeNS(null, 'transform', 'translate('+(radius*2)+', 0) scale(-1, 1)');
	}


	return wheel;

}

var tintsWheel = createWheel(true);
var shadesWheel = createWheel();

document.querySelector('.tints-wheel').prepend(tintsWheel);
document.querySelector('.shades-wheel').prepend(shadesWheel);

// 
root.on('mousedown mouseup touchstart touchend touchcancel', '.button', function(e) {

	var istints = this.matches('.tint-button');

	var animator = istints ? tintsAnimation : shadesAnimation;

	if (e.type === 'mousedown' || e.type === 'touchstart') {

		//animator.playFrom(animator._animationLength-(animator._lastUpdatedMillisecond || animator._animationLength), 1);
		animator.play(1);

	} else {

		animator.reverseFrom(animator._animationLength-(animator._lastUpdatedMillisecond || animator._animationLength), 1);

	}
});


var container = root;

var canvas = document.createElement('canvas');
var containerRect;
var scale = 1;

configureCanvas();

container.appendChild(canvas);

function configureCanvas() {

	containerRect = container.getBoundingClientRect();
	canvas.width = containerRect.width * scale;
	canvas.height = containerRect.height * scale;
}

on('resize orientationchange', null, configureCanvas);

var ctx = canvas.getContext('2d');

var frametimes = [];

for(var i = 0;i<50;i++) {
	var start = Date.now();
	ctx.ellipse(0, 0, i * 100, i * i * 100);
	ctx.fillStyle = 'red';
	ctx.fill();
	frametimes.push(Date.now() - start);
}

var sum = frametimes.reduce(function(a, b) { return a + b });
var ave = sum / frametimes.length;

var delta = (60 / ave) / 300;

var isCapturingRotation;

var scale = 0.25;// Math.floor(Math.min(2, Math.max(.4, delta)) * 10) / 10;

configureCanvas();

console.log('A draw scale of %d applied based on delta perf time %d (ave frame time %d)', scale, delta, ave);

var ellipses = [
	[256 / 1024, 256 / 1024],
	[300 / 1024, (256 / 1024) * 1.414],
	[346 / 1024, (256 / 1024) * 1.807],
	[391 / 1024, (256 / 1024) * 2.729],
	[436 / 1024, (256 / 1024) * 4.190],
	[481 / 1024, (256 / 1024) * 20.200],
	[520 / 1024, (256 / 1024) * 20.200],
];

var tintEllipses = [];
var shadeEllipses = [];

function draw() {

	var yMid = canvas.height * .5;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var i = tintEllipses.length;

	while(i--) {

		var tint = tintEllipses[i];

		ctx.beginPath();
		ctx.ellipse(0, yMid, canvas.width * tint[0], canvas.width * tint[1]);
		ctx.closePath();

		ctx.fillStyle = 'hsl('+selectedColour[0]+','+selectedColour[1]+'%,'+(100-(50*((i+1)/ellipses.length)))+'%)';// 'hsl(90, 55%, '+(100-(50*((i+1)/ellipses.length)))+'%)';
		ctx.fill();

	};

	var i = shadeEllipses.length;

	while(i--) {

		var shade = shadeEllipses[i];

		ctx.beginPath();
		ctx.ellipse(canvas.width, yMid, canvas.width * shade[0], canvas.width * shade[1]);
		ctx.closePath();

		ctx.fillStyle = 'hsl('+selectedColour[0]+','+selectedColour[1]+'%,'+((50*((i+1)/ellipses.length)))+'%)';// 'hsl(90, 55%, '+(100-(50*((i+1)/ellipses.length)))+'%)';
		ctx.fill();

	};
}

function render() {
	draw();
	requestAnimationFrame(render);
}

render();

function createEllipseActor(fn) {

	var actor = new Kapi.Actor({
		update: function(_, state) {

			var graph = [];

			for(var i = 0;i<ellipses.length; i++) {

				graph[i] = [
					state[i + '_x'],
					state[i + '_y']
				];

			};

			fn(graph);
		}
	});

	// at 0 all ellipses are 0x0
	actor.keyframe(0, ellipses.reduce(function(agg, ellipse, i) {

		if (i > 0) {

			agg[i + '_x'] = 0;
			agg[i + '_y'] = 0;

		}

		return agg;

	}, {}));

	var duration = 1000;

	ellipses.forEach(function(ellipse, i) {

		var previous = ellipses[i-1];

		var restingState = {};
		restingState[i + '_x'] = 0;
		restingState[i + '_y'] = 0;

		var previousState = {};
		previousState[i + '_x'] = previous ? previous[0] : ellipses[0][0] * .8;
		previousState[i + '_y'] = previous ? previous[1] : ellipses[0][1] * .8;

		var currentState = {};
		currentState[i + '_x'] = ellipse[0];
		currentState[i + '_y'] = ellipse[1];

		// starting from previous ellipse (or special case for first)
		if (i > 0) actor.keyframe((i * duration)-1, restingState);
		actor.keyframe(i * duration, previousState);

		// going to
		actor.keyframe((i + 1) * duration, currentState, 'linear'); // easeInOutQuart

	});

	return actor;
}

var tintsAnimation = new Kapi().addActor(createEllipseActor(function(graph) {
	tintEllipses = graph;
}));

var shadesAnimation = new Kapi().addActor(createEllipseActor(function(graph) {
	shadeEllipses = graph;
}));

function normalizeRotation(rotation) {

	var rest = rotation % 360;

	return rest >= 0 ? rest : 360 + rest;
}

function getOpposingWheel(wheel) {

	var result;

	[wheel.previousElementSibling, wheel.nextElementSibling].every(function(el) {
		return !el || !el.matches('.wheel') || (result = el);
	});

	return result;
}

function setRotation(target, rotation) {

	target.style.webkitTransform = 'rotate('+(rotation)+'deg)';

	return target.dataset.rotation = rotation;
}

function rotateStart(target, rotation) {
	return target.dataset.baseDegrees = rotation;
}

function rotateMove(target, rotation) {

	var diff = target.dataset.baseDegrees - rotation;

	var currentRotation = +target.dataset.currentDegrees||0;

	var delta = currentRotation+diff;

	return setRotation(target, delta);
}

function rotateEnd(target, rotation) {

	var diff = target.dataset.baseDegrees - rotation;

	var currentRotation = +target.dataset.currentDegrees||0;

	var delta = currentRotation+diff;

	return target.dataset.currentDegrees = delta;
}

//

root.on('touchstart', '.wheel .button', function(e) {
	if (this.dataset.capturingIdentifier) return;

	var touch = e.changedTouches[0];
	this.dataset.capturingIdentifier = touch.identifier;

	target.dataset.capturingX = touch.pageX;
	target.dataset.capturingY = touch.pageY;
});

root.on('touchmove', '.wheel .button', function(e) {

	var target = this;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == target.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	var over = document.elementFromPoint(capturingTouch.pageX, capturingTouch.pageY);

	if (target !== over) return;
	
	e.stopImmediatePropagation();

});

root.on('touchend touchcancel', '.wheel .button', function(e) {
	delete this.dataset.capturingIdentifier;
});

// 

function onWheelPointerBegin(target, position) {

	target.dataset.capturingX = position.x;
	target.dataset.capturingY = position.y;
	
	var circRect = target.getBoundingClientRect();
	var cy = position.y - circRect.top;
	var cx = position.x - circRect.left;

	var circCx = circRect.width / 2;
	var circCy = circRect.height / 2;

	var deg = radiansToDegrees(Math.atan2(cx-circCx, cy-circCy));

	rotateStart(target, deg);

	var otherWheel = getOpposingWheel(target);

	rotateStart(otherWheel, -deg);

}

function onWheelPointerMove(target, position) {

	var isright = target.matches('.shades-wheel');

	var circRect = target.getBoundingClientRect();

	var cy = position.y - circRect.top;
	var cx = position.x - circRect.left;

	var circCx = circRect.width / 2;
	var circCy = circRect.height / 2;

	var deg = radiansToDegrees(Math.atan2(cx-circCx, cy-circCy));

	rotateMove(target, deg);

	var otherWheel = getOpposingWheel(target);

	var rotation = rotateMove(otherWheel, -deg);

	var halfSegment = segmentAngle / 2;

	var effectiveRotation = normalizeRotation(nearest(rotation + (isright ? -90 : 90), segmentAngle));

	var selectedSegment = effectiveRotation / segmentAngle;

	selectedColour = hslcolours[!selectedSegment || isright ? selectedSegment : hslcolours.length - selectedSegment];

}

function onWheelPointerEnd(target, position) {

	var isright = target.matches('.shades-wheel');

	var circRect = target.getBoundingClientRect();

	var cy = position.y - circRect.top;
	var cx = position.x - circRect.left;

	var circCx = circRect.width / 2;
	var circCy = circRect.height / 2;

	var deg = radiansToDegrees(Math.atan2(cx-circCx, cy-circCy));

	rotateEnd(target, deg);

	var otherWheel = getOpposingWheel(target);

	var rotation = rotateEnd(otherWheel, -deg);

	var halfSegment = segmentAngle / 2;

	var effectiveRotation = normalizeRotation(nearest(rotation + (isright ? -90 : 90), segmentAngle));

	var selectedSegment = effectiveRotation / segmentAngle;

	selectedColour = hslcolours[!selectedSegment || isright ? selectedSegment : hslcolours.length - selectedSegment];

}

//

var capturingTarget;

root.on('mousedown', '.wheel', function(e) {
	capturingTarget = this;
	onWheelPointerBegin(capturingTarget, new Point(e.pageX, e.pageY));
});

root.on('mousemove', null, function(e) {
	if (!capturingTarget) return;
	onWheelPointerMove(capturingTarget, new Point(e.pageX, e.pageY));
});

root.on('mouseup', null, function(e) {
	onWheelPointerEnd(capturingTarget, new Point(e.pageX, e.pageY));
	capturingTarget = void 0;
});


//

root.on('touchstart', '.wheel', function(e) {
	if (isCapturingRotation) return;
	if (!this.dataset.capturingIdentifier) {
		var touch = e.changedTouches[0];
		this.dataset.capturingIdentifier = touch.identifier;
	}
});

root.on('touchstart', '.wheel', function(e) {

	var target = this;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == target.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	onWheelPointerBegin(target, Point.fromTouch(capturingTouch));

});

root.on('touchmove', '.wheel', function(e) {

	var target = this;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == target.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	onWheelPointerMove(target, Point.fromTouch(capturingTouch));

});

root.on('touchend touchcancel', '.wheel', function(e) {

	var target = this;

	var capturingTouch = first(e.changedTouches, function(touch) { 
		return touch.identifier == target.dataset.capturingIdentifier; 
	});

	if (!capturingTouch) return;

	onWheelPointerEnd(target, Point.fromTouch(capturingTouch));

});

root.on('touchend touchcancel', '.wheel', function(e) {
	delete this.dataset.capturingIdentifier;
});

root.on('touchstart touchend touchcancel', '.wheel', function(e) {
	isCapturingRotation = e.type === 'touchstart';
});