Canworks
========

Canworks is a layer based JavaScript drawing and UI framework on top of the HTML5 canvas.

The aim of Canworks is to provide a foundation for developing applications, widgets and games on top of the HTML5 canvas.

Currently Canworks should offer one of the fastest Canvas 2D rendering engines out there by using a lot of different performance improvement solutions.

The engine is able to render 400 simultaneous animated (redrawn) and alpha blended layers on a 1920×1080 pixel stage at 20 fps (2.66 Ghz Core 2 Duo with NVIDIA GeForce 9600M GT).

A smaller amount of simultaneous animated layers (aprox. 50) is able to be rendered at 90 fps. Canworks can render 2500 opaque layers at 20 fps.

The performance will be of course further improved over time and should explode with more and more browsers implementing a hardware accelerated canvas.


What could I build with Canworks?
---------------------------------

Some examples:

Graph/charts rendering library with animations (for displaying stock value developments for example)

Games, Games, Games! … Games! (Not something like Crysis but 2.5D isometric social games or jump ‘n’ run games for example)

UI components which require a lot of custom drawing and animations which are not achievable with plain HTML and CSS

Current state of development

Canworks is currently in an early alpha stage of development.

Current rendering features:

Layer tree / scene graph

Layouting/positioning of sublayers (auto-resizing of sublayers)

Compositing (alpha blending) of layers and sublayers

Cached layer drawing

Cached layer composition

Dirty rectangle calculation

Optimized dirty rectangle consolidation

Layers with background-colors/-images and -gradients, shadows, borders and rounded corners

Low level geometry calculation functions (rectangles, points)


Interaction framwork features:

Basic layer interaction (mouse down, mouse up, mose move, drag, drop, over, out)

Layer hit detection

Responder chain management

Cached transparent layer hit zone calculcation for click-through detection

Canworks also has an animation framework implemented.