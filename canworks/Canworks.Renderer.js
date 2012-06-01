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
// Renderer definition
// ----------------------------

Canworks.Renderer = Canworks.Renderer || {};
Canworks.Renderer.measureStart = 0;
Canworks.Renderer.frameCounter = 0;
Canworks.Renderer.rendererTimerReference = null;
Canworks.Renderer.FPS = 0;
Canworks.Renderer.sublayerAlphaBlendingEnabled = false;
Canworks.Renderer.showFPS = false;
Canworks.Renderer.showFPSDOMElement = null;
Canworks.Renderer.showMSDOMElement = null;
Canworks.Renderer.maxFPS = 60;
Canworks.Renderer.MSNeededForLayouting = 0;
Canworks.Renderer.MSNeededForRendering = 0;
Canworks.Renderer.MSNeededForCompositing = 0;
Canworks.Renderer.MSNeededForDrawing = 0;
Canworks.Renderer.MSNeededComplete = 0;
Canworks.Renderer.isRendering = false;
Canworks.Renderer.dirtyFrames = [];
Canworks.Renderer.existingDirtyFrames = [];
Canworks.Renderer.dirtyFramesThreshold = 150;

Canworks.Renderer.setSublayerAlphaBlendingEnabled = function(sublayerAlphaBlendingEnabled) {
	Canworks.Renderer.sublayerAlphaBlendingEnabled = sublayerAlphaBlendingEnabled;
}

Canworks.Renderer.isSublayerAlphaBlendingEnabled = function() {
	return Canworks.Renderer.sublayerAlphaBlendingEnabled;
}

Canworks.Renderer.setMaxFPS = function(maxFPS) {
	Canworks.Renderer.maxFPS = maxFPS;
}

Canworks.Renderer.startRendering = function() {
	clearTimeout(Canworks.Renderer.rendererTimerReference);
	Canworks.Renderer.isRendering = true;
	Canworks.Renderer.rendererTimerReference = setTimeout ( Canworks.Renderer.render, 1000/Canworks.Renderer.maxFPS );
}

Canworks.Renderer.stopRendering = function() {
	Canworks.Renderer.isRendering = false;
	clearTimeout(Canworks.Renderer.rendererTimerReference);
}

Canworks.Renderer.setShowFPS = function(flag, inDOMElement, MSInDOMElement) {
	if (flag==true) {
		Canworks.Renderer.showFPSDOMElement = inDOMElement;
		Canworks.Renderer.showMSDOMElement = MSInDOMElement;
	} else {
		Canworks.Renderer.measureStart = 0;
		Canworks.Renderer.frameCounter = 0;
		Canworks.Renderer.FPS = 0;
		Canworks.Renderer.showFPSDOMElement = null;
		Canworks.Renderer.showMSDOMElement = null;
	}
	Canworks.Renderer.showFPS = flag;
}


// ----------------------------
// Main render loop
// ----------------------------

