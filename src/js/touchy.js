Element.prototype.matches||(Element.prototype.matches = (function(elementPrototype) {
	return elementPrototype.webkitMatchesSelector
})(Element.prototype));

Element.prototype.closest = function(selector) {
	var parent = this.parentNode;
	if (!parent || !parent.matches) return void 0;
	if (parent.matches(selector)) return parent;
	return parent.closest(selector);
};

Array.prototype.first = function(predicate) {
	var length = this.length;
	for(var i = 0;i<length;i++) {
		var item = this[i];
		if (predicate(item)) return item;
	}
};

Array.from = function(arrayish) {
	return [].slice.call(arrayish);
};

// ios has an old implementation of toggle that doesnt have a force option.
DOMTokenList.prototype.toggle = function(token, force) {

	var add = typeof force === 'boolean' ? force : !this.contains(token);

	if (add) {
		this.add(token);
	} else {
		this.remove(token);
	}
};

ClientRect.prototype.intersect = function(other) {
	var x0 = Math.max(this.left, other.left);
	var x1 = Math.min(this.left + this.width, other.left + other.width);

	var y0 = Math.max(this.top, other.top);
	var y1 = Math.min(this.top + this.height, other.top + other.height);

	var width = x1 - x0;
	var height = y1 - y0;

	if (0 > width || 0 > height) return null;

	var temp = document.createElement('span');
	temp.style.width = width + 'px';
	temp.style.height = height + 'px';
	temp.style.position = 'absolute';
	temp.style.top = y0 + 'px';
	temp.style.left = x0 + 'px';
	temp.style.background = 'lime';

	document.body.append(temp);

	var rect = temp.getBoundingClientRect();

	temp.remove();

	return rect;
};

Window.prototype.on = Node.prototype.on = function(events, selector, listener, useCapture) {

	events = events.trim().split(/\s+/);

	var fn = selector 
		? function(e) { 
			var closestMatch = e.target.matches && e.target.matches(selector) ? e.target : e.target.closest(selector);
			if (closestMatch) listener.call(closestMatch, e) 
		}
		: function(e) {
			listener.call(this, e);
		};

	events.forEach(function(ev) {
		this.addEventListener(ev, fn, useCapture || false);
	}.bind(this));
};

function radiansToDegrees(radians) {
	return radians * (180/Math.PI);
}

function nearest(value, round) {
	return (Math.round(value / round)) * round;
}

function clamp(value, min, max) {
	min = min || 0;
	max = max || 1;
	return Math.max(Math.min(value, max), min);
}

