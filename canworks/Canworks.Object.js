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
// Object Class definition
// ----------------------------

Canworks.Object = function () {
	this.UID = Canworks.UID();
}

Canworks.Object.prototype.constructor = Canworks.Object;
Canworks.Object.prototype.UID = null;