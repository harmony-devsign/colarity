(function() {

	var Fn = Function, GLOBAL = new Fn('return this')();

  var now = Tweenable.now;

  var playState = {
    'STOPPED': 'stopped'
    ,'PAUSED': 'paused'
    ,'PLAYING': 'playing'
  };

  function fireEvent (kapi, eventName, _, opt_data) {
    _.each(kapi._events[eventName], function (handler) {
      handler(kapi, opt_data);
    });
  }

  function updatePlayState (kapi, currentLoopIteration) {
    if (isAnimationComplete(kapi, currentLoopIteration)) {
      kapi.stop();
      fireEvent(kapi, 'animationComplete', _);
    }
  }

  function isAnimationComplete (kapi, currentLoopIteration) {
    return currentLoopIteration >= kapi._timesToIterate
      && kapi._timesToIterate !== -1;
  }

  function calculateLoopPosition (kapi, forMillisecond, currentLoopIteration) {
    var currentLoopPosition;

    if (isAnimationComplete(kapi, currentLoopIteration)) {
      currentLoopPosition = kapi._animationLength;
    } else {
      currentLoopPosition = forMillisecond % kapi._animationLength;
    }

    return currentLoopPosition;
  }

  function calculateTimeSinceStart (kapi) {
    return now() - kapi._loopTimestamp;
  }

  function determineCurrentLoopIteration (kapi, timeSinceStart) {
    var currentIteration = Math.floor(
      (timeSinceStart) / kapi._animationLength);
    return currentIteration;
  }

  function updateToMillisecond (kapi, forMillisecond) {
    var currentIteration = determineCurrentLoopIteration(kapi, forMillisecond);
    var loopPosition = calculateLoopPosition(kapi, forMillisecond,
      currentIteration);
    kapi.update(kapi._animationLength-loopPosition);
    updatePlayState(kapi, currentIteration);
  }

  function updateToCurrentMillisecond (kapi) {
    updateToMillisecond(kapi, calculateTimeSinceStart(kapi));
  }

  function tick (kapi) {
    var updateFn = function () {
      tick(kapi);
      updateToCurrentMillisecond(kapi);
    };

    // Need to check for .call presence to get around an IE limitation.
    // See annotation for cancelLoop for more info.
    if (kapi._scheduleUpdate.call) {
      kapi._loopId = kapi._scheduleUpdate.call(GLOBAL,
        updateFn, 1000 / kapi.config.fps);
    } else {
      kapi._loopId = setTimeout(updateFn, 1000 / kapi.config.fps);
    }
  }

  Kapi.prototype.reverse = function (opt_howManyTimes) {
    this._cancelUpdate.call(window, this._loopId)

    if (this._playState === playState.PAUSED) {
      this._loopTimestamp += now() - this._pausedAtTime;
    } else {
      this._loopTimestamp = now();
    }

    this._timesToIterate = opt_howManyTimes || -1;
    this._playState = playState.PLAYING;
    tick(this);

    fireEvent(this, 'playStateChange', _);
    fireEvent(this, 'play', _);

    return this;
  };

  Kapi.prototype.reverseFrom = function (millisecond, opt_howManyTimes) {
    this.reverse(opt_howManyTimes);
    this._loopTimestamp = now() - millisecond;

    return this;
  };

})();