function randomInt(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function randomOffsetInt(min, max) {
	var negate = Math.random() > .5;
	var number = randomInt(min, max);

	return negate ? -number : number;
}

function between(value, min, max) {
	return value >= min && max >= value;
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.fromRect = function(rect) {
	return new Point(rect.left, rect.top);
};

Point.fromTouch = function(touch) {
	return new Point(touch.pageX, touch.pageY);
};

Point.parse = function(s) {
	var parts = s.split('x');
	return new Point(+parts[0], +parts[1]);
};

Point.prototype.add = function(other) {
	return new Point(this.x + other.x, this.y + other.y);
};

Point.prototype.minus = function(other) {
	return new Point(this.x - other.x, this.y - other.y);
};

Point.prototype.mul = function(other) {
	return new Point(this.x * other.x, this.y * other.y);
};

Point.prototype.toString = function() {
	return this.x+'x'+this.y;
};

// function resolveProperty(name) {
// 	if (/transform/i.test(name)) return '-webkit-' + name;
// }

// // prefix shim 
// var setProperty = CSSStyleDeclaration.prototype.setProperty;

// CSSStyleDeclaration.prototype.setProperty = function(name, value) {
// 	setProperty.call(this, resolveProperty(name), value);
// };

function format(format) {
	var args = [].slice.call(arguments, 1);
	
	return format.replace(/\${(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
};


// 

function createTouchVisual() {
	var visual = document.createElement('span');
	visual.classList.add('touch-visual');
	return visual;
}

var oor = {
};

var slice = function(instance) {
	var args = [].slice.call(arguments, 1);
	return Array.prototype.slice.apply(instance, args);
};

var forEach = function(instance, callback) {
	return Array.prototype.forEach.call(instance, callback);
};

var map = function(instance, callback) {
	return Array.prototype.map.call(instance, callback);
};

var first = function(instance, callback) {
	return Array.prototype.first.call(instance, callback);
};

document.on('touchstart', null, function(e) {

	forEach(e.changedTouches, function(touch) {

		var visual = createTouchVisual();

		document.body.append(visual);

		oor[touch.identifier] = visual;

	});

});

document.on('touchstart touchmove touchend', null, function(e) {

	forEach(e.changedTouches, function(touch) {

		var visual = oor[touch.identifier];

		visual.style.setProperty('-webkit-transform', format('translate(${0}px, ${1}px)', touch.pageX, touch.pageY));

	});

});

var __vel = {};

function getVelocity(deltaTouches) {


        // final float[] pastX = mPastX;
        // final float[] pastY = mPastY;
        // final long[] pastTime = mPastTime;

        var NUM_PAST = 10;
        var units = 100;
        var maxVelocity = Number.MAX_VALUE;
        
        // Kind-of stupid.
        var oldestX = deltaTouches[0].touch.pageX;// pastX[0];
        var oldestY = deltaTouches[0].touch.pageY;// pastY[0];
        var oldestTime = deltaTouches[0].time;

        var accumX = 0;
        var accumY = 0;
        var N=0;

        while (N < Math.min(NUM_PAST, deltaTouches.length)) {
            if (deltaTouches[N].time === 0) {
                break;
            }
            N++;
        }

        // Skip the last received event, since it is probably pretty noisy.
        if (N > 3) N--;
        
        for (var i=1; i < N; i++) {

            var dur = (deltaTouches[i].time - oldestTime);

            if (dur === 0) continue;

            var dist = deltaTouches[i].touch.pageX - oldestX;
            var vel = (dist/dur) * units;   // pixels/frame.

            if (accumX == 0) accumX = vel;
            else accumX = (accumX + vel) * .5;
            
            dist = deltaTouches[i].touch.pageY - oldestY;
            vel = (dist/dur) * units;   // pixels/frame.
            if (accumY == 0) accumY = vel;
            else accumY = (accumY + vel) * .5;
        }

        var mXVelocity = accumX < 0 ? Math.max(accumX, -maxVelocity) : Math.min(accumX, maxVelocity);
        var mYVelocity = accumY < 0 ? Math.max(accumY, -maxVelocity) : Math.min(accumY, maxVelocity);
     
     return new Point(mXVelocity, mYVelocity);
}

document.on('touchstart touchmove touchend touchcancel', null, function(e) {

	if (e.type === 'touchstart' || e.type === 'touchmove') {

		forEach(e.changedTouches, function(touch) {

			var touches = __vel[touch.identifier] || (__vel[touch.identifier] = []);

			touches.push({
				time: Date.now(),
				touch: touch
			});

		});

	} else {

		var now = Date.now();

		forEach(e.changedTouches, function(touch) {

			var touches = __vel[touch.identifier];
			var velocity = getVelocity(touches);

			delete __vel[touch.identifier];

			console.log('Velocity of %s was %s', '' + Point.fromTouch(touch), '' + velocity);

		});

	}

});

document.on('touchend touchcancel', null, function(e) {

	forEach(e.changedTouches, function(touch) {

		var visual = oor[touch.identifier];

		visual.remove();

		delete oor[touch.identifier];

	});

});

// 

if (/(iPad|iPhone|iPod)/i.test(navigator.userAgent)) {

	document.on('touchstart touchmove touchend', null, function(e) {

		e.preventDefault();

	});

}