Canworks.Renderer.render = function() {
	var frameRenderTimeStart = 0;
	if (Canworks.Renderer.showFPS==true) {
		var currentDate = new Date();
		var ms = currentDate.getTime();
		frameRenderTimeStart = ms;
		
		if(Canworks.Renderer.measureStart==0) {
			Canworks.Renderer.measureStart = ms;
		} else {
			var difference = ms - Canworks.Renderer.measureStart;
			if (difference>=1000) {
				Canworks.Renderer.measureStart = 0;
				Canworks.Renderer.FPS = Canworks.Renderer.frameCounter;
				Canworks.Renderer.frameCounter = 0;
				if(Canworks.Renderer.showFPSDOMElement!=null) {
					Canworks.Renderer.showFPSDOMElement.innerHTML = Canworks.Renderer.FPS + " fps";
				}
			}
		}
	}
	

	var len = Canworks.surfaces.length;
	var frameRendered = false;
	for(var i=0; i<len; i++) {
		var surface =  Canworks.surfaces[i];
		if(surface.dirty==true) {
		    frameRendered = true;
			//Canworks.log("Rendering ----------- START");
			//var context = Canworks.getCurrentGlobalGraphicsContext(surface);
			//context.clearRect(0, 0, surface.getFrame().getWidth(), surface.getFrame().getHeight());
			var len = surface.sublayers.length;
			if(len>0) {
				//Canworks.log("Checking sub layers of surface " + surface.UID);
				
				Canworks.Renderer.markOffscreenLayers(surface);
				
				var currentDate = new Date();
				var layoutStart = currentDate.getTime();
				
				for(var i=0; i<len; i++) {
					var layer = surface.sublayers[i];
					if(layer.layoutDirty==true) {
						Canworks.Renderer.layoutLayer(layer, layer.frame);
					}
				}
				
				var currentDate = new Date();
				var layoutEnd = currentDate.getTime();
		
				Canworks.Renderer.MSNeededForLayouting = layoutEnd - layoutStart;
				
				var renderStart = layoutEnd;
				
				for(var i=0; i<len; i++) {
					var layer = surface.sublayers[i];
					if(layer.dirty==true && layer._isOffscreen==false) {
						Canworks.Renderer.renderLayer(layer, layer.frame);
					}
				}
				
				var currentDate = new Date();
				var renderEnd = currentDate.getTime();
		
				Canworks.Renderer.MSNeededForRendering = renderEnd - renderStart;
				
				var compositingStart = renderEnd;
				
				for(var i=0; i<len; i++) {
					var layer = surface.sublayers[i];
					if(layer.dirty==true && layer._isOffscreen==false) {
						Canworks.Renderer.composeLayer(layer, layer.frame);
					} else if(layer._isOffscreen==false) {
						Canworks.Renderer.composeLayer(layer, layer.frame);
					} else {
						layer.layoutDirty = false;
					}
				}
				
				var currentDate = new Date();
				var compositingEnd = currentDate.getTime();
		
				Canworks.Renderer.MSNeededForCompositing = compositingEnd - compositingStart;
			}
			
			var currentDate = new Date();
			var drawingStart = currentDate.getTime();
			
			Canworks.Renderer.drawSurface(surface);
			
			var currentDate = new Date();
			var drawingEnd = currentDate.getTime();
		
			Canworks.Renderer.MSNeededForDrawing = drawingEnd - drawingStart;
			
			surface.dirty = false;
			
			//Canworks.log("Rendering ----------- STOP\n\n");
		}
	}
	
	if (frameRendered==true && Canworks.Renderer.showFPS==true) {
		Canworks.Renderer.frameCounter++;
	}
	
	if (Canworks.Renderer.showFPS==true && frameRendered==true) {
		var currentDate = new Date();
		var ms = currentDate.getTime();
		
		Canworks.Renderer.MSNeededComplete = ms - frameRenderTimeStart;
		if(Canworks.Renderer.showMSDOMElement!=null) {
			Canworks.Renderer.showMSDOMElement.innerHTML = "OV: " + Canworks.Renderer.MSNeededComplete + " ms | ";
			Canworks.Renderer.showMSDOMElement.innerHTML += "L: " + Canworks.Renderer.MSNeededForLayouting + " ms | ";
			Canworks.Renderer.showMSDOMElement.innerHTML += "R: " + Canworks.Renderer.MSNeededForRendering + " ms | ";
			Canworks.Renderer.showMSDOMElement.innerHTML += "C: " + Canworks.Renderer.MSNeededForCompositing + " ms | ";
			Canworks.Renderer.showMSDOMElement.innerHTML += "D: " + Canworks.Renderer.MSNeededForDrawing + " ms";
		}
	}
	
	if(Canworks.Renderer.isRendering==true) {
		Canworks.Renderer.rendererTimerReference = setTimeout ( "Canworks.Renderer.render()", 1000/Canworks.Renderer.maxFPS );
	}
}



// ----------------------------
// Drawing
// ----------------------------

