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
// Responder Class definition
// ----------------------------

Canworks.Responder = function () {
	Canworks.Object.call(this);
}

Canworks.Responder.prototype = new Canworks.Object;

Canworks.Responder.prototype.canBecomeFirstResponder = function () {
	return false;
}

Canworks.Responder.prototype.becomeFirstResponder = function () {
	return true;
}

Canworks.Responder.prototype.canResignFirstResponder = function () {
	return true;
}

Canworks.Responder.prototype.resignFirstResponder = function () {
	return true;
}

Canworks.Responder.prototype.isFirstResponder = function () {
	return false;
}

Canworks.Responder.prototype.nextResponder = function () {
	return null;
}

Canworks.Responder.prototype.interactionPointerDown = function(point, event) {
	// implement this in subclasses
}

Canworks.Responder.prototype.interactionPointerUp = function(point, event) {
	// implement this in subclasses
}

Canworks.Responder.prototype.interactionPointerMove = function(point, event) {
	// implement this in subclasses
}

Canworks.Responder.prototype.interactionPointerDrag = function(point, event) {
	// implement this in subclasses
}

Canworks.Responder.prototype.interactionPointerOver = function(point, event) {
	// implement this in subclasses
}

Canworks.Responder.prototype.interactionPointerOut = function(point, event) {
	// implement this in subclasses
}