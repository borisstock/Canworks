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
// Layer Class definition
// ----------------------------

Canworks.Layer = function (frame) {
	Canworks.Object.call(this);
	
	if(frame) {
		this.setFrame(frame);
	}
	this.sublayers = new Array();
}

Canworks.Layer.prototype = new Canworks.Responder;
Canworks.Layer.prototype.constructor = Canworks.Layer;
Canworks.Layer.prototype.needsDisplay = false;
Canworks.Layer.prototype.needsLayout = false;
Canworks.Layer.prototype.dirty = false;
Canworks.Layer.prototype.layoutDirty = false;
Canworks.Layer.prototype.backgroundColor = "black";
Canworks.Layer.prototype.superlayer = null;
Canworks.Layer.prototype.transparencyClicktroughDetectionEnabled = false;
Canworks.Layer.prototype.autoresizesSublayers = true;
Canworks.Layer.prototype.autoresizingMask = Canworks.layerAutoresizing.none;
Canworks.Layer.prototype.sublayers = null;
Canworks.Layer.prototype.frame = null;
Canworks.Layer.prototype._frameInSurface = null;
Canworks.Layer.prototype._layoutFrame = null;
Canworks.Layer.prototype._renderFrame = null;
Canworks.Layer.prototype._isOffscreen = false;
Canworks.Layer.prototype.tag = "";
Canworks.Layer.prototype.alpha = 1.0;
Canworks.Layer.prototype.hidden = false;
Canworks.Layer.prototype.opaque = false;
Canworks.Layer.prototype.userInteractionEnabled = false;
Canworks.Layer.prototype.lastHitTestPoint = null;
Canworks.Layer.prototype.contentMode = Canworks.layerContentMode.scaleToFill;

Canworks.Layer.prototype.borderWidth = 0;
Canworks.Layer.prototype.borderColor = "black";

Canworks.Layer.prototype.cornerRadius = 0;

Canworks.Layer.prototype.shadowColor = "black";
Canworks.Layer.prototype.shadowOffset = new Canworks.Point(0,0);
Canworks.Layer.prototype.shadowBlur = 0;

Canworks.Layer.prototype.transform = null;

Canworks.Layer.prototype.firstResponderState = false;
Canworks.Layer.prototype._hitPixelCache = null;
Canworks.Layer.prototype._temporaryCanvas = null;
Canworks.Layer.prototype._temporaryContext = null;
Canworks.Layer.prototype._drawPixelCache = null;
Canworks.Layer.prototype._drawPixelCacheBounds = null;
Canworks.Layer.prototype._compositionPixelCache = null;
Canworks.Layer.prototype._compositionPixelCacheBounds = null;

Canworks.Layer.prototype.animations = new Array();

Canworks.Layer.prototype.getAnimations = function() {
	return this.animations;
};

Canworks.Layer.prototype.removeAnimation = function(animation) {
	var indexOfAnimation = this.getAnimations().indexOf(animation);
	this.getAnimations().splice(indexOfAnimation, 1);
	return this;
};

Canworks.Layer.prototype.addAnimation = function(animation) {
	this.getAnimations().push(animation);
	return this;
};

Canworks.Layer.prototype.setCornerRadius = function(cornerRadius) {
	if (this.cornerRadius != cornerRadius) {
		this.setNeedsDisplay(true);
	}
	this.cornerRadius = cornerRadius;
	return this;
};

Canworks.Layer.prototype.getCornerRadius = function() {
	return this.cornerRadius;
};

Canworks.Layer.prototype.setTransform = function(transform) {
	if (this.transform != transform) {
		this.setNeedsLayout(true);
	}
	this.transform = transform;
	return this;
};

Canworks.Layer.prototype.getTransform = function() {
	return this.transform;
};

Canworks.Layer.prototype.setShadowBlur = function(shadowBlur) {
	if (this.shadowBlur != shadowBlur) {
		this.setNeedsDisplay(true);
	}
	this.shadowBlur = shadowBlur;
	return this;
};

Canworks.Layer.prototype.getShadowBlur = function() {
	return this.shadowBlur;
};

