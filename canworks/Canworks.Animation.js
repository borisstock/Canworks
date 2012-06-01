/*

Copyright 2010 Boris Stock (b.stock@bitstorm.de)

Licensed under the Creative Commons Attribution, Non-Commercial and No Derivatives License, Version 3.0 (the "License"):

	http://creativecommons.org/licenses/by-nc-nd/3.0/

You may not use this files except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

*/

var Canworks = Canworks || {};

// ----------------------------
// Animations library definition
// ----------------------------

Canworks.Animations = Canworks.Animations || {};

Canworks.Animations.Curves = Canworks.Animations.Curves || {};
Canworks.Animations.Curves.Linear    = 0;
Canworks.Animations.Curves.EaseIn    = 1;
Canworks.Animations.Curves.EaseOut   = 2;
Canworks.Animations.Curves.EaseInOut = 3;

Canworks.Animations._currentAnimation = null;
Canworks.Animations._runningAnimations = [];

Canworks.Animations.begin = function (animationName, userData) {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._currentAnimation = null;
	}
	
	Canworks.Animations._currentAnimation = new Canworks.Animations.Animation();
	Canworks.Animations._currentAnimation.setName(animationName);
	Canworks.Animations._currentAnimation.setUserData(userData);
}

Canworks.Animations.stopAllAnimations = function() {
	var len = Canworks.Animations._runningAnimations.length;
	for(var i=0; i<len; i++) {
		var animation = Canworks.Animations._runningAnimations[i];
		animation.stop();
	}
	Canworks.Animations._runningAnimations = [];
	return this;
}

Canworks.Animations.removeAnimation = function(animation) {
	var len = animation.layersToAnimate.length;
	if (len>0) {
		for (var i=0;i<len;i++) {
			var layerAnimationMap = animation.layersToAnimate[i];
			var layer = layerAnimationMap.layer;
			layer.removeAnimation(animation);
		}
	}
	
	var indexOfAnimation = Canworks.Animations._runningAnimations.indexOf(animation);
	Canworks.Animations._runningAnimations.splice(indexOfAnimation, 1);
	return this;
};

Canworks.Animations.isRecording = function () {
	if (Canworks.Animations._currentAnimation!=null) {
		return true;
	}
	return false;
}

Canworks.Animations.commit = function () {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._runningAnimations[Canworks.Animations._runningAnimations.length] = Canworks.Animations._currentAnimation;
		var toReturn = Canworks.Animations._currentAnimation;
		Canworks.Animations._currentAnimation = null;
		toReturn.start();
		return toReturn;
	}
	return null;
}

Canworks.Animations.setCurve = function (curve) {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._currentAnimation.setCurve(curve);
	}
}

Canworks.Animations.setDelay = function (delay) {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._currentAnimation.setDelay(delay);
	}
}

Canworks.Animations.setDuration = function (duration) {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._currentAnimation.setDuration(duration);
	}
}

Canworks.Animations.setRepeatCount = function (repeatCount) {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._currentAnimation.setRepeatCount(repeatCount);
	}
}

Canworks.Animations.setReversesAfterEnd = function (reversesAfterEnd) {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._currentAnimation.setReversesAfterEnd(reversesAfterEnd);
	}
}

Canworks.Animations.setOnEndHandler = function (onEndFunction) {
	if (Canworks.Animations._currentAnimation!=null && typeof onEndFunction == 'function') {
		Canworks.Animations._currentAnimation.setOnEnd(onEndFunction);
	}
}

Canworks.Animations.setOnBeginHandler = function (onBeginFunction) {
	if (Canworks.Animations._currentAnimation!=null && typeof onBeginFunction == 'function') {
		Canworks.Animations._currentAnimation.setOnBegin(onBeginFunction);
	}
}

Canworks.Animations.setOnRestartHandler = function (onRestartFunction) {
	if (Canworks.Animations._currentAnimation!=null && typeof onRestartFunction == 'function') {
		Canworks.Animations._currentAnimation.setOnRestart(onRestartFunction);
	}
}

Canworks.Animations.addAnimationValueForLayer = function(layer, valueKey, valueStart, valueEnd) {
	if (Canworks.Animations._currentAnimation!=null) {
		Canworks.Animations._currentAnimation.addAnimationValueForLayer(layer, valueKey, valueStart, valueEnd);
	}
}

// ------------------------------
// Animation class definition
// ------------------------------

Canworks.Animations.Animation = function ()  {
	Canworks.Object.call(this);
}

