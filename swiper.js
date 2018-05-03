/*!
 * GIT: https://github.com/shrekshrek/components
 **/

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jstween', 'exports'], function (JT, exports) {
            window.Swiper = factory(exports, JT);
        });
    } else if (typeof exports !== 'undefined') {
        var JT = require('jstween');
        factory(exports, JT);
    } else {
        window.Swiper = factory({}, window.JT);
    }

}(function (Swiper, JT) {

    Swiper = function () {
        this.initialize.apply(this, arguments);
    };

    Swiper.prototype = {
        initialize: function (config) {
            this.el = config.el;
            this.drag = config.drag || this.el.querySelector('.contain');
            this.isX = config.isX == undefined ? true : config.isX;
            // this.isY = config.isY == undefined ? false : config.isY;

            this.update();

            this.pageId = 0;
            this.pageMax = config.pageMax || (this.isX ? Math.round(this.w1 / this.w0) : Math.round(this.h1 / this.h0));
        },

        size: function (rect) {
            JT.set(this.el, {width: rect.width});
            JT.set(this.el, {height: rect.height});
            this.update();
        },

        reset: function () {
            if (this.isX) {
                this.x1 = 0;
                JT.set(this.drag, {x: this.x1});
            } else {
                this.y1 = 0;
                JT.set(this.drag, {y: this.y1});
            }
        },

        update: function () {
            if (this.isX) {
                this.dx = 0;
                this.x1 = JT.get(this.drag, 'x');
                this.w0 = parseFloat(JT.get(this.el, 'width'));
                this.w1 = parseFloat(JT.get(this.drag, 'width'));
                this.xMax = Math.max(this.w0 - this.w1, 0);
                this.xMin = Math.min(this.w0 - this.w1, 0);
            } else {
                this.dy = 0;
                this.y1 = JT.get(this.drag, 'y');
                this.h0 = parseFloat(JT.get(this.el, 'height'));
                this.h1 = parseFloat(JT.get(this.drag, 'height'));
                this.yMax = Math.max(this.h0 - this.h1, 0);
                this.yMin = Math.min(this.h0 - this.h1, 0);
            }
        },

        onTouchStart: function () {
            JT.kill(this.drag);
            if (this.isX) this.dx = 0;
            else this.dy = 0;
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
                JT.set(this.drag, {x: this.x1});
                this.dx = evt.deltaX;
            } else {
                if (this.y1 > this.yMax || this.y1 < this.yMin) {
                    this.y1 += evt.deltaY * 0.4;
                } else {
                    this.y1 += evt.deltaY;
                }
                JT.set(this.drag, {y: this.y1});
                this.dy = evt.deltaY;
            }

            if (this.moveTimeout) {
                clearTimeout(this.moveTimeout);
                this.moveTimeout = null;
            }
            this.moveTimeout = setTimeout(function () {
                _self.dx = _self.dy = 0;
            }, 50);
        },

        onTouchEnd: function () {
            var _dn = this.isX ? this.dx : this.dy;
            if (_dn == 0) {
                var _id = Math.round(-(this.isX ? this.x1 : this.y1) / (this.isX ? this.w0 : this.h0));
                _id = Math.max(0, Math.min(this.pageMax - 1, _id));
                this.pageTo(_id);
            } else if (_dn > 0) {
                this.pagePrev();
            } else {
                this.pageNext();
            }
        },

        pageId: null,
        pageTo: function (id) {
            JT.kill(this.drag);
            this.pageId = id;
            this.x1 = -this.w0 * this.pageId;
            JT.to(this.drag, 0.3, {
                x: this.x1, ease: JT.Quad.Out
            });
        },

        pageNext: function () {
            var _id = Math.max(0, Math.min(this.pageMax - 1, this.pageId + 1));
            this.pageTo(_id);
        },

        pagePrev: function () {
            var _id = Math.max(0, Math.min(this.pageMax - 1, this.pageId - 1));
            this.pageTo(_id);
        }


    };

    return Swiper;
}));
