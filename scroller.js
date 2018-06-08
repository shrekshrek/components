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

    var Controller = function (options) {
        var empty = function () {
        };
        this.onInit = options.onInit || empty;
        this.onUpdate = options.onUpdate || empty;
        this.init.call(this, options.range || 0, options.length || 0);
    };

    Object.assign(Controller.prototype, {
        init: function (range, length) {
            this.delta = 0;
            this.value = 0;
            this.range = range;
            this.length = Math.max(length, range);
            this.max = Math.max(this.range - this.length, 0);
            this.min = Math.min(this.range - this.length, 0);
            this.onInit();
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
            var _self = this;

            if (this.value > this.max || this.value < this.min) {
                this.value += delta * 0.4;
            } else {
                this.value += delta;
            }
            this.onUpdate();
            this.delta = delta;

            this.cancelMove();
            this.moveTimeout = setTimeout(function () {
                _self.delta = 0;
            }, 100);
        },

        end: function () {
            this.cancelMove();
            this.easeTo();
        },

        seek: function (num) {
            this.value = num;
            this.onUpdate();
        },

        easeTo: function () {
            var _self = this;

            this.calcDelta();
            this.value += this.delta;
            this.onUpdate();

            if (this.value > this.max || this.value < this.min || Math.abs(this.delta) > 0.1) {
                this.easeTimeout = requestAnimationFrame(function () {
                    _self.easeTo();
                });
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
        this.drag = config.drag || this.el.querySelector('.contain');
        this.bar = config.bar;
        this.barDrag = this.bar ? this.bar.children[0] : undefined;
        this.xflow = config.xflow || false;
        this.yflow = config.yflow || true;

        var _self = this;

        if (this.xflow) {
            this.xctrl = new Controller({
                range: parseFloat(JT.get(this.el, 'width')),
                length: parseFloat(JT.get(this.drag, 'width')),
                onInit: function () {

                },
                onUpdate: function () {
                    JT.set(_self.drag, {x: this.value});
                }
            });
        }

        if (this.yflow) {
            if (this.barDrag) {
                this.barH = parseFloat(JT.get(this.bar, 'height'));
                this.barDragH = 0;
            }

            this.yctrl = new Controller({
                range: parseFloat(JT.get(this.el, 'height')),
                length: parseFloat(JT.get(this.drag, 'height')),
                onInit: function () {
                    if (_self.barDrag) {
                        _self.barDragH = this.range / this.length * this.barH;
                        JT.set(_self.barDrag, {height: _self.barDragH});
                    }
                },
                onUpdate: function () {
                    JT.set(_self.drag, {y: this.value});
                    if (_self.barDrag) {
                        var _y = this.value / (this.length - this.range) * (_self.barDragH - _self.barH);
                        JT.set(_self.barDrag, {y: _y});
                    }
                }
            });
        }

    };

    Object.assign(Scroller.prototype, {
        size: function (rect) {
            JT.set(this.el, {width: rect.width});
            JT.set(this.el, {height: rect.height});

            if (this.xflow) this.xctrl.init(rect.width, this.xctrl.length);
            if (this.yflow) this.yctrl.init(rect.height, this.yctrl.length);
        },

        reset: function () {
            if (this.xflow) this.xctrl.seek(0);
            if (this.yflow) this.yctrl.seek(0);
        },

        onTouchStart: function () {
            if (this.xflow) this.xctrl.start();
            if (this.yflow) this.yctrl.start();
        },

        onTouchMove: function (evt) {
            if (this.xflow) this.xctrl.move(evt.deltaX);
            if (this.yflow) this.yctrl.move(evt.deltaY);
        },

        onTouchEnd: function () {
            if (this.xflow) this.xctrl.end();
            if (this.yflow) this.yctrl.end();
        },

    });

    return Scroller;

})));