Canworks.Animations.Animation.prototype = new Canworks.Object;
Canworks.Animations.Animation.prototype.constructor = Canworks.Animations.Animation;
Canworks.Animations.Animation.prototype.name = null;
Canworks.Animations.Animation.prototype.userData = null;
Canworks.Animations.Animation.prototype.curve = Canworks.Animations.Curves.Linear;
Canworks.Animations.Animation.prototype.curveFunction = null;
Canworks.Animations.Animation.prototype.delay = 0;
Canworks.Animations.Animation.prototype.duration = 500;
Canworks.Animations.Animation.prototype.repeatCount = 0;
Canworks.Animations.Animation.prototype.reversesAfterEnd = false;
Canworks.Animations.Animation.prototype.runs = 0;
Canworks.Animations.Animation.prototype.maxValue = 1;
Canworks.Animations.Animation.prototype.onEnd = null;
Canworks.Animations.Animation.prototype.onRestart = null;
Canworks.Animations.Animation.prototype.onBegin = null;
Canworks.Animations.Animation.prototype.animating = false;
Canworks.Animations.Animation.prototype.reversing = false;
Canworks.Animations.Animation.prototype.startTime = 0;
Canworks.Animations.Animation.prototype.step = 0;
Canworks.Animations.Animation.prototype.direction = 1;
Canworks.Animations.Animation.prototype.timer = null;
Canworks.Animations.Animation.prototype.interval = 10;
Canworks.Animations.Animation.prototype.layersToAnimate = [];
Canworks.Animations.Animation.prototype.layersToAnimateKeyMatrix = {};

Canworks.Animations.Animation.prototype.addAnimationValueForLayer = function(layer, valueKey, valueStart, valueEnd) {
	var layerID = layer.UID;
	var len = this.layersToAnimate.length;
	if (!this.layersToAnimateKeyMatrix[layerID]) {
		layer.addAnimation(this);
		this.layersToAnimateKeyMatrix[layerID] = len;
		this.layersToAnimate[len] = {};
		this.layersToAnimate[len].layer = layer;
		this.layersToAnimate[len].values = {};
	}
	var layerAnimationMap = this.layersToAnimate[this.layersToAnimateKeyMatrix[layerID]];
	if (!layerAnimationMap.values[valueKey]) {
		layerAnimationMap.values[valueKey] = {};
	}
	var valueAnimation = layerAnimationMap.values[valueKey];
	valueAnimation.from = valueStart;
	valueAnimation.to = valueEnd;
	
	// check if there already is a animation running which modifies the same valueKe
	var len = layer.getAnimations().length;
	if (len>0) {
		for (var i=0;i<len;i++) {
			var animation = layer.getAnimations()[i];
			if ((animation.isAnimating()==false && animation.getDelay()==0) ||
				animation.isAnimating()==true) {
				var layerAnimationMap = animation.layersToAnimate[animation.layersToAnimateKeyMatrix[layerID]];
				delete layerAnimationMap.values[valueKey];
			}
		}
	}
}

Canworks.Animations.Animation.prototype.setReversing = function(reversing) {
	this.reversing = reversing;
}

Canworks.Animations.Animation.prototype.isReversing = function() {
	return this.reversing;
}

Canworks.Animations.Animation.prototype.setReversesAfterEnd = function(reversesAfterEnd) {
	this.reversesAfterEnd = reversesAfterEnd;
}

Canworks.Animations.Animation.prototype.isReversingAfterEnd = function() {
	return this.reversesAfterEnd;
}


Canworks.Animations.Animation.prototype.setRuns = function(runs) {
	this.runs = runs;
}

Canworks.Animations.Animation.prototype.getRuns = function() {
	return this.runs;
}

Canworks.Animations.Animation.prototype.setInterval = function(interval) {
	this.interval = interval;
}

Canworks.Animations.Animation.prototype.getInterval = function() {
	return this.interval;
}

Canworks.Animations.Animation.prototype.setTimer = function(timer) {
	this.timer = timer;
}

Canworks.Animations.Animation.prototype.getTimer = function() {
	return this.timer;
}

Canworks.Animations.Animation.prototype.setDirection = function(direction) {
	this.direction = direction;
}

Canworks.Animations.Animation.prototype.getDirection = function() {
	return this.direction;
}

Canworks.Animations.Animation.prototype.setStep = function(step) {
	this.step = step;
}

