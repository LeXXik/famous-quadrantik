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


define(function(require, exports, module) {
    var View                = require('famous/core/View');
    var Surface             = require('famous/core/Surface');
    var StateModifier       = require('famous/modifiers/StateModifier');
    var Transform           = require('famous/core/Transform');
    var Draggable           = require('famous/modifiers/Draggable');
    var GridLayout          = require('famous/views/GridLayout');
    
    function QuadrantikView(options) {
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
    QuadrantikView.prototype.setQuadrant = function(quadrant) {
        if (this.panels.length===0 || !this.knob) return;
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
    QuadrantikView.prototype.sequenceFrom = function(sequence) {
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
    QuadrantikView.prototype.setKnob = function(renderable) {
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

    function _syncPosition(event) {
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