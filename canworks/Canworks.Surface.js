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

// ------------------------------
// Surface class definition
// ------------------------------

Canworks.Surface = function (parentElement, frame)  {
	Canworks.Object.call(this);
	
	if(frame) {
		this.setFrame(frame);
	}
	this.sublayers = new Array();

	var newCanvasID = "Canworks_Canvas_" + Canworks.getSurfaces().length;

	var newCanvas = document.createElement('canvas');
	newCanvas.setAttribute('width', frame.getWidth());
	newCanvas.setAttribute('height', frame.getHeight());
	newCanvas.setAttribute('id', newCanvasID);
	newCanvas.style.marginTop = frame.getMinX() + 'px';
	newCanvas.style.marginLeft = frame.getMinY() + 'px';

	parentElement.appendChild(newCanvas);

	this.canvasElementID = newCanvasID;
	this.canvasElement = newCanvas;
	this.canvasElement.Canworks = this.canvasElement.Canworks || {};
	this.canvasElement.Canworks.surface = this;
	this.canvasContext = Canworks.getContextOfCanvas(this.canvasElement);
	
	Canworks.addSurface(this);
	
	// interaction
	newCanvas.onmousedown = this.interactionPointerDown;
	newCanvas.onmouseup = this.interactionPointerUp;
	newCanvas.onmousemove = this.interactionPointerMove;
	newCanvas.onmouseover = this.interactionPointerOver;
	newCanvas.onmouseout = this.interactionPointerOut;
}

Canworks.Surface.prototype = new Canworks.Responder;
Canworks.Surface.prototype.constructor = Canworks.Surface;
Canworks.Surface.prototype.dirty = false;
Canworks.Surface.prototype.interactionPointerIsDown = false;
Canworks.Surface.prototype.interactionPointerIsDragging = false;
Canworks.Surface.prototype.canvasElement = null;
Canworks.Surface.prototype.canvasContext = null;
Canworks.Surface.prototype.canvasElementID = null;
Canworks.Surface.prototype.sublayers = null;
Canworks.Surface.prototype.frame = null;
Canworks.Surface.prototype._deepSublayerList = null;
Canworks.Surface.prototype.currentInteractionLayer = null;
Canworks.Surface.prototype.firstResponderState = false;
Canworks.Surface.prototype.currentFirstResponder = null;

Canworks.Surface.prototype.setCurrentFirstResponder = function(responder) {
	if (responder.isFirstResponder()==true) {
		return true;
	}
	if(this.currentFirstResponder!=null) {
		if(this.currentFirstResponder.canResignFirstResponder()==false) {
			return false;
		}
		if(this.currentFirstResponder.resignFirstResponder()==false) {
			return false;
		}
	}
	this.currentFirstResponder = responder;
	if (responder.becomeFirstResponder()==false) {
		return false;
	}
	return true;
};

Canworks.Surface.prototype.getCurrentFirstResponder = function() {
	return this.currentFirstResponder;
};

Canworks.Surface.prototype.setCurrentInteractionLayerWithEvent = function(layer, event) {
	if(this.getCurrentInteractionLayer()!=layer) {
		if(this.getCurrentInteractionLayer()!=null) {
			this.getCurrentInteractionLayer().interactionPointerOut(this.getCurrentInteractionLayer().getLastHitTestPoint(), event);
		}
		this.currentInteractionLayer = layer;
		if (this.getCurrentInteractionLayer()!=null) {
			this.getCurrentInteractionLayer().interactionPointerOver(this.getCurrentInteractionLayer().getLastHitTestPoint(), event);
		}
	}
	return this;
};

Canworks.Surface.prototype.getCurrentInteractionLayer = function() {
	return this.currentInteractionLayer;
};

Canworks.Surface.prototype.interactionPointerDown = function(event) {
	event.preventDefault();
	
	this.Canworks.surface.setInteractionPointerIsDown(true);
	if (this.Canworks.surface.isInteractionPointerDragging()==true) {
		this.Canworks.surface.setInteractionPointerIsDragging(false);
	}
	
	this.Canworks.surface.sendEventToSublayers(event, 'down');
	
	//Canworks.log("mouseDown");
	//Canworks.log(event);
};

Canworks.Surface.prototype.interactionPointerUp = function(event) {
	event.preventDefault();
	
	this.Canworks.surface.setInteractionPointerIsDown(false);
	if (this.Canworks.surface.isInteractionPointerDragging()==true) {
		this.Canworks.surface.setInteractionPointerIsDragging(false);
	}
	
	this.Canworks.surface.sendEventToSublayers(event, 'up');
	
	//Canworks.log("mouseUp");
	//Canworks.log(event);
};

Canworks.Surface.prototype.interactionPointerMove = function(event) {
	event.preventDefault();
	
	if (this.Canworks.surface.isInteractionPointerDown()==true && this.Canworks.surface.isInteractionPointerDragging()==false) {
		this.Canworks.surface.setInteractionPointerIsDragging(true);
	}
	
	if (this.Canworks.surface.isInteractionPointerDragging()==true) {
		this.Canworks.surface.sendEventToSublayers(event, 'drag');
	} else {
		this.Canworks.surface.sendEventToSublayers(event, 'move');
	}
	
	//Canworks.log("mouseMove");
	//Canworks.log(event);
};