Canworks.Animations.Animation.prototype.getStep = function() {
	return this.step;
}

Canworks.Animations.Animation.prototype.setStartTime = function(startTime) {
	this.startTime = startTime;
}

Canworks.Animations.Animation.prototype.getStartTime = function() {
	return this.startTime;
}

Canworks.Animations.Animation.prototype.setMaxValue = function(maxValue) {
	this.maxValue = maxValue;
}

Canworks.Animations.Animation.prototype.getMaxValue = function() {
	return this.maxValue;
}

Canworks.Animations.Animation.prototype.setAnimating = function(animating) {
	this.animating = animating;
}

Canworks.Animations.Animation.prototype.isAnimating = function() {
	return this.animating;
}

Canworks.Animations.Animation.prototype.setName = function(name) {
	this.name = name;
}

Canworks.Animations.Animation.prototype.getName = function() {
	return this.name;
}

Canworks.Animations.Animation.prototype.setUserData = function(userData) {
	this.userData = userData;
}

Canworks.Animations.Animation.prototype.getUserData = function() {
	return this.userData;
}

Canworks.Animations.Animation.prototype.setCurve = function(curve) {
	this.curve = curve;
}

Canworks.Animations.Animation.prototype.getCurve = function() {
	return this.curve;
}

Canworks.Animations.Animation.prototype.setDelay = function(delay) {
	this.delay = delay;
}

Canworks.Animations.Animation.prototype.getDelay = function() {
	return this.delay;
}

Canworks.Animations.Animation.prototype.setDuration = function(duration) {
	this.duration = duration;
}

Canworks.Animations.Animation.prototype.getDuration = function() {
	return this.duration;
}

Canworks.Animations.Animation.prototype.setRepeatCount = function(repeatCount) {
	this.repeatCount = repeatCount;
}

Canworks.Animations.Animation.prototype.getRepeatCount = function() {
	return this.repeatCount;
}

Canworks.Animations.Animation.prototype.setOnEnd = function(onEnd) {
	if(typeof onEnd != 'function') {
		return;
	}
	this.onEnd = onEnd;
}

Canworks.Animations.Animation.prototype.setOnBegin = function(onBegin) {
	if(typeof onBegin != 'function') {
		return;
	}
	this.onBegin = onBegin;
}

Canworks.Animations.Animation.prototype.setOnRestart = function(onRestart) {
	if(typeof onRestart != 'function') {
		return;
	}
	this.onRestart = onRestart;
}


Canworks.Animations.Animation.prototype.onTick = function (progress, timeDifference, duration) {
	
	var len = this.layersToAnimate.length;
	if (len>0) {
		for (var i=0;i<len;i++) {
			var layerAnimationMap = this.layersToAnimate[i];
			var layer = layerAnimationMap.layer;
			for (var valueKey in layerAnimationMap.values) {
				var valueObject = layerAnimationMap.values[valueKey];
				
				if (valueKey == 'backgroundColor') {
					Canworks.Animations.PropertyHandlers.backgroundColorHandler(layer, Canworks.Color.convertColorStringToRGBAColor(valueObject.from), Canworks.Color.convertColorStringToRGBAColor(valueObject.to), progress);
				}
				
				if (valueKey == 'alpha') {
					Canworks.Animations.PropertyHandlers.alphaHandler(layer, valueObject.from, valueObject.to, progress);
				}
				
				if (valueKey == 'frame') {
					Canworks.Animations.PropertyHandlers.frameHandler(layer, valueObject.from, valueObject.to, progress);
				}
			}
		}
	}
	
	if (progress>=1) {
		return false;
	}
	return true;
}

Canworks.Animations.Animation.prototype.reverseAnimations = function() {
	var len = this.layersToAnimate.length;
	if (len>0) {
		for (var i=0;i<len;i++) {
			var layerAnimationMap = this.layersToAnimate[i];
			var layer = layerAnimationMap.layer;
			for (var valueKey in layerAnimationMap.values) {
				var valueObject = layerAnimationMap.values[valueKey];
				var from = valueObject.from;
				var to = valueObject.to;
				valueObject.from = to;
				valueObject.to = from;
			}
		}
	}
}

