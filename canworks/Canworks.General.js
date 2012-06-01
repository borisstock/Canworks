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
// Helper functions
// ----------------------------

Canworks.UIDCounter = -1;

Canworks.UID = function () {
	Canworks.UIDCounter = Canworks.UIDCounter + 1;
	var newDate = new Date;
	return "UID_" + Canworks.UIDCounter;
}

Canworks.log = function (varToLog) {
	console.log(varToLog);
}

Canworks.exception = function (exceptionToLog) {
	console.log("EXCEPTION!");
	console.log(exceptionToLog);
}

Canworks.layerContentMode = Canworks.layerContentMode || {};
Canworks.layerContentMode.redraw      = 0;
Canworks.layerContentMode.scaleToFill = 1;

Canworks.layerAutoresizing = Canworks.layerAutoresizing || {};
Canworks.layerAutoresizing.none                 = 0;
Canworks.layerAutoresizing.flexibleLeftMargin   = 0x1;
Canworks.layerAutoresizing.flexibleWidth        = 0x2
Canworks.layerAutoresizing.flexibleRightMargin  = 0x4;
Canworks.layerAutoresizing.flexibleTopMargin    = 0x8;
Canworks.layerAutoresizing.flexibleHeight       = 0x16;
Canworks.layerAutoresizing.flexibleBottomMargin = 0x32;

Canworks.surfaces = new Array();

Canworks.getSurfaces = function() {
	return Canworks.surfaces;
}

Canworks.addSurface = function(newSurface) {
	Canworks.getSurfaces().push(newSurface);
	return Canworks;
}

Canworks.getCurrentGlobalGraphicsContext = function(layer) {
	
	if (layer instanceof Canworks.Layer) {
		if (layer.superlayer!=null && layer.superlayer instanceof Canworks.Layer) {
			if(layer.superlayer._temporaryCanvas!=null) {
				return layer.superlayer._temporaryContext;
			}
		}
	}
	
	if (layer instanceof Canworks.Surface) {
		return layer.canvasContext;

	} else {

		var layerContextFinder = function(sublayer) {
			if (sublayer.superlayer instanceof Canworks.Surface) {
				/*var canvas = sublayer.superlayer.canvasElement;
				var context = Canworks.getContextOfCanvas(canvas);
				return context;
				*/
				return null;
			} else {
				return layerContextFinder(sublayer.superlayer);
			}
		}

		return layerContextFinder(layer);
	}
}

Canworks.getCurrentGraphicsContext = function(layer) {
	if(layer._temporaryCanvas!=null) {
		return layer._temporaryContext;
	}
	return Canworks.createDisposableGraphicsContext(layer);
}

Canworks.setLayerTreeDirtyForLayer = function(layer) {
	if (layer instanceof Canworks.Surface) {
		// do nothing, the surface should already be marked dirty
	} else {
		if(layer.superlayer!=null) {
			layer.superlayer.setDirty(true);
		}
	}
}

Canworks.setLayerTreeLayoutDirtyForLayer = function(layer) {
	if (layer instanceof Canworks.Surface) {
		// do nothing, the surface should already be marked dirty
	} else {
		if(layer.superlayer!=null) {
			if (layer.superlayer instanceof Canworks.Layer) {
				layer.superlayer.setLayoutDirty(true);
			}
			if (layer.superlayer instanceof Canworks.Surface) {
				layer.superlayer.setDirty(true);
			}
		}
	}
}

Canworks.getContextOfCanvas = function(canvas) {
	return canvas.getContext('2d');
}

Canworks.createTemporaryCanvas = function(rect) {
	var temporaryCanvas = document.createElement('canvas');
	temporaryCanvas.setAttribute('width', rect.size.width);
	temporaryCanvas.setAttribute('height', rect.size.height);
	return temporaryCanvas;
}

Canworks.createDisposableGraphicsContext = function(layer) {
	if(layer._temporaryCanvas==null) {
		var temporaryCanvas = document.createElement('canvas');
		temporaryCanvas.setAttribute('width', layer.frame.size.width);
		temporaryCanvas.setAttribute('height', layer.frame.size.height);
		layer._temporaryCanvas = temporaryCanvas;
	}
	
	if(layer._temporaryContext==null) {
		var temporaryContext = Canworks.getContextOfCanvas(layer._temporaryCanvas);
		layer._temporaryContext = temporaryContext;
	}
	
	return layer._temporaryContext;
}

Canworks.clearDisposableGraphicsContext = function(layer) {
	if(layer._temporaryCanvas!=null) {
		layer._temporaryContext = null;
		layer._temporaryCanvas = null;
	}
}

Canworks.checkPointForTransparencyInLayerHitMatrix = function(point, layer) {
	if(layer._hitPixelCache!=null) {
		if (layer._hitPixelCache[point.x]!=undefined) {
			if(layer._hitPixelCache[point.x][point.y]!=undefined) {
				var transparentFlag = layer._hitPixelCache[point.x][point.y];
				if (transparentFlag==0) {
					return true;
				}
			}
		}
	}
	return false;
}

Canworks.storeHitPixelBufferOfLayer = function(layer) {
	if(layer.opaque==false &&
	   layer.transparencyClicktroughDetectionEnabled==true &&
	   layer._hitPixelCache==null) {
		var hitData = [];
		
		var data = layer._drawPixelCache.data;
		var length = data.length;
		var width = layer._drawPixelCache.width;
		var height = layer._drawPixelCache.height;
		
		for (var i=0;i<length;i+=4) {
      		var x = Math.floor((i / 4) / width);
      		var y = (i / 4) - (x * width);
      		if(!hitData[x]) {
      			hitData[x] = [];
      		}
      		hitData[x][y] = data[i+3] == 0 ? 0 : 1;
		}
		
		layer._hitPixelCache = hitData;
	} else {
		layer._hitPixelCache = null;
	}
}

Canworks.clearHitPixelBufferOfLayer = function(layer) {
	layer._hitPixelCache = null;
}

Canworks.storeDrawPixelBufferOfLayer = function(layer) {
	var context = Canworks.getCurrentGraphicsContext(layer);
	layer._drawPixelCache = context.getImageData(0, 0, layer.frame.size.width, layer.frame.size.height);
	layer._drawPixelCacheBounds = new Canworks.Rect(0, 0, layer.frame.size.width, layer.frame.size.height);
}

Canworks.storeCompositionPixelBufferOfLayer = function(layer) {
	if (layer.sublayers.length==0) {
		layer._compositionPixelCache = layer._drawPixelCache;
		layer._compositionPixelCacheBounds = new Canworks.Rect(0, 0, layer.frame.size.width, layer.frame.size.height);
		return;
	}
	var context = Canworks.getCurrentGraphicsContext(layer);
	layer._compositionPixelCache = context.getImageData(0, 0, layer.frame.size.width, layer.frame.size.height);
	layer._compositionPixelCacheBounds = new Canworks.Rect(0, 0, layer.frame.size.width, layer.frame.size.height);
}