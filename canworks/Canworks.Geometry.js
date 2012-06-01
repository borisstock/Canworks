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
// Point Class definition
// ----------------------------

Canworks.Point = function (x, y) {
	this.x = x;
	this.y = y;
}

Canworks.Point.prototype.constructor = Canworks.Point;
Canworks.Point.prototype.x = 0;
Canworks.Point.prototype.y = 0;

Canworks.Point.prototype.isEqualToPoint = function (point) {
	return Canworks.pointIsEqualToPoint(this, point);
}

Canworks.Point.prototype.toString = function () {
	return Canworks.stringFromPoint(this);
}

Canworks.Point.prototype.copy = function () {
	return Canworks.copyPoint(this);
}

Canworks.Point.prototype.isInsideRect = function (rect) {
	return Canworks.isPointInsideRect(this, rect);
}


// Standalone Point functions

Canworks.pointIsEqualToPoint = function (point1, point2) {
	if(point1.x==point2.x &&
	   point1.y==point2.y) {
		return true;
	}
	return false;
}

Canworks.stringFromPoint = function (point) {
	return point.x + "," + point.y;
}

Canworks.pointFromString = function (string) {
	var components = (string).split(",");
	return new Canworks.Point(components[0], components[1]);
}

Canworks.isPointInsideRect = function (point, rect) {
	if (point.x > rect.origin.x &&
	    point.y > rect.origin.y &&
	    point.x <= rect.origin.x+rect.size.width &&
	    point.y <= rect.origin.y+rect.size.height) {
		return true;
	}
	return false;
}

Canworks.zeroPoint = function () {
	return new Canworks.Point(0,0);
}

Canworks.copyPoint = function (point) {
	return new Canworks.Point(point.x, point.y);
}



// ----------------------------
// Size Class definition
// ----------------------------

Canworks.Size = function (width, height) {
	this.width = width;
	this.height = height;
}

Canworks.Size.prototype.constructor = Canworks.Size;
Canworks.Size.prototype.width = 0;
Canworks.Size.prototype.height = 0;

Canworks.Size.prototype.isEqualToSize = function (size) {
	return Canworks.sizeIsEqualToSize(this, size);
}

Canworks.Size.prototype.toString = function () {
	return Canworks.stringFromSize(this);
}

Canworks.Size.prototype.copy = function () {
	return Canworks.copySize(this);
}


// Standalone Size functions

Canworks.sizeIsEqualToSize = function (size1, size2) {
	if (size1.width==size2.width &&
	    size1.height==size2.height) {
		return true;
	}
	return false;
}

Canworks.stringFromSize = function (size) {
	return size.width + "," + size.height;
}

Canworks.sizeFromString = function (string) {
	var components = (string).split(",");
	return new Canworks.Size(components[0], components[1]);
}

Canworks.zeroSize = function () {
	return new Canworks.Size(0,0);
}

Canworks.copySize = function (size) {
	return new Canworks.Size(size.width, size.height);
}



// ----------------------------
// Rect Class definition
// ----------------------------

Canworks.Rect = function (x, y, width, height) {
	this.origin = new Canworks.Point(x, y);
	this.size = new Canworks.Size(width, height);
}

Canworks.Rect.prototype.constructor = Canworks.Rect;
Canworks.Rect.prototype.origin = null;
Canworks.Rect.prototype.size = null;

Canworks.Rect.prototype.isEqualToRect = function (rect) {
	return Canworks.rectIsEqualToRect(this, rect);
}

Canworks.Rect.prototype.toString = function () {
	return Canworks.stringFromRect(this);
}

Canworks.Rect.prototype.copy = function () {
	return Canworks.copyRect(this);
}

Canworks.Rect.prototype.getHeight = function () {
	return Canworks.rectGetHeight(this);
}

Canworks.Rect.prototype.getWidth = function () {
	return Canworks.rectGetWidth(this);
}

Canworks.Rect.prototype.getMaxX = function () {
	return Canworks.rectGetMaxX(this);
}

Canworks.Rect.prototype.getMaxY = function () {
	return Canworks.rectGetMaxY(this);
}