Canworks.Animations.Animation.prototype.advance = function (self) {
	if(this.isAnimating()==false) {
		return;
	}
	
	var functionToCall = function () {
		self.advance(self);
	}
	
	var now = (new Date()).getTime();
    var timeDifference = Math.min(now - this.getStartTime(), this.getDuration());
    var progress = this.getDirection() < 0 ? this.getMaxValue() - this.curveFunction(timeDifference * this.getStep()) : this.curveFunction(timeDifference * this.getStep());
    
    if(this.onTick(progress, timeDifference, this.getDuration()) !== false && this.getDuration() != timeDifference) {
        this.setTimer(window.setTimeout(functionToCall, this.getInterval()));
    } else {
    	
    	var runsRemaining = this.getRepeatCount() - this.getRuns();
    	if(runsRemaining==0) {
    		if (this.isReversingAfterEnd()==true) {
    			this.setReversesAfterEnd(false);
    			this.setAnimating(false);
    			this.reverseAnimations();
    			this.setReversing(true);
    			this.restart(this);
    			return;
    		}
    	} else {
    		this.setAnimating(false);
    		if(this.isReversing()==true) {
    			this.setRuns(this.getRuns()+1);
    			this.setReversing(false);
    		} else {
    			this.setReversing(true);
    		}
    		this.reverseAnimations();
    		this.restart(this);
    		return;
    	}
    	
    	this.setAnimating(false);
    	this.end();
    }
}

Canworks.Animations.Animation.prototype.stop = function () {
	if(this.isAnimating()) {
		this.setAnimating(false);
	}
}

Canworks.Animations.Animation.prototype.restart = function () {
	if(this.isAnimating()) {
		return;
	}
    
    this.setAnimating(true);
    
    var now = (new Date()).getTime();
    this.setStartTime(now);
	
	if (typeof this.onRestart == 'function') {
		this.onRestart(this);
	}
	
	this.advance(this);
}

Canworks.Animations.Animation.prototype.start = function () {
	if(this.getDelay()>0) {
		var self = this;
		var functionToCall = function () {
			self.start();
		}
		window.setTimeout(functionToCall, this.getDelay());
		self.setDelay(0);
		return;
	}
	
	if(this.isAnimating()) {
		return;
	}
    
    this.setAnimating(true);
    
    if (this.getCurve()==Canworks.Animations.Curves.Linear) {
    	this.curveFunction = Canworks.Animations.CurveFunctions.Linear(this.maxValue);
    }
    
    if (this.getCurve()==Canworks.Animations.Curves.EaseIn) {
    	this.curveFunction = Canworks.Animations.CurveFunctions.EaseIn(this.maxValue);
    }
    
    if (this.getCurve()==Canworks.Animations.Curves.EaseOut) {
    	this.curveFunction = Canworks.Animations.CurveFunctions.EaseOut(this.maxValue);
    }
    
    if (this.getCurve()==Canworks.Animations.Curves.EaseInOut) {
    	this.curveFunction = Canworks.Animations.CurveFunctions.EaseInOut(this.maxValue);
    }
    
    var now = (new Date()).getTime();
    this.setStartTime(now);
    
    var calculatedStep = 1 / this.getDuration() * this.getMaxValue();
    this.setStep(calculatedStep);
    
    if (typeof this.onBegin == 'function') {
		this.onBegin(this);
	}
	
	this.advance(this);
}

Canworks.Animations.Animation.prototype.end = function () {
	if (typeof this.onEnd == 'function') {
		this.onEnd(this);
	}
	Canworks.Animations.removeAnimation(this);
}


// ------------------------------
// Animation curves
// ------------------------------

Canworks.Animations.CurveFunctions = Canworks.Animations.CurveFunctions || {};

Canworks.Animations.CurveFunctions.Linear    = function(max) {
	return function(time) { return time; };
};

Canworks.Animations.CurveFunctions.EaseIn    = function(max) {
	return function(time) { return max * (time /= max) * time; };
};

Canworks.Animations.CurveFunctions.EaseOut   = function(max) {
	return function(time) { return -max * (time /= max) * (time - 2); };
};

Canworks.Animations.CurveFunctions.EaseInOut = function(max) {
	var middle = max / 2; return function(time) { if ((time /= middle) < 1) return middle * time * time; return -middle * ((--time) * (time - 2) - 1); };
};


// ------------------------------
// Animation property handlers
// ------------------------------

Canworks.Animations.PropertyHandlers = Canworks.Animations.PropertyHandlers || {};

Canworks.Animations.PropertyHandlers.alphaHandler = function (layer, from, to, progress) {
	var difference = to - from;
	var up = true;
	if (to<from) {
	    up = false;
		difference = from - to;
	}
	
	if(up) {
		layer.setAlpha(from+(difference*progress));
	} else {
		layer.setAlpha(from-(difference*progress));
	}
}