Canworks.Renderer.markOffscreenLayers = function(surface) {
	var sublayerList = surface.getDeepSublayerList();
	var len = sublayerList.length;
	if(len>0) {
		var surfaceWidth = surface.frame.size.width;
		var surfaceHeight = surface.frame.size.height;
		for(var i=0; i<len; i++) {
			var layer = sublayerList[i];
			var layerFrame = layer.getFrameInSurface();
			
			layer._isOffscreen = false;
			
			if (layerFrame.origin.x+layerFrame.size.width<0 ||
			    layerFrame.origin.y+layerFrame.size.height<0 ||
			    layerFrame.origin.x>surfaceWidth ||
			    layerFrame.origin.y>surfaceHeight) {
			    layer._isOffscreen = true;
			}
		}
	}
}

Canworks.Renderer.getLayersAffectedByDirtyFrame = function (layers, frame) {
	var affectedLayers = [];
	var len = layers.length;
	var counter = 0;
	if(len>0) {
		for(var i=0; i<len; i++) {
			var layer = layers[i];
			if (layer._isOffscreen==true || layer.alpha==0.0 || layer.hidden==true) {
				continue;
			}
			if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
				if (layer.superlayer instanceof Canworks.Surface == false) {
					continue;
				}
			}
			var layerFrame = layer.getFrameInSurface();
			var flag = false;
			
			if (frame.origin.x>=layerFrame.origin.x &&
			    frame.origin.y>=layerFrame.origin.y &&
			    (frame.origin.x+frame.size.width)<=(layerFrame.origin.x+layerFrame.size.width) &&
			    (frame.origin.y+frame.size.height)<=(layerFrame.origin.y+layerFrame.size.height)) {
				flag = true;
			}
			
			if(flag==false) {
				var intersection = new Canworks.Rect(Math.max(frame.origin.x, layerFrame.origin.x), Math.max(frame.origin.y, layerFrame.origin.y), 0, 0);
				intersection.size.width = Math.min(frame.origin.x+frame.size.width, layerFrame.origin.x+layerFrame.size.width) - intersection.origin.x;
				intersection.size.height = Math.min(frame.origin.y+frame.size.height, layerFrame.origin.y+layerFrame.size.height) - intersection.origin.y;
				
				if (intersection.size.width>0 && intersection.size.height>0) {
					flag = true;
				}
			}
			
			if(flag==true) {
				//Canworks.log("Dirty rect "+frame.toString()+" intersects layer "+layer.UID+" ("+layerFrame.toString()+")");
				//affectedLayers.push(layer);
				affectedLayers[counter] = layer;
				counter++;
			}
		}
	}
	return affectedLayers;
}

