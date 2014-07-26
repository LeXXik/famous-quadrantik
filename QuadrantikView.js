/**
 * MIT
 * Copyright (C) 2014 Ashan Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining 
 * a copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Quadrantik View class for Famo.us framework
 */

define(function (require, exports, module) {
    'use strict';

    var View                = require('famous/core/View'),
        StateModifier       = require('famous/modifiers/StateModifier'),
        Transform           = require('famous/core/Transform'),
        Draggable           = require('famous/modifiers/Draggable'),
        GridLayout          = require('famous/views/GridLayout');

    /**
     * Quadrantik View lays out 4 renderables in a grid layout and
     * allows you to move it by dragging the knob, which is placed in the middle of it.
     * 
     * @class QuadrantikView
     * @constructor
     * @param {Object} [options] Valid JSON object, representing configuration options
     * @param {Object} [options.transition] Transition options for snapping the knob to corners
     * @param {Number} [options.transition.duration=400] Duration of the transition in ms
     * @param {String} [options.transition.curve='easeOut'] Easing curve for the knob snapping
     * @param {Object} [options.snap] Defines length of steps in pixels the knob will move on X and Y axes
     * @param {Number} [options.snap.snapX=1] Knob step on X axis
     * @param {Number} [options.snap.snapY=1] Knob step on Y axis
     * @param {Number} [options.cornerSnapSize=window.innerHeight*0.2] The side length of a square, which will trigger the knob corner snapping
     */
    function QuadrantikView() {
        View.apply(this, arguments);

        this.panels = [];
        this.knob = undefined;
        this._transition = this.options.transition;

        this._WIDTH = window.innerWidth;
        this._HEIGHT = window.innerHeight;

        _bindEvents.call(this);
    }

    QuadrantikView.prototype = Object.create(View.prototype);
    QuadrantikView.prototype.constructor = QuadrantikView;

    /**
     * Shows the specified quadrant in full-screen.
     *
     * @method setQuadrant
     * 
     * @param {Number} quadrant Quadrant number. Follows quadrants positions of math quadrants in Cartesian plane:
     *                          row1: 2 1
     *                          row2: 3 4
     */
    QuadrantikView.prototype.setQuadrant = function (quadrant) {
        if (this.panels.length === 0 || !this.knob) return;
        var w = this._WIDTH / 2;
        var h = this._HEIGHT / 2;
        switch (quadrant) {
            case 1:
                this.draggable.setPosition([-w, h], this._transition);
                this.mod.setTransform(Transform.translate(-w, h, 0), this._transition);
                break;
            case 2:
                this.draggable.setPosition([w, h], this._transition);
                this.mod.setTransform(Transform.translate(w, h, 0), this._transition);
                break;
            case 3:
                this.draggable.setPosition([w, -h], this._transition);
                this.mod.setTransform(Transform.translate(w, -h, 0), this._transition);
                break;
            case 4:
                this.draggable.setPosition([-w, -h], this._transition);
                this.mod.setTransform(Transform.translate(-w, -h, 0), this._transition);
                break;
            default:
                break;
        };
    };

    /**
     * Feeds the provided array of renderables to the GridLayout and adds it to the context.
     *
     * @method sequenceFrom
     * 
     * @param  {Array|ViewSequence} sequence Accepts an array of renderables or a ViewSequence
     */
    QuadrantikView.prototype.sequenceFrom = function (sequence) {
        var grid = new GridLayout({
            dimensions: [2, 2],
            transition: { duration: 1000, curve: 'easeInOut' }
        });
        if (sequence instanceof Array) {
            grid.sequenceFrom(sequence);
            this.panels = sequence;
        };
        this.mod = new StateModifier({
            size: [this._WIDTH * 2, this._HEIGHT * 2],
            origin: [.5, .5]
        });
        this.add(this.mod).add(grid);
    };

    /**
     * Sets a renderable to represent a knob, which a user can drag to move the GridLayout
     *
     * @method setKnob
     * 
     * @param {Object} renderable A Famo.us renderable, e.g. a surface
     */
    QuadrantikView.prototype.setKnob = function (renderable) {
        if (renderable instanceof Object) this.knob = renderable;
        this.draggable = new Draggable({
            snapX: this.options.snap.snapX,
            snapY: this.options.snap.snapY,
            xRange: [-this._WIDTH/2, this._WIDTH/2],
            yRange: [-this._HEIGHT/2, this._HEIGHT/2]
        });

        this.draggable.subscribe(this.knob);
        this.draggable.pipe(this._eventInput);

        this.knobModifier = new StateModifier({
            align: [.5, .5],
            origin: [.5, .5],
            transform: Transform.inFront
        });

        var node = this.add(this.knobModifier);
        node.add(this.draggable).add(this.knob);
        _syncPosition.call(this);
    };

    QuadrantikView.DEFAULT_OPTIONS = {
        transition: {
            duration: 400,
            curve: 'easeOut'
        },
        snap: {
            snapX: 1,
            snapY: 1
        },
        cornerSnapSize: window.innerHeight * 0.2
    };

    function _bindEvents() {
        this._eventInput.bindThis(this);
        this._eventInput.on('update', _syncPosition);
        this._eventInput.on('end', _handleEnd);
    };

    function _syncPosition() {
        var pos = this.draggable.getPosition();
        this.mod.setTransform(Transform.translate(pos[0], pos[1], 0));
    };

    function _handleEnd() {
        var pos = this.draggable.getPosition();
        var w = this._WIDTH / 2;
        var h = this._HEIGHT / 2;
        var corner = this.options.cornerSnapSize;

        if (w + pos[0] < corner && h + pos[1] < corner) {
            this.draggable.setPosition([-w, -h], this._transition);
            this.mod.setTransform(Transform.translate(-w, -h, 0), this._transition);
        } else if (w - pos[0] < corner && h + pos[1] < corner) {
            this.draggable.setPosition([w, -h], this._transition);
            this.mod.setTransform(Transform.translate(w, -h, 0), this._transition);
        } else if (w + pos[0] < corner && h - pos[1] < corner) { 
            this.draggable.setPosition([-w, h], this._transition);
            this.mod.setTransform(Transform.translate(-w, h, 0), this._transition);
        } else if (pos[0] > (w - corner) && pos[1] > (h - corner)) { 
            this.draggable.setPosition([w, h], this._transition);
            this.mod.setTransform(Transform.translate(w, h, 0), this._transition);
        };
    };

    module.exports = QuadrantikView;
});