Canworks.Animations.PropertyHandlers.frameHandler = function (layer, from, to, progress) {
	var fromRect = from;
	var toRect = to;
	
	var differenceX = toRect.origin.x - fromRect.origin.x;
	var upX = true;
	if (toRect.origin.x<fromRect.origin.x) {
	    upX = false;
		differenceX = fromRect.origin.x - toRect.origin.x;
	}
	
	var differenceY =  toRect.origin.y - fromRect.origin.y;
	var upY = true;
	if (toRect.origin.y<fromRect.origin.y) {
	    upY = false;
		differenceY = fromRect.origin.y - toRect.origin.y;
	}
	
	var differenceWidth = toRect.size.width - fromRect.size.width;
	var upWidth = true;
	if (toRect.size.width<fromRect.size.width) {
	    upWidth = false;
		differenceWidth = fromRect.size.width - toRect.size.width;
	}
	
	var differenceHeight = toRect.size.height - fromRect.size.height;
	var upHeight = true;
	if (toRect.size.height<fromRect.size.height) {
	    upHeight = false;
		differenceHeight = fromRect.size.height - toRect.size.height;
	}
	
	var newFrame = fromRect.copy();
	
	if(differenceX>0) {
		if(upX) {
			newFrame.origin.x = newFrame.origin.x + (differenceX*progress);
		} else {
			newFrame.origin.x = newFrame.origin.x - (differenceX*progress);
		}
	}
	
	if(differenceY>0) {
		if(upY) {
			newFrame.origin.y = newFrame.origin.y + (differenceY*progress);
		} else {
			newFrame.origin.y = newFrame.origin.y - (differenceY*progress);
		}
	}
	
	if(differenceWidth>0) {
		if(upWidth) {
			newFrame.size.width = newFrame.size.width + (differenceWidth*progress);
		} else {
			newFrame.size.width = newFrame.size.width - (differenceWidth*progress);
		}
	}
	
	if(differenceHeight>0) {
		if(upHeight) {
			newFrame.size.height = newFrame.size.height + (differenceHeight*progress);
		} else {
			newFrame.size.height = newFrame.size.height - (differenceHeight*progress);
		}
	}
	
	layer.setFrame(newFrame.integralRect());
}

Canworks.Animations.PropertyHandlers.backgroundColorHandler = function (layer, from, to, progress) {
	var toColor = to;
	var fromColor = from;
	
	var differenceR = toColor.r - fromColor.r;
	var upR = true;
	if (toColor.r < fromColor.r) {
	    upR = false;
		differenceR = fromColor.r - toColor.r;
	}
	
	var differenceG = toColor.g - fromColor.g;
	var upG = true;
	if (toColor.g < fromColor.g) {
	    upG = false;
		differenceG = fromColor.g - toColor.g;
	}
	
	var differenceB = toColor.b - fromColor.b;
	var upB = true;
	if (toColor.b < fromColor.b) {
	    upB = false;
		differenceB = fromColor.b - toColor.b;
	}
	
	var differenceA = toColor.a - fromColor.a;
	var upA = true;
	if (toColor.a < fromColor.a) {
	    upA = false;
		differenceA = fromColor.a - toColor.a;
	}
	
	var newColor = fromColor.copy();
	
	if(differenceR>0) {
		if(upR) {
			newColor.r = newColor.r + (differenceR*progress);
		} else {
			newColor.r = newColor.r - (differenceR*progress);
		}
		newColor.r = parseInt(newColor.r);
	}
	
	if(differenceG>0) {
		if(upG) {
			newColor.g = newColor.g + (differenceG*progress);
		} else {
			newColor.g = newColor.g - (differenceG*progress);
		}
		newColor.g = parseInt(newColor.g);
	}
	
	if(differenceB>0) {
		if(upB) {
			newColor.b = newColor.b + (differenceB*progress);
		} else {
			newColor.b = newColor.b - (differenceB*progress);
		}
		newColor.b = parseInt(newColor.b);
	}
	
	if(differenceA>0) {
		if(upA) {
			newColor.a = newColor.a + (differenceA*progress);
		} else {
			newColor.a = newColor.a - (differenceA*progress);
		}
		newColor.a = parseFloat(newColor.a);
	}
	
	layer.setBackgroundColor(Canworks.Color.convertRGBAColorToRGBAColorString(newColor));
}