Canworks.Renderer.consolidateDirtyFrames = function (surface) {
	//Canworks.log("Consolidating dirty frames");
	
	
	/*
		Remove dirty rectangles which are inside of other dirty rectangles
	*/
	if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
		function rectIsInsideOfOtherRect(rect) {
			var len = Canworks.Renderer.dirtyFrames.length;
			if(len>0) {
				for(var i=0; i<len; i++) {
					var frameToCompare = Canworks.Renderer.dirtyFrames[i];
					if (rect.origin.x==frameToCompare.origin.x &&
					    rect.origin.y==frameToCompare.origin.y &&
					    rect.size.width==frameToCompare.size.width &&
					    rect.size.height==frameToCompare.size.height) {
						continue;
					}
					if (rect.origin.x>=frameToCompare.origin.x &&
					    rect.origin.y>=frameToCompare.origin.y &&
					    (rect.origin.x+rect.size.width)<=(frameToCompare.origin.x+frameToCompare.size.width) &&
					    (rect.origin.y+rect.size.height)<=(frameToCompare.origin.y+frameToCompare.size.height)) {
						return true;
					}
				}
			}
			return false;
		}
		
		var framesToRemove = [];
		
		var len = Canworks.Renderer.dirtyFrames.length;
		if(len>0) {
			var counter = 0;
			for(var i=0; i<len; i++) {
				var existingFrame = Canworks.Renderer.dirtyFrames[i];
				var isInside = rectIsInsideOfOtherRect(existingFrame);
				if(isInside) { 
					framesToRemove[counter] = existingFrame;
					counter++;
				}
			}
		}
		
		var len = framesToRemove.length;
		if(len>0) {
			for(var i=0; i<len; i++) {
				var frameToRemove = framesToRemove[i];
				//Canworks.log("Removing dirty rectangle: "+ frameToRemove.toString());
				Canworks.Renderer.removeDirtyFrame(frameToRemove);
			}
		}
	}
	
	/*
		Remove dirty rectangles which are offscreen
	*/
	
	
	var framesToRemove = [];
	var len = Canworks.Renderer.dirtyFrames.length;
	if(len>0) {
		var counter = 0;
		var surfaceWidth = surface.frame.size.width;
		var surfaceHeight = surface.frame.size.height;
		for(var i=0; i<len; i++) {
			var existingFrame = Canworks.Renderer.dirtyFrames[i];
			
			var isOffscreen = false;
			
			if ((existingFrame.origin.x+existingFrame.size.width)<0 ||
			    (existingFrame.origin.y+existingFrame.size.height)<0 ||
			    existingFrame.origin.x>surfaceWidth ||
			    existingFrame.origin.y>surfaceHeight) {
			    isOffscreen = true;
			}
			
			if(isOffscreen) {
				framesToRemove[counter] = existingFrame;
				counter++;
			}
		}
	}
	
	var len = framesToRemove.length;
	if(len>0) {
		for(var i=0; i<len; i++) {
			var frameToRemove = framesToRemove[i];
			Canworks.Renderer.removeDirtyFrame(frameToRemove);
		}
	}
	
	
	/*
		If we still have too much dirty rectangles, redraw the whole surface
	*/
	
	var len = Canworks.Renderer.dirtyFrames.length;
	if (len>Canworks.Renderer.dirtyFramesThreshold) {
		Canworks.Renderer.dirtyFrames = null;
		Canworks.Renderer.dirtyFrames = [];
		Canworks.Renderer.dirtyFrames[0] = new Canworks.Rect(0, 0, surface.frame.size.width, surface.frame.size.height);
		return;
	}
	
	
	/*
		Consolidate overlapping rectangle areas
	*/
	
	// dont check dirty rect intersection if isSublayerAlphaBlendingEnabled == false - bad performance
	if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
		
		function rectIntersectsOtherRect(rect) {
			var len = Canworks.Renderer.dirtyFrames.length;
			if(len>0) {
				for(var i=0; i<len; i++) {
					var frameToCompare = Canworks.Renderer.dirtyFrames[i];
					if (rect.origin.x==frameToCompare.origin.x &&
					    rect.origin.y==frameToCompare.origin.y &&
					    rect.size.width==frameToCompare.size.width &&
					    rect.size.height==frameToCompare.size.height) {
						continue;
					}
					var flag = false;
					
					var intersection = new Canworks.Rect(Math.max(rect.origin.x, frameToCompare.origin.x), Math.max(rect.origin.y, frameToCompare.origin.y), 0, 0);
					intersection.size.width = Math.min(rect.origin.x+rect.size.width, frameToCompare.origin.x+frameToCompare.size.width) - intersection.origin.x;
	   				intersection.size.height = Math.min(rect.origin.y+rect.size.height, frameToCompare.origin.y+frameToCompare.size.height) - intersection.origin.y;
					if (intersection.size.width>0 && intersection.size.height>0) {
						flag = true;
					}
					if(flag==true) {
						//Canworks.log("Rect "+rect.toString()+" intersects Rect "+frameToCompare.toString());
						var intersectionRect = intersection;
						//Canworks.log("Intersection: " + intersectionRect.toString());
						var frameToCut = null;
						if(intersectionRect.origin.x==rect.origin.x &&
						   intersectionRect.origin.y==rect.origin.y) {
							frameToCut = rect;
						} else {
							frameToCut = frameToCompare;
						}
						if (frameToCut.size.width!=intersectionRect.size.width &&
						    frameToCut.size.height!=intersectionRect.size.height) {
							//Canworks.log("No cutting of rect allowed: " + frameToCut.toString());
						} else {
							//Canworks.log("Changing dimensions of rect: " + frameToCut.toString());
							if (frameToCut.size.width!=intersectionRect.size.width) {
								//Canworks.log("Cutting width");
								frameToCut.origin.x += intersectionRect.size.width;
								frameToCut.size.width -= intersectionRect.size.width;
							} else {
								//Canworks.log("Cutting height");
								frameToCut.origin.y += intersectionRect.size.height;
								frameToCut.size.height -= intersectionRect.size.height;
							}
							//Canworks.log("New dimensions of rect: " + frameToCut.toString());
						}
					}
				}
			}
		}
		
		var len = Canworks.Renderer.dirtyFrames.length;
		if(len>0) {
			for(var i=0; i<len; i++) {
				var existingFrame = Canworks.Renderer.dirtyFrames[i];
				rectIntersectsOtherRect(existingFrame);
			}
		}
	}
}

