/*!
 * GIT: https://github.com/shrekshrek/components
 **/

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jstween', 'exports'], function (JT, exports) {
            window.Scroller = factory(exports, JT);
        });
    } else if (typeof exports !== 'undefined') {
        var JT = require('jstween');
        factory(exports, JT);
    } else {
        window.Scroller = factory({}, window.JT);
    }

}(function (Scroller, JT) {

    function calcNum(n0, dn, max, min) {
        if (n0 < max && n0 > min) {
            dn *= 0.95;
        } else if (n0 > max) {
            var _d = (max - n0) * 0.2;
            if (dn > 0) dn += _d;
            else dn = _d;
        } else {
            var _d = (min - n0) * 0.2;
            if (dn < 0) dn += _d;
            else dn = _d;
        }
        return dn;
    }

    Scroller = function (config) {
        this.el = config.el;
        this.drag = config.drag || this.el.querySelector('.contain');
        this.bar = config.bar;
        this.barDrag = this.bar ? this.bar.children[0] : undefined;
        this.isX = config.isX || false;
        this.isY = config.isY || true;

        this.init();
    };

    Object.assign(Scroller.prototype, {
        size: function (rect) {
            JT.set(this.el, {width: rect.width});
            JT.set(this.el, {height: rect.height});
            this.init();
        },

        reset: function () {
            if (this.isX) this.setX(0);
            if (this.isY) this.setY(0);
        },

        setX: function (per) {
            this.x1 = Math.floor((this.w0 - this.w1) * per / 100);
            JT.set(this.drag, {x: this.x1});
        },

        setY: function (per) {
            this.y1 = Math.floor((this.h0 - this.h1) * per / 100);
            JT.set(this.drag, {y: this.y1});
        },

        init: function () {
            if (this.isX) {
                this.dx = 0;
                this.x1 = JT.get(this.drag, 'x');
                this.w0 = parseFloat(JT.get(this.el, 'width'));
                this.w1 = parseFloat(JT.get(this.drag, 'width'));
                this.xMax = Math.max(this.w0 - this.w1, 0);
                this.xMin = Math.min(this.w0 - this.w1, 0);

                if (this.barDrag) {
                    this.w3 = parseFloat(JT.get(this.bar, 'width'));
                    this.w4 = this.w0 / this.w1 * this.w3;
                    JT.set(this.barDrag, {width: this.w4});
                }
            }

            if (this.isY) {
                this.dy = 0;
                this.y1 = JT.get(this.drag, 'y');
                this.h0 = parseFloat(JT.get(this.el, 'height'));
                this.h1 = parseFloat(JT.get(this.drag, 'height'));
                this.yMax = Math.max(this.h0 - this.h1, 0);
                this.yMin = Math.min(this.h0 - this.h1, 0);

                if (this.barDrag) {
                    this.h3 = parseFloat(JT.get(this.bar, 'height'));
                    this.h4 = this.h0 / this.h1 * this.h3;
                    JT.set(this.barDrag, {height: this.h4});
                }
            }
        },

        updateX: function (num) {
            JT.set(this.drag, {x: num});
            if (this.barDrag) {
                var _x = num / (this.w1 - this.w0) * (this.w4 - this.w3);
                JT.set(this.barDrag, {x: _x});
            }
        },

        updateY: function (num) {
            JT.set(this.drag, {y: num});
            if (this.barDrag) {
                var _y = num / (this.h1 - this.h0) * (this.h4 - this.h3);
                JT.set(this.barDrag, {y: _y});
            }
        },

        onTouchStart: function () {
            if (this.easeTimeout) {
                cancelAnimationFrame(this.easeTimeout);
                this.easeTimeout = null;
            }
            if (this.isX) this.dx = 0;
            if (this.isY) this.dy = 0;
        },

        moveTimeout: null,
        onTouchMove: function (evt) {
            var _self = this;

            if (this.isX) {
                if (this.x1 > this.xMax || this.x1 < this.xMin) {
                    this.x1 += evt.deltaX * 0.4;
                } else {
                    this.x1 += evt.deltaX;
                }
                // JT.set(this.drag, {x: this.x1});
                this.updateX(this.x1);
                this.dx = evt.deltaX;
            }

            if (this.isY) {
                if (this.y1 > this.yMax || this.y1 < this.yMin) {
                    this.y1 += evt.deltaY * 0.4;
                } else {
                    this.y1 += evt.deltaY;
                }
                // JT.set(this.drag, {y: this.y1});
                this.updateY(this.y1);
                this.dy = evt.deltaY;
            }

            if (this.moveTimeout) {
                clearTimeout(this.moveTimeout);
                this.moveTimeout = null;
            }
            this.moveTimeout = setTimeout(function () {
                _self.dx = _self.dy = 0;
            }, 100);
        },

        onTouchEnd: function () {
            if (this.moveTimeout) {
                clearTimeout(this.moveTimeout);
                this.moveTimeout = null;
            }
            this.easeTo();
        },

        easeTimeout: null,
        easeTo: function () {
            var _self = this;

            if (this.isX) {
                this.x1 += this.dx;
                this.updateX(this.x1);
                this.dx = calcNum(this.x1, this.dx, this.xMax, this.xMin);
            }

            if (this.isY) {
                this.y1 += this.dy;
                this.updateY(this.y1);
                this.dy = calcNum(this.y1, this.dy, this.yMax, this.yMin);
            }

            if (this.x1 > this.xMax + 0.1 || this.x1 < this.xMin - 0.1 || this.y1 > this.yMax + 0.1 || this.y1 < this.yMin - 0.1 || Math.abs(this.dx) > 0.1 || Math.abs(this.dy) > 0.1) {
                this.easeTimeout = requestAnimationFrame(function () {
                    _self.easeTo();
                }, 1000 / 60);
            }
        },

    });

    return Scroller;

}));