Canworks.Layer.prototype.setShadowOffset = function(shadowOffset) {
	if (this.shadowOffset.x != shadowOffset.x ||
	    this.shadowOffset.y != shadowOffset.y) {
		this.setNeedsDisplay(true);
	}
	this.shadowOffset = shadowOffset;
	return this;
};

Canworks.Layer.prototype.getShadowOffset = function() {
	return this.shadowOffset;
};

Canworks.Layer.prototype.setShadowColor = function(shadowColor) {
	if (this.shadowColor != shadowColor) {
		this.setNeedsDisplay(true);
	}
	this.shadowColor = shadowColor;
	return this;
};

Canworks.Layer.prototype.getShadowColor = function() {
	return this.shadowColor;
};

Canworks.Layer.prototype.setBorderColor = function(borderColor) {
	if (this.borderColor != borderColor) {
		this.setNeedsDisplay(true);
	}
	this.borderColor = borderColor;
	return this;
};

Canworks.Layer.prototype.getBorderColor = function() {
	return this.borderColor;
};

Canworks.Layer.prototype.setBorderWidth = function(borderWidth) {
	if (this.borderWidth != borderWidth) {
		this.setNeedsDisplay(true);
	}
	this.borderWidth = borderWidth;
	return this;
};

Canworks.Layer.prototype.getBorderWidth = function() {
	return this.borderWidth;
};

Canworks.Layer.prototype.updateTransparencyClicktroughDetectionMap = function () {
	if(this.isTransparencyClicktroughDetectionEnabled()==true) {
		Canworks.clearHitPixelBufferOfLayer(this);
		Canworks.storeHitPixelBufferOfLayer(this);
	}
	return this;
}

Canworks.Layer.prototype.setTransparencyClicktroughDetectionEnabled = function(transparencyClicktroughDetectionEnabled) {
	if (transparencyClicktroughDetectionEnabled!=this.transparencyClicktroughDetectionEnabled) {
		if (transparencyClicktroughDetectionEnabled==true) {
			Canworks.storeHitPixelBufferOfLayer(this);
		}
		if (transparencyClicktroughDetectionEnabled==false) {
			Canworks.clearHitPixelBufferOfLayer(this);
		}
	}
	this.transparencyClicktroughDetectionEnabled = transparencyClicktroughDetectionEnabled;
	return this;
};

Canworks.Layer.prototype.isTransparencyClicktroughDetectionEnabled = function() {
	return this.transparencyClicktroughDetectionEnabled;
};

Canworks.Layer.prototype.setAutoresizingMask = function(autoresizingMask) {
	this.autoresizingMask = autoresizingMask;
	return this;
};

Canworks.Layer.prototype.getAutoresizingMask = function() {
	return this.autoresizingMask;
};

Canworks.Layer.prototype.setContentMode = function(contentMode) {
	this.contentMode = contentMode;
	return this;
};

Canworks.Layer.prototype.getContentMode = function() {
	return this.contentMode;
};

Canworks.Layer.prototype.setAutoresizesSublayers = function(autoresizesSublayers) {
	this.autoresizesSublayers = autoresizesSublayers;
	return this;
};

Canworks.Layer.prototype.isAutoresizingSublayers = function() {
	return this.autoresizesSublayers;
};

Canworks.Layer.prototype.setLastHitTestPoint = function(point) {
	this.lastHitTestPoint = point;
	return this;
};

Canworks.Layer.prototype.getLastHitTestPoint = function() {
	return this.lastHitTestPoint;
};

Canworks.Layer.prototype.setBounds = function(rect) {
	this.setFrame(new Canworks.Rect(this.frame.origin.x, this.frame.origin.y, rect.size.width,  rect.size.height));
	return this;
};

Canworks.Layer.prototype.getBounds = function() {
	return new Canworks.Rect(0, 0, this.frame.size.width,  this.frame.size.height);
};

Canworks.Layer.prototype.setDirty = function(dirty) {
	if(dirty==true && dirty!=this.dirty) {
		Canworks.setLayerTreeDirtyForLayer(this);
	}
	this.dirty = dirty;
	return this;
};