Canworks.Rect.prototype.getMidX = function () {
	return Canworks.rectGetMidX(this);
}

Canworks.Rect.prototype.getMidY = function () {
	return Canworks.rectGetMidY(this);
}

Canworks.Rect.prototype.getMinX = function () {
	return Canworks.rectGetMinX(this);
}

Canworks.Rect.prototype.getMinY = function () {
	return Canworks.rectGetMinY(this);
}

Canworks.Rect.prototype.insetRect = function (x, y) {
	return Canworks.rectInset(this, x, y);
}

Canworks.Rect.prototype.offsetRect = function (x, y) {
	return Canworks.rectOffset(this, x, y);
}

Canworks.Rect.prototype.integralRect = function () {
	return Canworks.rectIntegral(this);
}

Canworks.Rect.prototype.isNullRect = function () {
	return Canworks.rectIsNull(this);
}

Canworks.Rect.prototype.isEmptyRect = function () {
	return Canworks.rectIsEmpty(this);
}

Canworks.Rect.prototype.intersectionWithRect = function (rect) {
	return Canworks.rectIntersection(this, rect);
}

Canworks.Rect.prototype.intersectsRect = function (rect) {
	return Canworks.rectIntersectsRect(this, rect);
}

Canworks.Rect.prototype.unionWithRect = function (rect) {
	return Canworks.rectUnion(this, rect);
}

Canworks.Rect.prototype.standardize = function () {
	return Canworks.rectStandardize(this);
}

Canworks.Rect.prototype.isInsideRect = function (rect) {
	return Canworks.isRectInsideRect(this, rect);
}


// Standalone Rect functions

Canworks.zeroRect = function () {
	return new Canworks.Rect(0, 0, 0, 0);
}

Canworks.copyRect = function (rect) {
	return new Canworks.Rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
}

Canworks.rectIsEqualToRect = function (rect1, rect2) {
	if (Canworks.sizeIsEqualToSize(rect1.size, rect2.size) &&
	    Canworks.pointIsEqualToPoint(rect1.origin, rect2.origin)) {
	    return true;
	}
	return false;
}

Canworks.rectGetHeight = function (rect) {
	return rect.size.height;
}

Canworks.rectGetWidth = function (rect) {
	return rect.size.width;
}

Canworks.rectGetMaxX = function (rect) {
	return rect.origin.x+rect.size.width;
}

Canworks.rectGetMaxY = function (rect) {
	return rect.origin.y+rect.size.height;
}

Canworks.rectGetMidX = function (rect) {
	return rect.origin.x+(rext.size.width/2);
}

Canworks.rectGetMidY = function (rect) {
	return rect.origin.y+(rext.size.height/2);
}

Canworks.rectGetMinX = function (rect) {
	return rect.origin.x;
}

Canworks.rectGetMinY = function (rect) {
	return rect.origin.y;
}

Canworks.rectInset = function (rect, x, y) {
	return new Canworks.Rect(rect.origin.x + x, rect.origin.y + y, rect.size.width-(2*x), rect.size.height-(2*y));
}

Canworks.rectOffset = function (rect, x, y) {
	return new Canworks.Rect(rect.origin.x + x, rect.origin.y + y, rect.size.width, rect.size.height);
}

Canworks.rectIntegral = function (rect) {
	return new Canworks.Rect(Math.floor(rect.origin.x), Math.floor(rect.origin.y), Math.ceil(rect.size.width), Math.ceil(rect.size.height));
}

Canworks.rectIsNull = function (rect) {
	return (rect.size.width<=0 || rect.size.height<=0);
}

Canworks.rectIsEmpty = function (rect) {
	return (rect.size.width<=0 || rect.size.height<=0);
}

Canworks.stringFromRect = function (rect) {
	return rect.origin.x +","+ rect.origin.y +","+ rect.size.width +","+ rect.size.height;
}

Canworks.rectFromString = function (string) {
	var components = (string).split(",");
	return new Canworks.Rect(components[0], components[1], components[2], components[3]);
}

