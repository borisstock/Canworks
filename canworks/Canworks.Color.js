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
// Color library definition
// ----------------------------

Canworks.Color = Canworks.Color || {};

Canworks.Color.isColorString = function (str) {
	if (typeof str != 'string') {
		return false;
	}
	if (str.indexOf("rgb")!=-1) {
		return true;
	}
	return false;
}

Canworks.Color.isRGBColorString = function (str) {
	if (Canworks.Color.isColorString(str)==true) {
		if (str.indexOf("rgb(")!=-1) {
			return true;
		}
	}
	return false;
}

Canworks.Color.isRGBAColorString = function (str) {
	if (Canworks.Color.isColorString(str)==true) {
		if (str.indexOf("rgba(")!=-1) {
			return true;
		}
	}
	return false;
}

Canworks.Color.convertColorStringToRGBAColor = function (str) {
	var r = 0;
	var g = 0;
	var b = 0;
	var a = 1.0;
	if(Canworks.Color.isRGBColorString(str)) {
		str = str.substring(4);
		var parts = str.split(",");
		parts[2] = parts[2].replace(")","");
		parts[2] = parts[2].replace(";","");
		
		r = parseInt(parts[0]);
		g = parseInt(parts[1]);
		b = parseInt(parts[2]);
	}
	if(Canworks.Color.isRGBAColorString(str)) {
		str = str.substring(5);
		var parts = str.split(",");
		parts[3] = parts[3].replace(")","");
		parts[3] = parts[3].replace(";","");
		
		r = parseInt(parts[0]);
		g = parseInt(parts[1]);
		b = parseInt(parts[2]);
		a = parseFloat(parts[3]);
	}
	return new Canworks.Color.RGBAColor(r, g, b, a);
}

Canworks.Color.convertRGBAColorToRGBAColorString = function (color) {
	var colorStr = "rgba("+color.r+", "+color.g+", "+color.b+", "+color.a+");";
	return colorStr;
}

Canworks.Color.copyRGBAColor = function (color) {
	return new Canworks.Color.RGBAColor(color.r, color.g, color.b, color.a);
}


// ----------------------------
// RGBAColor Class definition
// ----------------------------

Canworks.Color.RGBAColor = function (r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

Canworks.Color.RGBAColor.prototype.constructor = Canworks.Color.RGBAColor;
Canworks.Color.RGBAColor.prototype.r = 0;
Canworks.Color.RGBAColor.prototype.g = 0;
Canworks.Color.RGBAColor.prototype.b = 0;
Canworks.Color.RGBAColor.prototype.a = 1.0;

Canworks.Color.RGBAColor.prototype.copy = function () {
	return Canworks.Color.copyRGBAColor(this);
}