Canworks.Layer.prototype.isDirty = function() {
	return this.dirty;
};

Canworks.Layer.prototype.setLayoutDirty = function(layoutDirty) {
	if(layoutDirty==true && this.layoutDirty!=layoutDirty) {
		Canworks.setLayerTreeLayoutDirtyForLayer(this);
	}
	this.layoutDirty = layoutDirty;
	return this;
};

Canworks.Layer.prototype.isLayoutDirty = function() {
	return this.layoutDirty;
};

Canworks.Layer.prototype.setNeedsLayout = function(needsLayout) {
	this.needsLayout = needsLayout;
	if(needsLayout==true) {
		if(this._temporaryCanvas==null) {
			this.setNeedsDisplay(true);
		}
		this.setLayoutDirty(true);
	}
	return this;
};

Canworks.Layer.prototype.isNeedingLayout = function() {
	return this.needsLayout;
};

Canworks.Layer.prototype.setNeedsDisplay = function(needsDisplay) {
	this.needsDisplay = needsDisplay;
	if(needsDisplay==true) {
		this.setDirty(true);
	}
	return this;
};

Canworks.Layer.prototype.isNeedingDisplay = function() {
	return this.needsDisplay;
};

Canworks.Layer.prototype.setTag = function(tag) {
	this.tag = tag;
	return this;
};

Canworks.Layer.prototype.getTag = function() {
	return this.tag;
};

Canworks.Layer.prototype.setOpaque = function(opaque) {
	if(this.opaque!=opaque) {
		this.setNeedsLayout(true);
	}
	this.opaque = opaque;
	return this;
};

Canworks.Layer.prototype.isOpaque = function() {
	return this.opaque;
};


Canworks.Layer.prototype.setUserInteractionEnabled = function(userInteractionEnabled) {
	this.userInteractionEnabled = userInteractionEnabled;
	return this;
};

Canworks.Layer.prototype.isUserInteractionEnabled = function() {
	return this.userInteractionEnabled;
};

Canworks.Layer.prototype.setHidden = function(hidden) {
	if(this.hidden!=hidden) {
		this.setNeedsLayout(true);
	}
	this.hidden = hidden;
	return this;
};

Canworks.Layer.prototype.isHidden = function() {
	return this.hidden;
};

Canworks.Layer.prototype.setCenter = function(center) {
	
	var halfWidth = this.frame.size.width / 2;
	var halfHeight = this.frame.size.height / 2;
	
	var newFrame = new Canworks.Rect(center.x-halfWidth, center.y-halfHeight, this.frame.size.width, this.frame.size.height);
	this.setFrame(newFrame);
	
	return this;
};

Canworks.Layer.prototype.getCenter = function() {
	var center = new Canworks.Point(this.getFrame().getMidX(), this.getFrame().getMidY());
	return center;
};

Canworks.Layer.prototype.setAlpha = function(alpha) {
	if(Canworks.Animations.isRecording()) {
		if(this.alpha!=alpha) {
			Canworks.Animations.addAnimationValueForLayer(this, "alpha", this.alpha, alpha);
		}
		return this;
	}
	if(this.alpha!=alpha) {
		this.setNeedsLayout(true);
	}
	this.alpha = alpha;
	return this;
};

Canworks.Layer.prototype.getAlpha = function() {
	return this.alpha;
};

Canworks.Layer.prototype.setFrame = function(frame) {
	if (this.frame!=null) {
		if(Canworks.Animations.isRecording()) {
			if(this.frame.isEqualToRect(frame)==false) {
				Canworks.Animations.addAnimationValueForLayer(this, "frame", this.frame, frame);
			}
			return this;
		}
		if (this.frame.size.width!=frame.size.width ||
		    this.frame.size.height!=frame.size.height) {
			this._frameInSurface = null;
			Canworks.clearDisposableGraphicsContext(this);
			if(this.contentMode!=Canworks.layerContentMode.redraw) {
				this.setNeedsLayout(true);
			} else {
				this.setNeedsDisplay(true);
			}
		}
		if(this.frame.origin.x!=frame.origin.x ||
		   this.frame.origin.y!=frame.origin.y) {
			this._frameInSurface = null;
			this.setNeedsLayout(true);
		}
	} else {
		this._layoutFrame = frame.copy();
		this.setNeedsDisplay(true);
		this.setNeedsLayout(true);
	}
	this.frame = frame;
	return this;
};