Canworks.Renderer.addDirtyFrame = function(frame) {
	var len = Canworks.Renderer.dirtyFrames.length;
	/*if (len>Canworks.Renderer.dirtyFramesThreshold) {
		return;
	}*/
	
	var key = frame.origin.x + "" + frame.origin.y + "" + frame.size.width + "" + frame.size.height;
	if (Canworks.Renderer.existingDirtyFrames[key]==1) {
		return;
	}
	//Canworks.log("Adding dirty frame " + frame.toString());
	Canworks.Renderer.dirtyFrames[len] = frame;
	Canworks.Renderer.existingDirtyFrames[key] = 1;
	//Canworks.Renderer.consolidateDirtyFramesForFrame(frame);
}

Canworks.Renderer.removeDirtyFrame = function(frame) {
	var indexOfFrame = Canworks.Renderer.dirtyFrames.indexOf(frame);
	Canworks.Renderer.dirtyFrames.splice(indexOfFrame, 1);
}


Canworks.Renderer.drawSurface = function(surface) {
	var globalContext = surface.canvasContext;
	var sublayerList = surface.getDeepSublayerList();
	
	//Canworks.log(sublayerList);
	
	//Canworks.log(Canworks.Renderer.dirtyFrames);
	
	Canworks.Renderer.consolidateDirtyFrames(surface);
	
	//Canworks.log("\n\n\n");
	
	var len = Canworks.Renderer.dirtyFrames.length;
	if(len>0) {
		for(var i=0; i<len; i++) {
			var dirtyFrame = Canworks.Renderer.dirtyFrames[i];
			//Canworks.log("Clearing dirty frame: " + dirtyFrame.toString());
			globalContext.clearRect(dirtyFrame.origin.x, dirtyFrame.origin.y, dirtyFrame.size.width, dirtyFrame.size.height);
			//Canworks.log("Checking dirty frame: " + dirtyFrame.toString());
			var affectedLayers = Canworks.Renderer.getLayersAffectedByDirtyFrame(sublayerList, dirtyFrame);
			var affectedLayersLen = affectedLayers.length;
			if(affectedLayersLen>0) {
				//Canworks.log("Affected layers.\n\n");
				for(var j=0; j<affectedLayersLen; j++) {
					var layer = affectedLayers[j];
					var layerFrame = layer.getFrameInSurface();
					
					var intersectionRect = new Canworks.Rect(Math.max(dirtyFrame.origin.x, layerFrame.origin.x), Math.max(dirtyFrame.origin.y, layerFrame.origin.y), 0, 0);
					intersectionRect.size.width = Math.min(dirtyFrame.origin.x+dirtyFrame.size.width, layerFrame.origin.x+layerFrame.size.width) - intersectionRect.origin.x;
	   				intersectionRect.size.height = Math.min(dirtyFrame.origin.y+dirtyFrame.size.height, layerFrame.origin.y+layerFrame.size.height) - intersectionRect.origin.y;
					
					//Canworks.log("Redrawing layer: " + layer.UID);
					//Canworks.log("Layer frame: " + layerFrame.toString());
					//Canworks.log("Intersection for redrawing: " + intersectionRect.toString());
					
					var x = intersectionRect.origin.x - layerFrame.origin.x;
					var y = intersectionRect.origin.y - layerFrame.origin.y;
					var width = intersectionRect.size.width;
					var height = intersectionRect.size.height;
					
					var sourceFrame = new Canworks.Rect(x, y, width, height);
					
					//Canworks.log("Source frame for redrawing: " + sourceFrame.toString());

					globalContext.save();
		
					globalContext.globalAlpha = layer.alpha;
					
					if(layer.alpha==1.0 && layer.opaque==true) {
						globalContext.globalCompositeOperation = "copy";
					} else {
						globalContext.globalCompositeOperation = "source-over";
					}
					
					if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
						var temporaryCanvas = Canworks.createTemporaryCanvas(layer._compositionPixelCacheBounds);
						var temporaryContext = Canworks.getContextOfCanvas(temporaryCanvas);
						
						temporaryContext.putImageData(layer._compositionPixelCache, 0, 0);
						
						globalContext.drawImage(temporaryCanvas,
					                            sourceFrame.origin.x, sourceFrame.origin.y, sourceFrame.size.width, sourceFrame.size.height,
					                            intersectionRect.origin.x, intersectionRect.origin.y, intersectionRect.size.width, intersectionRect.size.height);
					} else {
						globalContext.drawImage(layer._temporaryCanvas,
					                            sourceFrame.origin.x, sourceFrame.origin.y, sourceFrame.size.width, sourceFrame.size.height,
					                            intersectionRect.origin.x, intersectionRect.origin.y, intersectionRect.size.width, intersectionRect.size.height);
					}
					
					globalContext.restore();
				}
				
			} else {
				//Canworks.log("No affected layers.");
			}
			//Canworks.log("\n\n\n");
		}
	}
	
	Canworks.Renderer.dirtyFrames = null;
	Canworks.Renderer.dirtyFrames = [];
	Canworks.Renderer.existingDirtyFrames = null;
	Canworks.Renderer.existingDirtyFrames = [];
}



