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
// Image Class definition
// ----------------------------

Canworks.Image = function (highSrc, lowSrc) {
	Canworks.Object.call(this);
	
	this._image = new Image();
	this._image.Canworks = this._image.Canworks || {};
	this._image.Canworks.image = this;
	this._image.onabort = this.imageLoadingAborted;
	this._image.onload = this.imageLoaded;
	this._image.onerror = this.imageLoadingFailed;
	
	if (typeof highSrc == 'string') {
		this.highSrc = highSrc;
	}
	
	if (typeof lowSrc == 'string') {
		this.lowSrc = lowSrc;
	}
}

Canworks.Image.prototype = new Canworks.Object;
Canworks.Image.prototype.constructor = Canworks.Image;
Canworks.Image.prototype._image = null;
Canworks.Image.prototype.width = 0;
Canworks.Image.prototype.height = 0;
Canworks.Image.prototype.complete = false;
Canworks.Image.prototype.lowSrc = null;
Canworks.Image.prototype.highSrc = null;

Canworks.Image.prototype.imageLoaded = function () {
	var self = this.Canworks.image;
	self.width = this.width;
	self.height = this.height;
	self.complete = this.complete;
}

Canworks.Image.prototype.imageLoadingAborted = function () {
	var self = this.Canworks.image;
}

Canworks.Image.prototype.imageLoadingFailed = function () {
	var self = this.Canworks.image;
}

Canworks.Image.prototype.getWidth = function () {
	return this.width;
}

Canworks.Image.prototype.getHeight = function () {
	return this.height;
}

Canworks.Image.prototype.isLoaded = function () {
	return this.complete;
}

Canworks.Image.prototype.load = function () {
	if (typeof this.highSrc == 'string') {
		this._image.src = this.highSrc;
	} else {
		this._image.src = "";
	}
	
	if (typeof this.lowSrc == 'string') {
		this._image.lowsrc = this.lowSrc;
	} else {
		this._image.lowsrc = "";
	}
}

Canworks.Image.prototype.setURL = function (highSrc, lowSrc) {
	
	this.width = 0;
	this.height = 0;
	this.complete = false;
	
	if (typeof highSrc == 'string') {
		this.highSrc = highSrc;
	} else {
		this.highSrc = null;
	}
	
	if (typeof lowSrc == 'string') {
		this.lowSrc = lowSrc;
	} else {
		this.lowSrc = null;
	}
}