Canworks.Layer.prototype.getFrame = function() {
	return this.frame;
};

Canworks.Layer.prototype.getPositionInSurface = function(referencePoint) {
	var position = new Canworks.Point(this.frame.origin.x, this.frame.origin.y);
	if(referencePoint) {
		if(referencePoint.x>0) {
			position.x = position.x + referencePoint.x;
		}
		if(referencePoint.y>0) {
			position.y = position.y + referencePoint.y;
		}
	}
	if (this.superlayer!=null) {
		if (this.superlayer instanceof Canworks.Layer) {
			return this.superlayer.getPositionInSurface(position);
		}
	}
	return position;
};

Canworks.Layer.prototype.getFrameInSurface = function() {
	if (this._frameInSurface!=null) {
		return this._frameInSurface;
	}
	var position = this.getPositionInSurface();
	var surfaceFrame = new Canworks.Rect(position.x, position.y, this.frame.size.width, this.frame.size.height);
	this._frameInSurface = surfaceFrame;
	return surfaceFrame;
};

Canworks.Layer.prototype.setBackgroundColor = function(color) {
	if(Canworks.Animations.isRecording()) {
		if(this.backgroundColor!=color) {
			Canworks.Animations.addAnimationValueForLayer(this, "backgroundColor", this.backgroundColor, color);
		}
		return this;
	}
	if (this.backgroundColor != color) {
		this.setNeedsDisplay(true);
	}
	this.backgroundColor = color;
	return this;
};

Canworks.Layer.prototype.getBackgroundColor = function() {
	return this.backgroundColor;
};

Canworks.Layer.prototype.setSuperlayer = function(layer) {
	this.willMoveToSuperlayer(layer);
	this.superlayer = layer;
	this.didMoveToSuperlayer();
	return this;
};

Canworks.Layer.prototype.getSuperlayer = function() {
	return this.superlayer;
};

Canworks.Layer.prototype.layoutSublayers = function() {
	return this;
};

Canworks.Layer.prototype.getSublayers = function() {
	return this.sublayers;
};