Canworks.Surface.prototype.interactionPointerOver = function(event) {
	event.preventDefault();
	//Canworks.log("mouseOver");
	//Canworks.log(event);
};

Canworks.Surface.prototype.interactionPointerOut = function(event) {
	event.preventDefault();
	if(this.Canworks.surface.setCurrentFirstResponder(this.Canworks.surface)==true) {
		this.Canworks.surface.setCurrentInteractionLayerWithEvent(null, null);
	}
	//Canworks.log("mouseOut");
	//Canworks.log(event);
};

Canworks.Surface.prototype.setInteractionPointerIsDown = function(flag) {
	this.interactionPointerIsDown = flag;
	return this;
};

Canworks.Surface.prototype.isInteractionPointerDown = function() {
	return this.interactionPointerIsDown;
};

Canworks.Surface.prototype.setInteractionPointerIsDragging = function(flag) {
	this.interactionPointerIsDragging = flag;
	return this;
};

Canworks.Surface.prototype.isInteractionPointerDragging = function() {
	return this.interactionPointerIsDragging;
};

Canworks.Surface.prototype.sendEventToSublayers = function(event, type) {
	var len = this.getSublayers().length;
	var interactionLayer = null;
	for(var i=len-1; i>=0; i--) {
		var sublayer = this.getSublayers()[i];
		if(sublayer.alpha>0.01 && sublayer.hidden==false && sublayer.userInteractionEnabled==true) {
			var eventPositionPoint = new Canworks.Point(event.offsetX, event.offsetY);
			eventPositionPoint.x = eventPositionPoint.x - sublayer.frame.origin.x;
			eventPositionPoint.y = eventPositionPoint.y - sublayer.frame.origin.y;
			var hitLayer = sublayer.hitTest(eventPositionPoint, event);
			if(hitLayer!=null) {
				interactionLayer = hitLayer;
			}
		}
	}
	
	if (interactionLayer!=null) {
		if(interactionLayer.canBecomeFirstResponder()==false) {
			interactionLayer = this.getNextResponderForResponder(interactionLayer);
		}
		if (interactionLayer!=null) {
			if(this.setCurrentFirstResponder(interactionLayer)==true) {
				this.setCurrentInteractionLayerWithEvent(interactionLayer, event);
			}
		} else {
			if(this.setCurrentFirstResponder(this)==true) {
				this.setCurrentInteractionLayerWithEvent(null, null);
			}
		}
	} else {
		if(this.setCurrentFirstResponder(this)==true) {
			this.setCurrentInteractionLayerWithEvent(null, null);
		}
	}
	
	if (this.getCurrentInteractionLayer()!=null) {
		if(type=='down') {
			this.getCurrentInteractionLayer().interactionPointerDown(this.getCurrentInteractionLayer().getLastHitTestPoint(), event);
		}
		if(type=='up') {
			this.getCurrentInteractionLayer().interactionPointerUp(this.getCurrentInteractionLayer().getLastHitTestPoint(), event);
		}
		if(type=='move') {
			this.getCurrentInteractionLayer().interactionPointerMove(this.getCurrentInteractionLayer().getLastHitTestPoint(), event);
		}
		if(type=='drag') {
			this.getCurrentInteractionLayer().interactionPointerDrag(this.getCurrentInteractionLayer().getLastHitTestPoint(), event);
		}
	}
	
};

Canworks.Surface.prototype.getNextResponderForResponder = function(responder) {
	if (responder.nextResponder()==null) {
		return null;
	}
	if (responder.nextResponder().canBecomeFirstResponder()) {
		return responder.nextResponder();
	} else {
		return this.getNextResponderForResponder(responder.nextResponder());
	}
};

Canworks.Surface.prototype.getCanvasElementID = function() {
	return this.canvasElementID;
};

Canworks.Surface.prototype.getCanvasElement = function() {
	return this.canvasElement;
};

Canworks.Surface.prototype.setDirty = function(dirty) {
	this.dirty = dirty;
	return this;
};

Canworks.Surface.prototype.isDirty = function() {
	return this.dirty;
};

Canworks.Surface.prototype.setFrame = function(frame) {
	if (this.frame!=null) {
		var flag = false;
		if (this.frame.origin.x==frame.origin.x &&
		    this.frame.origin.y==frame.origin.y &&
		    this.frame.size.width==frame.size.width &&
		    this.frame.size.height==frame.size.height) {
			flag = true;
		}
		if(flag==false) {
			this.setDirty(true);
		}
	} else {
		this.setDirty(true);
	}
	this.frame = frame;
	return this;
};

Canworks.Surface.prototype.getFrame = function() {
	return this.frame;
};

Canworks.Surface.prototype.clearDeepSublayerList = function() {
	this._deepSublayerList = null;
}

