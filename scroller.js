/*!
 * GIT: https://github.com/shrekshrek/components
 **/

(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        var JT = require('jstween');
        module.exports = factory(JT);
    } else if (typeof define === 'function' && define.amd) {
        define(['jstween'], factory);
    } else {
        global.Scroller = factory(global.JT);
    }
}(this, (function (JT) {
    'use strict';

    var Slider = function (options) {
        this.onInit = options.onInit || null;
        this.onUpdate = options.onUpdate || null;
        this.init(options.range || 0, options.length || 0);
    };

    Object.assign(Slider.prototype, {
        init: function (range, length) {
            this.delta = 0;
            this.value = 0;
            this.range = range;
            this.length = length;
            this.max = Math.max(this.range - this.length, 0);
            this.min = Math.min(this.range - this.length, 0);
            if (this.onInit) this.onInit();
        },

        cancelEase: function () {
            if (this.easeTimeout) {
                cancelAnimationFrame(this.easeTimeout);
                this.easeTimeout = null;
            }
        },

        cancelMove: function () {
            if (this.moveTimeout) {
                clearTimeout(this.moveTimeout);
                this.moveTimeout = null;
            }
        },

        start: function () {
            this.cancelEase();
            this.delta = 0;
        },

        move: function (delta) {
            if (this.value > this.max || this.value < this.min) {
                this.value += delta * 0.4;
            } else {
                this.value += delta;
            }
            if (this.onUpdate) this.onUpdate();
            this.delta = delta;

            this.cancelMove();
            this.moveTimeout = setTimeout(function () {
                this.delta = 0;
            }.bind(this), 50);
        },

        end: function () {
            this.cancelMove();
            this.easeTo();
        },

        seek: function (num) {
            this.value = num;
            if (this.onUpdate) this.onUpdate();
        },

        easeTo: function () {
            this.calcDelta();
            this.value += this.delta;
            if (this.onUpdate) this.onUpdate();

            if (this.value > this.max || this.value < this.min || Math.abs(this.delta) > 0.1) {
                this.easeTimeout = requestAnimationFrame(function () {
                    this.easeTo();
                }.bind(this));
            }
        },

        calcDelta: function () {
            if (this.value < this.max && this.value > this.min) {
                this.delta *= 0.95;
            } else if (this.value > this.max) {
                var _d = (this.max - this.value) * 0.2;
                this.delta = this.delta > 0 ? this.delta + _d : _d;
            } else {
                var _d = (this.min - this.value) * 0.2;
                this.delta = this.delta < 0 ? this.delta + _d : _d;
            }
        }
    });

    var Scroller = function (config) {
        this.el = config.el;
        this.target = config.target || this.el.children[0];
        this.yflow = config.yflow !== undefined ? config.yflow : true;
        this.yBar = config.ybar;
        this.yBarTarget = this.yBar ? this.yBar.children[0] : undefined;
        this.xflow = config.xflow !== undefined ? config.xflow : false;
        this.xBar = config.xbar;
        this.xBarTarget = this.xBar ? this.xBar.children[0] : undefined;

        var _self = this;

        if (this.xflow) {
            if (this.xBarTarget) {
                this.barW = parseFloat(JT.get(this.xBar, 'width'));
                this.barTargetW = 0;
            }

            this.xctrl = new Slider({
                range: parseFloat(JT.get(this.el, 'width')),
                length: parseFloat(JT.get(this.target, 'width')),
                onInit: function () {
                    if (_self.xBarTarget) {
                        _self.barTargetW = this.range / this.length * this.barW;
                        JT.set(_self.xBarTarget, {width: _self.barTargetW});
                    }
                },
                onUpdate: function () {
                    JT.set(_self.target, {x: this.value});
                    if (_self.xBarTarget) {
                        var _x = this.value / (this.length - this.range) * (_self.barTargetW - _self.barW);
                        JT.set(_self.xBarTarget, {x: _x});
                    }
                }
            });
        }

        if (this.yflow) {
            if (this.yBarTarget) {
                this.barH = parseFloat(JT.get(this.yBar, 'height'));
                this.barTargetH = 0;
            }

            this.yctrl = new Slider({
                range: parseFloat(JT.get(this.el, 'height')),
                length: parseFloat(JT.get(this.target, 'height')),
                onInit: function () {
                    if (_self.yBarTarget) {
                        _self.barTargetH = this.range / this.length * this.barH;
                        JT.set(_self.yBarTarget, {height: _self.barTargetH});
                    }
                },
                onUpdate: function () {
                    JT.set(_self.target, {y: this.value});
                    if (_self.yBarTarget) {
                        var _y = this.value / (this.length - this.range) * (_self.barTargetH - _self.barH);
                        JT.set(_self.yBarTarget, {y: _y});
                    }
                }
            });
        }

    };

    Object.assign(Scroller.prototype, {
        resize: function (width, height) {
            JT.set(this.el, {width: width});
            JT.set(this.el, {height: height});

            if (this.xflow) this.xctrl.init(width, parseFloat(JT.get(this.target, 'width')));
            if (this.yflow) this.yctrl.init(height, parseFloat(JT.get(this.target, 'height')));
        },

        reset: function () {
            if (this.xflow) this.xctrl.seek(0);
            if (this.yflow) this.yctrl.seek(0);
        },

        touchStart: function () {
            if (this.xflow) this.xctrl.start();
            if (this.yflow) this.yctrl.start();
        },

        touchMove: function (evt) {
            if (this.xflow) this.xctrl.move(evt.deltaX);
            if (this.yflow) this.yctrl.move(evt.deltaY);
        },

        touchEnd: function () {
            if (this.xflow) this.xctrl.end();
            if (this.yflow) this.yctrl.end();
        }
    });

    return Scroller;

})));
