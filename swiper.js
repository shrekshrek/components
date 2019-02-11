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
        global.Swiper = factory(global.JT);
    }
}(this, (function (JT) {
    'use strict';

    var Swiper = function (config) {
        this.el = config.el;
        this.list = config.list || this.el.children[0];
        this.direction = config.direction == 'v' ? 'v' : 'h';
        this.loop = config.loop || false;
        this.width = config.width || parseFloat(JT.get(this.el, 'width'));
        this.height = config.height || parseFloat(JT.get(this.el, 'height'));

        this.moveTimeout = null;

        this.pageId = 0;
        this.pageMax = this.list.children.length;

        if (this.loop) {
            var _first = this.list.children[0].cloneNode(true);
            var _last = this.list.children[this.pageMax - 1].cloneNode(true);
            this.list.appendChild(_first);
            this.list.insertBefore(_last, this.list.firstChild);
        }

        this.resize(this.width, this.height);
        this.reset();
    };

    Swiper.prototype = {
        resize: function (width, height) {
            this.width = width;
            this.height = height;
            JT.set(this.el, {width: width, height: height});

            for (var i = 0, l = this.list.children.length; i < l; i++) {
                var _item = this.list.children[i];
                if (this.direction == 'h') JT.set(_item, {
                    width: width,
                    height: height,
                    left: (this.loop ? (i - 1) : i) * width
                });
                else JT.set(_item, {
                    width: width,
                    height: height,
                    top: (this.loop ? (i - 1) : i) * height
                });
            }

            if (this.direction == 'h') {
                this.xMax = 0;
                this.xMin = -this.width * (this.pageMax - 1);
            } else {
                this.yMax = 0;
                this.yMin = -this.height * (this.pageMax - 1);
            }
        },

        reset: function () {
            if (this.direction == 'h') {
                this.x = 0;
                this.dx = 0;
                JT.set(this.list, {x: this.x});
            } else {
                this.y = 0;
                this.dy = 0;
                JT.set(this.list, {y: this.y});
            }
            this.pageId = 0;
        },

        touchStart: function () {
            JT.kill(this.list);
            if (this.direction == 'h') this.dx = 0;
            else this.dy = 0;
        },

        touchMove: function (evt) {
            if (this.direction == 'h') {
                if (!this.loop && (this.x > this.xMax || this.x < this.xMin)) this.x += evt.deltaX * 0.4;
                else this.x += evt.deltaX;
                JT.set(this.list, {x: this.x});
                this.dx = evt.deltaX;
            } else {
                if (!this.loop && (this.y > this.yMax || this.y < this.yMin)) this.y += evt.deltaY * 0.4;
                else this.y += evt.deltaY;
                JT.set(this.list, {y: this.y});
                this.dy = evt.deltaY;
            }

            if (this.moveTimeout) {
                clearTimeout(this.moveTimeout);
                this.moveTimeout = null;
            }

            this.moveTimeout = setTimeout(function () {
                this.dx = this.dy = 0;
            }.bind(this), 50);
        },

        touchEnd: function () {
            var _dn = this.direction == 'h' ? this.dx : this.dy;
            var _d = this.direction == 'h' ? this.width : this.height;
            var _n = -(this.direction == 'h' ? this.x : this.y) / _d;
            if (_dn == 0) {
                this.pageTo(Math.round(_n));
            } else if (_dn > 0) {
                this.pageTo(Math.floor(_n));
            } else {
                this.pageTo(Math.ceil(_n));
            }
        },

        pageId: null,
        pageTo: function (id) {
            if (this.loop) id = Math.max(-1, Math.min(this.pageMax, id));
            else id = Math.max(0, Math.min(this.pageMax - 1, id));

            JT.kill(this.list);
            this.pageId = id;

            if (this.direction == 'h') {
                this.x = -this.width * this.pageId;
                JT.to(this.list, 0.3, {
                    x: this.x, ease: JT.Quad.Out, onEnd: function () {
                        JT.set(this.list, {x: this.x});
                    }.bind(this)
                });
            } else {
                this.y = -this.height * this.pageId;
                JT.to(this.list, 0.3, {
                    y: this.y, ease: JT.Quad.Out, onEnd: function () {
                        JT.set(this.list, {y: this.y});
                    }.bind(this)
                });
            }

            if (id < 0) this.pageId = this.pageMax - 1;
            else if (id > this.pageMax - 1) this.pageId = 0;
            else this.pageId = id;

            if (this.direction == 'h') this.x = -this.width * this.pageId;
            else this.y = -this.height * this.pageId;

            if (this.onPageTo) this.onPageTo();
        },

        pageNext: function () {
            this.pageTo(this.pageId + 1);
        },

        pagePrev: function () {
            this.pageTo(this.pageId - 1);
        }

    };

    return Swiper;

})));
