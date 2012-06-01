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
// Include framework files
// ----------------------------

Canworks.includes = new Array();

Canworks.includes.push("General");
Canworks.includes.push("Object");
Canworks.includes.push("Color");
Canworks.includes.push("Image");
Canworks.includes.push("Responder");
Canworks.includes.push("Geometry");
Canworks.includes.push("Renderer");
Canworks.includes.push("Layer");
Canworks.includes.push("Surface");
Canworks.includes.push("Animation");

var len = Canworks.includes.length;

for(var i=0; i<len; i++) {
	var frameworkFile = Canworks.includes[i];
	document.write("<script type=\"text/javascript\" src=\"canworks/Canworks." + frameworkFile + ".js\"></script>\n");
}

/*


	TODOS!!!
	
	
	** canworks.General **
	
		* priority 1
	
		- Performance tests and optimizations
		
		- Results:
		  - from 20 fps for 100 redrawn and animated layers to 45 fps (2.25x speedup)
	      - from 0.5 fps for 2500 redrawn opaque layers to 20 fps (40x speedup)
	      
	    *** priority 3
	      
	    - try catch error / exception handling
	
	
	** canworks.General ***
	
		* priority 1
		
		- animatable background colors
		
		- layer transform support (animations)
		
		- sublayer layouting / autoresizing / auto positioning
		
		** priority 2
		
		- key value observing
		
		- notification center
		
		*** priority 3
		
		- layer masks
		
		- layer content filter support
	
	
	** canworks.UI ***
	
		* priority 1
		
		- ImageLayer, AnimatedImageLayer
		
		** priority 2
		
		- VideoLayer
		
		*** priority 3
	
		- ButtonLayer, LabelLayer
	
	
	** canworks.Game **
	
		- Game engine implementation (2.5D isometric "social" games)
		  - Path finding
		  - Collision detection
		  - Editor / Sandbox
		  - Server
		  - Sounds
*/