// ----------------------------
// Layouting
// ----------------------------

Canworks.Renderer.layoutLayer = function(layer, inFrame) {
	if (layer.needsLayout==true) {
	
		var isSame = false;
		if (layer._layoutFrame!=null) {
			if (layer.frame.origin.x==layer._layoutFrame.origin.x &&
			    layer.frame.origin.y==layer._layoutFrame.origin.y &&
			    layer.frame.size.width==layer._layoutFrame.size.width &&
			    layer.frame.size.height==layer._layoutFrame.size.height) {
				isSame = true;
			}
		}
		
		if(isSame==false) {
			if(layer.autoresizesSublayers==true) {
				var len = layer.sublayers.length;
				if(len>0) {
					for(var i=0; i<len; i++) {
					var sublayer = layer.sublayers[i];
						if(sublayer.getAutoresizingMask()!=Canworks.layerAutoresizing.none) {
							//Canworks.log("Autoresizing sublayer " + sublayer.UID);
							
							if (sublayer.getAutoresizingMask() & Canworks.layerAutoresizing.flexibleLeftMargin) {
								//Canworks.log(sublayer.UID + " has flexibleLeftMargin");
							}
							
							if (sublayer.getAutoresizingMask() & Canworks.layerAutoresizing.flexibleRightMargin) {
								//Canworks.log(sublayer.UID + " has flexibleRightMargin");
							}
							
							if (sublayer.getAutoresizingMask() & Canworks.layerAutoresizing.flexibleWidth) {
								//Canworks.log(sublayer.UID + " has flexibleWidth");
							}
							
							if (sublayer.getAutoresizingMask() & Canworks.layerAutoresizing.flexibleTopMargin) {
								//Canworks.log(sublayer.UID + " has flexibleTopMargin");
							}
							
							if (sublayer.getAutoresizingMask() & Canworks.layerAutoresizing.flexibleBottomMargin) {
								//Canworks.log(sublayer.UID + " has flexibleBottomMargin");
							}
							
							if (sublayer.getAutoresizingMask() & Canworks.layerAutoresizing.flexibleHeight) {
								//Canworks.log(sublayer.UID + " has flexibleHeight");
							}
						}
					}
				}
			} else {
				layer.layoutSublayers();
			}
			
			if (layer._layoutFrame!=null) {
				Canworks.Renderer.addDirtyFrame(layer._layoutFrame.copy());
			}
			
			layer._layoutFrame = layer.getFrameInSurface().copy();
			
			Canworks.Renderer.addDirtyFrame(layer._layoutFrame.copy());
		} else {
			Canworks.Renderer.addDirtyFrame(layer._layoutFrame.copy());
		}
		
		layer.needsLayout = false;
	}
	
	var len = layer.sublayers.length;
	if(len>0) {
		for(var i=0; i<len; i++) {
			var sublayer = layer.sublayers[i];
			if(sublayer.layoutDirty==true) {
				Canworks.Renderer.layoutLayer(sublayer, sublayer.frame);
			}
		}
	}
}