Canworks.Layer.prototype.addSublayer = function(sublayer) {
	this.getSublayers().push(sublayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
};

Canworks.Layer.prototype.insertSublayerAboveSublayer = function(sublayer, aboveLayer) {
	var indexOfLayer = this.getSublayers().indexOf(aboveLayer);
	this.getSublayers().splice(indexOfLayer, 1, aboveLayer, sublayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
}

Canworks.Layer.prototype.insertSublayerAtIndex = function(sublayer, index) {
	var currentLayer = this.getSublayers()[index];
	this.getSublayers().splice(index, 1, sublayer, currentLayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
}

Canworks.Layer.prototype.insertSublayerBelowSublayer = function(sublayer, belowLayer) {
	var indexOfLayer = this.getSublayers().indexOf(belowLayer);
	this.getSublayers().splice(indexOfLayer, 1, sublayer, belowLayer);
	sublayer.setSuperlayer(this);
	this.didAddSublayer(sublayer);
	this.setDirty(true);
	return this;
}

Canworks.Layer.prototype.didAddSublayer = function(sublayer) {
	this.clearDeepSublayerList();
}

Canworks.Layer.prototype.didMoveToSuperlayer = function() {
	
}

Canworks.Layer.prototype.willMoveToSuperlayer = function(superlayer) {
	
}

Canworks.Layer.prototype.willRemoveSublayer = function(sublayer) {
	this.clearDeepSublayerList();
}

Canworks.Layer.prototype.didRemoveSublayer = function(sublayer) {
	this.clearDeepSublayerList();
}

Canworks.Layer.prototype.removeSublayer = function(sublayer) {
	sublayer.setSuperlayer(null);
	var indexOfLayer = this.getSublayers().indexOf(sublayer);
	this.willRemoveSublayer(sublayer);
	this.getSublayers().splice(indexOfLayer, 1);
	this.didRemoveSublayer(sublayer);
	this.setDirty(true);
	return this;
};

Canworks.Layer.prototype.isDescendantOfLayer = function(superlayer) {
	if(superlayer==this || superlayer==this.superlayer) {
		return true;
	}
	if(superlayer==null) {
		return false;
	}
	return this.superlayer.isDescendantOfLayer(superlayer);
}

Canworks.Layer.prototype.bringSublayerToFront = function(sublayer) {
	var indexOfLayer = this.getSublayers().indexOf(sublayer);
	this.getSublayers().splice(indexOfLayer, 1);
	this.getSublayers().push(sublayer);
	this.setDirty(true);
	return this;
};

Canworks.Layer.prototype.exchangeSublayerAtIndexWithSublayerAtIndex = function (firstLayerIndex, secondLayerIndex) {
	var firstLayer = this.getSublayers()[firstLayerIndex];
	var secondLayer = this.getSublayers()[secondLayerIndex];
	
	this.getSublayers().splice(firstLayerIndex, 1, secondLayer);
	this.getSublayers().splice(secondLayerIndex, 1, firstLayer);
	
	this.setDirty(true);
	
	return this;
}

Canworks.Layer.prototype.sendSublayerToBack  = function(sublayer) {
	var indexOfLayer = this.getSublayers().indexOf(sublayer);
	this.getSublayers().splice(indexOfLayer, 1);
	this.getSublayers().unshift(sublayer);
	
	this.setDirty(true);
	
	return this;
};

Canworks.Layer.prototype.removeFromSuperlayer = function() {
	this.superlayer.removeSublayer(this);
	return this;
}

Canworks.Layer.prototype.clearDeepSublayerList = function() {
	if(this.superlayer!=null) {
		this.superlayer.clearDeepSublayerList();
	}
}

Canworks.Layer.prototype.layerWithTag = function(tag) {
	var len = this.getSublayers().length;
	for(var i=0; i<len; i++) {
		var sublayer = this.getSublayers()[i];
		if(sublayer.getTag()==tag) {
			return sublayer;
		}
	}
	return null;
}

Canworks.Layer.prototype.drawInRect = function(rect) {
	var context = Canworks.getCurrentGraphicsContext(this);
	context.fillStyle = this.backgroundColor;
	
	if (this.cornerRadius==0 &&
	    this.borderWidth==0 &&
	    this.shadowOffset.x==0 &&
	    this.shadowOffset.y==0) {
	    
		context.fillRect(0, 0, rect.size.width, rect.size.height);
		
	} else {
	
		var insetX = 0;
		var insetY = 0;
		
		if (this.borderWidth>0) {
			context.lineWidth = this.borderWidth;
			insetX += this.borderWidth;
			insetY += this.borderWidth;
			context.strokeStyle = this.borderColor;
		}
		
		var drawRect = new Canworks.Rect(0, 0, rect.size.width, rect.size.height);
		if(insetX>0 || insetY>0) {
			drawRect = drawRect.insetRect(insetX, insetY);
		}
		
		var shadowBlurRestX = this.shadowBlur - this.shadowOffset.x;
		var shadowBlurRestY = this.shadowBlur - this.shadowOffset.y;
		
		if (shadowBlurRestX>0) {
			drawRect.origin.x += shadowBlurRestX / 2;
	    	drawRect.size.width -= shadowBlurRestX / 2;
	    }
	    
	    if (shadowBlurRestY>0) {
			drawRect.origin.y += shadowBlurRestY / 2;
	    	drawRect.size.height -= shadowBlurRestY / 2;
	    }
		
		if (this.shadowOffset.x!=0) {
	    	if (this.shadowOffset.x<0) {
	    		drawRect.origin.x += this.shadowOffset.x;
	    		drawRect.size.width += this.shadowOffset.x;
	    		if (this.shadowBlur>0) {
	    			drawRect.origin.x += this.shadowBlur;
	    			drawRect.size.width += this.shadowBlur;
	    		}
	    	}
	    	if (this.shadowOffset.x>0) {
	    		drawRect.size.width -= this.shadowOffset.x;
	    		if (this.shadowBlur>0) {
	    			drawRect.size.width -= this.shadowBlur;
	    		}
	    	}
	    }
	    
	    if (this.shadowOffset.y!=0) {
	    	if (this.shadowOffset.y<0) {
	    		drawRect.origin.y += this.shadowOffset.y;
	    		drawRect.size.height += this.shadowOffset.y;
	    		
	    		if (this.shadowBlur>0) {
	    			drawRect.origin.y += this.shadowBlur;
	    			drawRect.size.height += this.shadowBlur;
	    		}
	    	}
	    	if (this.shadowOffset.y>0) {
	    		drawRect.size.height -= this.shadowOffset.y;
	    		if (this.shadowBlur>0) {
	    			drawRect.size.height -= this.shadowBlur;
	    		}
	    	}
	    }
	    
	    if (this.shadowOffset.x!=0 ||
	    	this.shadowOffset.y!=0) {
	    	context.shadowOffsetX = this.shadowOffset.x;
	    	context.shadowOffsetY = this.shadowOffset.y;
	    	context.shadowColor = this.shadowColor;
	    	context.shadowBlur = this.shadowBlur;
		}
		
		if(this.cornerRadius>=0) {
			Canworks.contextAddRoundedRect(context, drawRect, this.cornerRadius);
		} else {
			Canworks.contextAddRect(context, drawRect);
		}
		
		context.fill();
		
		if (this.borderWidth>0) {
			context.stroke();
		}
		
	}
	
	return this;
};

Canworks.Layer.prototype.hitTest = function(point, event) {
	if(this.alpha<0.01 || this.hidden==true || this.userInteractionEnabled==false) {
		return null;
	}
	if(this.isPointInside(point, event)==true) {
		var len = this.sublayers.length;
		for(var i=len-1; i>=0; i--) {
			var sublayer = this.sublayers[i];
			if(sublayer.alpha>0.01 && sublayer.hidden==false && sublayer.userInteractionEnabled==true) {
				var eventPositionPoint = new Canworks.Point(point.x, point.y);
				eventPositionPoint.x = eventPositionPoint.x - sublayer.frame.origin.x;
				eventPositionPoint.y = eventPositionPoint.y - sublayer.frame.origin.y;
				var interactionLayer = sublayer.hitTest(eventPositionPoint, event);
				if (interactionLayer!=null) {
					return interactionLayer;
				}
			}
		}
		if (this.transparencyClicktroughDetectionEnabled==true) {
			var isTransparentPoint = Canworks.checkPointForTransparencyInLayerHitMatrix(point, this);
			if(isTransparentPoint==true) {
				return null;
			}
		}
		this.setLastHitTestPoint(point);
		return this;
	}
	return null;
};

Canworks.Layer.prototype.isPointInside = function(point, event) {
	var isInside = false;
	if (point.x > 0 &&
	    point.y > 0 &&
	    point.x <= 0+this.frame.size.width &&
	    point.y <= 0+this.frame.size.height) {
		isInside = true;
	}
	if (isInside==true) {
		return true;
	}
	return false;
};

// Canworks.Responder subclassing

Canworks.Layer.prototype.canBecomeFirstResponder = function () {
	return true;
}

Canworks.Layer.prototype.becomeFirstResponder = function () {
	this.firstResponderState = true;
	return Canworks.Responder.prototype.becomeFirstResponder.call(this);
}

Canworks.Layer.prototype.canResignFirstResponder = function () {
	return Canworks.Responder.prototype.canResignFirstResponder.call(this);
}

Canworks.Layer.prototype.resignFirstResponder = function () {
	this.firstResponderState = false;
	return Canworks.Responder.prototype.resignFirstResponder.call(this);
}

Canworks.Layer.prototype.isFirstResponder = function () {
	return this.firstResponderState;
}

Canworks.Layer.prototype.nextResponder = function () {
	return this.superlayer;
}