Canworks.rectIntersection = function (rect1, rect2) {
	var intersection = new Canworks.Rect(Math.max(Canworks.rectGetMinX(rect1), Canworks.rectGetMinX(rect2)), Math.max(Canworks.rectGetMinY(rect1), Canworks.rectGetMinY(rect2)), 0, 0);
	
	intersection.size.width = Math.min(Canworks.rectGetMaxX(rect1), Canworks.rectGetMaxX(rect2)) - Canworks.rectGetMinX(intersection);
    intersection.size.height = Math.min(Canworks.rectGetMaxY(rect1), Canworks.rectGetMaxY(rect2)) - Canworks.rectGetMinY(intersection);
    
	return Canworks.rectIsEmpty(intersection) ? Canworks.zeroRect() : intersection;
}

Canworks.rectIntersectsRect = function (rect1, rect2) {
	return !Canworks.rectIsEmpty(Canworks.rectIntersection(rect1, rect2));
}

Canworks.rectUnion = function (rect1, rect2) {
	var minX = Math.min(Canworks.rectGetMinX(rect1), Canworks.rectGetMinX(rect2));
    var minY = Math.min(Canworks.rectGetMinY(rect1), Canworks.rectGetMinY(rect2));
    var maxX = Math.max(Canworks.rectGetMaxX(rect1), Canworks.rectGetMaxX(rect2));
    var maxY = Math.max(Canworks.rectGetMaxY(rect1), Canworks.rectGetMaxY(rect2));
     
    return new Canworks.Rect(minX, minY, maxX - minX, maxY - minY);
}

Canworks.rectStandardize = function (rect) {
	var width = Canworks.rectGetWidth(rect);
    var height = Canworks.rectGetHeight(rect);
    var standardized = Canworks.copyRect(rect);
 
    if (width < 0.0) {
        standardized.origin.x += width;
        standardized.size.width = -width;
    }
     
    if (height < 0.0) {
        standardized.origin.y += height;
        standardized.size.height = -height;
    }
     
    return standardized;
}

Canworks.isRectInsideRect = function (rect, insideRect) {
	
	return Canworks.rectIsEqualToRect(Canworks.rectUnion(rect, insideRect), insideRect);
}


// ----------------------------
// Context helper functions
// ----------------------------

Canworks.contextAddRect = function (context, rect) {
	try
	{
		/* Begin! */
		context.beginPath()
			
		/* Rectangle */
		context.rect(rect.origin.x, rect.origin.x, rect.size.width, rect.size.height);
		
		/* Done */
		context.closePath();
	}
	catch(exception)
	{
		Canworks.exception(exception);
	}	
}

Canworks.contextAddRoundedRect = function (context, rect, corner_radius) {
	try
	{
		var x_left = rect.origin.x;
		var x_left_center = rect.origin.x + corner_radius;
		var x_right_center = rect.origin.x + rect.size.width - corner_radius;
		var x_right = rect.origin.x + rect.size.width;
		var y_top = rect.origin.y;
		var y_top_center = rect.origin.y + corner_radius;
		var y_bottom_center = rect.origin.y + rect.size.height - corner_radius;
		var y_bottom = rect.origin.y + rect.size.height;
		
		/* Begin! */
		context.beginPath()
		context.moveTo(x_left, y_top_center);
		
		/* First corner */
		context.arcTo(x_left, y_top, x_left_center, y_top, corner_radius);
		context.lineTo(x_right_center, y_top);
		
		/* Second corner */
		context.arcTo(x_right, y_top, x_right, y_top_center, corner_radius);
		context.lineTo(x_right, y_bottom_center);
		
		/* Third corner */
		context.arcTo(x_right, y_bottom, x_right_center, y_bottom, corner_radius);
		context.lineTo(x_left_center, y_bottom);
		
		/* Fourth corner */
		context.arcTo(x_left, y_bottom, x_left, y_bottom_center, corner_radius);
		context.lineTo(x_left, y_top_center);
		
		/* Done */
		context.closePath();
	}
	catch(exception)
	{
  		Canworks.exception(exception);
	}
}