// ----------------------------
// Rendering
// ----------------------------

Canworks.Renderer.renderLayer = function(layer, inFrame) {
	
	if(layer.needsDisplay==true) {
	
		//Canworks.log("Drawing layer " + layer.UID);
		
		var isSame = false;
		if (layer._renderFrame!=null) {
			if (layer.frame.origin.x==layer._renderFrame.origin.x &&
			    layer.frame.origin.y==layer._renderFrame.origin.y &&
			    layer.frame.size.width==layer._renderFrame.size.width &&
			    layer.frame.size.height==layer._renderFrame.size.height) {
				isSame = true
			}
		}
		
		if(layer.hidden==false && layer.alpha!=0.0) {
			
			//Canworks.log("Drawing layer after hidden check " + layer.UID);
			
			var layerContext = Canworks.getCurrentGraphicsContext(layer);
			
			layerContext.clearRect(0, 0, layer.frame.size.width, layer.frame.size.height);
			
			layerContext.save();
			
			layer.drawInRect(layer.frame);
			
			layerContext.restore();
			
			Canworks.storeDrawPixelBufferOfLayer(layer);
			
			//Canworks.clearDisposableGraphicsContext(layer);
		}
		
		if (layer._renderFrame!=null) {
			if (isSame==false) {
				Canworks.Renderer.addDirtyFrame(layer._renderFrame.copy());
			}
		}
		
		layer._renderFrame = layer.getFrameInSurface().copy();
		Canworks.Renderer.addDirtyFrame(layer._renderFrame.copy());
		
		layer.needsDisplay = false;
	}
	
	var len = layer.sublayers.length;
	if(len>0) {
		//Canworks.log("Checking sub layers of layer " + layer.UID);
		for(var i=0; i<len; i++) {
			var sublayer = layer.sublayers[i];
			if(sublayer.dirty==true && sublayer._isOffscreen==false) {
				Canworks.Renderer.renderLayer(sublayer, sublayer.frame);
			}
		}
	}
	
	
	return this;
}



// ----------------------------
// Composing
// ----------------------------