Canworks.Surface.prototype.getDeepSublayerList = function() {
	
	if (this._deepSublayerList!=null) {
		return this._deepSublayerList;
	}
	
	var list = new Array();
	var zIndex = 0;
	
	function getSublayerListOfLayer(layer) {
		if(layer instanceof Canworks.Surface == false) {
			list[list.length] = layer;
		}
		var len = layer.sublayers.length;
		if(len>0) {
			for(var i=0; i<len; i++) {
				var sublayer = layer.sublayers[i];
				getSublayerListOfLayer(sublayer);
			}
		}
		
	}
	
	getSublayerListOfLayer(this);
	
	this._deepSublayerList = list;
	
	return list;
};

Canworks.Surface.prototype.getSublayers = function() {
	return this.sublayers;
};

Canworks.Surface.prototype.addSublayer = function(sublayer) {
	this.getSublayers().push(sublayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
};

Canworks.Surface.prototype.insertSublayerAboveSublayer = function(sublayer, aboveLayer) {
	var indexOfLayer = this.getSublayers().indexOf(aboveLayer);
	this.getSublayers().splice(indexOfLayer, 1, aboveLayer, sublayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
}

Canworks.Surface.prototype.insertSublayerAtIndex = function(sublayer, index) {
	var currentLayer = this.getSublayers()[index];
	this.getSublayers().splice(index, 1, sublayer, currentLayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
}

Canworks.Surface.prototype.insertSublayerBelowSublayer = function(sublayer, belowLayer) {
	var indexOfLayer = this.getSublayers().indexOf(belowLayer);
	this.getSublayers().splice(indexOfLayer, 1, sublayer, belowLayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
}

Canworks.Surface.prototype.didAddSublayer = function(sublayer) {
	this.clearDeepSublayerList();
}

Canworks.Surface.prototype.willRemoveSublayer = function(sublayer) {
	
}

Canworks.Surface.prototype.didRemoveSublayer = function(sublayer) {
	this.clearDeepSublayerList();
}

Canworks.Surface.prototype.removeSublayer = function(sublayer) {
	sublayer.setSuperlayer(null);
	var indexOfLayer = this.getSublayers().indexOf(sublayer);
	this.willRemoveSublayer(sublayer);
	this.getSublayers().splice(indexOfLayer, 1);
	this.didRemoveSublayer(sublayer);
	this.setDirty(true);
	return this;
};

Canworks.Surface.prototype.isDescendantOfLayer = function(superlayer) {
	if(superlayer==this || superlayer==this.superlayer) {
		return true;
	}
	if(superlayer==null) {
		return false;
	}
	return this.superlayer.isDescendantOfLayer(superlayer);
}

Canworks.Surface.prototype.bringSublayerToFront = function(sublayer) {
	var indexOfLayer = this.getSublayers().indexOf(sublayer);
	this.getSublayers().splice(indexOfLayer, 1);
	this.getSublayers().push(sublayer);
	this.setDirty(true);
	return this;
};

Canworks.Surface.prototype.exchangeSublayerAtIndexWithSublayerAtIndex = function (firstLayerIndex, secondLayerIndex) {
	var firstLayer = this.getSublayers()[firstLayerIndex];
	var secondLayer = this.getSublayers()[secondLayerIndex];
	
	this.getSublayers().splice(firstLayerIndex, 1, secondLayer);
	this.getSublayers().splice(secondLayerIndex, 1, firstLayer);
	
	this.setDirty(true);
	
	return this;
}

Canworks.Surface.prototype.sendSublayerToBack  = function(sublayer) {
	var indexOfLayer = this.getSublayers().indexOf(sublayer);
	this.getSublayers().splice(indexOfLayer, 1);
	this.getSublayers().unshift(sublayer);
	
	this.setDirty(true);
	
	return this;
};

Canworks.Surface.prototype.removeFromSuperlayer = function() {
	this.superlayer.removeSublayer(this);
	return this;
}

Canworks.Surface.prototype.layerWithTag = function(tag) {
	var len = this.getSublayers().length;
	for(var i=0; i<len; i++) {
		var sublayer = this.getSublayers()[i];
		if(sublayer.getTag()==tag) {
			return sublayer;
		}
	}
	return null;
}

// Canworks.Responder subclassing

Canworks.Surface.prototype.canBecomeFirstResponder = function () {
	return true;
}

Canworks.Surface.prototype.becomeFirstResponder = function () {
	this.firstResponderState = true;
	return Canworks.Responder.prototype.becomeFirstResponder.call(this);
}

Canworks.Surface.prototype.canResignFirstResponder = function () {
	return Canworks.Responder.prototype.canResignFirstResponder.call(this);
}

Canworks.Surface.prototype.resignFirstResponder = function () {
	this.firstResponderState = false;
	return Canworks.Responder.prototype.resignFirstResponder.call(this);
}

Canworks.Surface.prototype.isFirstResponder = function () {
	return this.firstResponderState;
}

Canworks.Surface.prototype.nextResponder = function () {
	return null;
}