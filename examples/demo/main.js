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
 * Quadrantik View example
 */

define(function(require, exports, module) {
    var Engine          = require('famous/core/Engine');
    var Surface         = require('famous/core/Surface');
    var Timer           = require('famous/utilities/Timer');
    var QuadrantikView  = require('QuadrantikView');

    var mainContext = Engine.createContext();

    var colors = ['#A53E1F', '#A5811F', '#1F86A5', '#A51F43'];
    var panels = [];

    for (var i = 0; i < 4; i++) {
        var panel = new Surface({
            size: [window.innerWidth, window.innerHeight],
            content: 'Quadrantik panel ' + (i+1),
            properties: {
                background: colors[i],
                lineHeight: window.innerHeight + 'px',
                color: '#303030',
                fontSize: 60 + 'px',
                textAlign: 'center',
                textShadow: '-1px -1px 0px #101010, 1px 1px 0px #505050'
            }
        });
        panels.push(panel);
    };

    var knob = new Surface({
        size: [75, 75],
        content: '<a><img src="http://code.famo.us/assets/famous_logo.svg"></img></a>',
        classes: ['knob']
    });

    var qView = new QuadrantikView();
    qView.sequenceFrom(panels);
    qView.setKnob(knob);

    // uncomment to switch to a random quadrant every 1.5 sec
    // 
    // Timer.setInterval(function() {
    //     var q = Math.floor((Math.random() * 4) + 1);
    //     qView.setQuadrant(q);
    // }, 1500);

    mainContext.add(qView);
});