Canworks.Renderer.composeLayer = function(layer, inFrame) {
	
	if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
	
		var layerContext = Canworks.getCurrentGraphicsContext(layer);
	
		if(layer.dirty==true || layer.layoutDirty==true) {
			//Canworks.log("Compositing layer " + layer.UID + "(" + layer.isLayoutDirty() + ")");
			
			var isSameSize = false;
			if (layer.frame.size.width==layer._drawPixelCacheBounds.size.width &&
			    layer.frame.size.height==layer._drawPixelCacheBounds.size.height) {
				isSameSize = true
			}
			
			if (layer.layoutDirty==true && isSameSize==false) {
				
				//Canworks.log("Rescaling layer " + layer.UID + "(" + layer.isLayoutDirty() + ")");
				
				var temporaryCanvas = Canworks.createTemporaryCanvas(layer._drawPixelCacheBounds);
				var temporaryContext = Canworks.getContextOfCanvas(temporaryCanvas);
				
				temporaryContext.putImageData(layer._drawPixelCache, 0, 0);
				
				layerContext.save();
			
				if(layer.alpha==1.0 && layer.opaque==true) {
					layerContext.globalCompositeOperation = "copy";
				} else {
					layerContext.globalCompositeOperation = "source-over";
				}
				
				layerContext.clearRect(0, 0, layer.frame.size.width, layer.frame.size.height);
				
				if(layer.contentMode==Canworks.layerContentMode.scaleToFill) {
					layerContext.drawImage(temporaryCanvas,
				                           0, 0, layer._drawPixelCacheBounds.size.width, layer._drawPixelCacheBounds.size.height,
				                           0, 0, layer.frame.size.width, layer.frame.size.height);
				}
				
				layerContext.restore();
				
			}
			
			layer.dirty = false;
			
			if (layer.layoutDirty==true && isSameSize==true) {
				layerContext.putImageData(layer._drawPixelCache, 0, 0);
			}
			
			var len = layer.sublayers.length;
			if(len>0) {
				//Canworks.log("Checking sub layers for composition of layer " + layer.UID);
				for(var i=0; i<len; i++) {
					var sublayer = layer.sublayers[i];
					Canworks.Renderer.composeLayer(sublayer, sublayer.frame);
				}
			}
			
			if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
				var globalContext = Canworks.getCurrentGlobalGraphicsContext(layer);
				
				if (globalContext!=null) {
					globalContext.save();
				
					globalContext.globalAlpha = layer.alpha;
					
					if(layer.alpha==1.0 && layer.opaque==true) {
						globalContext.globalCompositeOperation = "copy";
					} else {
						globalContext.globalCompositeOperation = "source-over";
					}
					
					//Canworks.log("Using composite operation '" + globalContext.globalCompositeOperation + "' for composition of layer " + layer.UID);
					
					globalContext.drawImage(layer._temporaryCanvas,
						                    0, 0, inFrame.size.width, inFrame.size.height,
						                    inFrame.origin.x, inFrame.origin.y, inFrame.size.width, inFrame.size.height);
					
					globalContext.restore();
				}
			}
			
			layer.layoutDirty = false;
			
			if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
				Canworks.storeCompositionPixelBufferOfLayer(layer);
			}
			
		} else {
			
			//Canworks.log("Restoring cached composition cache of layer " + layer.UID);
			if (Canworks.Renderer.sublayerAlphaBlendingEnabled==true) {
			
				var globalContext = Canworks.getCurrentGlobalGraphicsContext(layer);
				
				if (globalContext!=null) {
					layerContext.putImageData(layer._compositionPixelCache, 0, 0);
				
					globalContext.save();
					
					globalContext.globalAlpha = layer.alpha;
					
					if(layer.alpha==1.0 && layer.opaque==true) {
						globalContext.globalCompositeOperation = "copy";
					} else {
						globalContext.globalCompositeOperation = "source-over";
					}
					
					//Canworks.log("Using composite operation '" + globalContext.globalCompositeOperation + "' for composition cache restore of layer " + layer.UID);
					
					globalContext.drawImage(layer._temporaryCanvas,
					                        0, 0, inFrame.size.width, inFrame.size.height,
					                        inFrame.origin.x, inFrame.origin.y, inFrame.size.width, inFrame.size.height);
			
					globalContext.restore();
				}
			}
		}
	} else {
		
		var len = layer.sublayers.length;
		if(len>0) {
			//Canworks.log("Checking sub layers for composition of layer " + layer.UID);
			for(var i=0; i<len; i++) {
				var sublayer = layer.sublayers[i];
				if (sublayer._isOffscreen==false) {
					Canworks.Renderer.composeLayer(sublayer, sublayer.frame);
				} else {
					layer.layoutDirty = false;
				}
			}
		}
		
		layer.dirty = false;
		layer.layoutDirty = false;
	}
	
	//Canworks.clearDisposableGraphicsContext(layer);
	
	return this;
}