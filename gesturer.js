/*!
 * GIT: https://github.com/shrekshrek/components
 **/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.Gesturer = factory());
}(this, (function () {
    'use strict';

    function getLen(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    function dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    function getAngle(v1, v2) {
        var mr = getLen(v1) * getLen(v2);
        if (mr === 0) return 0;
        var r = dot(v1, v2) / mr;
        if (r > 1) r = 1;
        return Math.acos(r);
    }

    function cross(v1, v2) {
        return v1.x * v2.y - v2.x * v1.y;
    }

    function getRotateAngle(v1, v2) {
        var angle = getAngle(v1, v2);
        if (cross(v1, v2) > 0) {
            angle *= -1;
        }

        return angle * 180 / Math.PI;
    }

    var Gesturer = function (config) {
        this.el = config.el;

        var empty = function () {
        };

        this.preV = {x: null, y: null};
        this.pinchStartLen = null;
        this.scale = 1;
        this.isDoubleTap = false;
        this.onRotate = config.onRotate || empty;
        this.onTouchStart = config.onTouchStart || empty;
        this.onMultipointStart = config.onMultipointStart || empty;
        this.onMultipointEnd = config.onMultipointEnd || empty;
        this.onPinch = config.onPinch || empty;
        this.onSwipe = config.onSwipe || empty;
        this.onTap = config.onTap || empty;
        this.onDoubleTap = config.onDoubleTap || empty;
        this.onLongTap = config.onLongTap || empty;
        this.onSingleTap = config.onSingleTap || empty;
        this.onPressMove = config.onPressMove || empty;
        this.onTouchMove = config.onTouchMove || empty;
        this.onTouchEnd = config.onTouchEnd || empty;
        this.onTouchCancel = config.onTouchCancel || empty;

        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.touchTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition = {x: null, y: null};

        this._touchStart = this._touchStart.bind(this);
        this._touchMove = this._touchMove.bind(this);
        this._touchEnd = this._touchEnd.bind(this);
        this._touchCancel = this._touchCancel.bind(this);
    };

    Object.assign(Gesturer.prototype, {
        on: function () {
            this.el.addEventListener("touchstart", this._touchStart, false);
            this.el.addEventListener("touchmove", this._touchMove, false);
            this.el.addEventListener("touchend", this._touchEnd, false);
            this.el.addEventListener("touchcancel", this._touchCancel, false);
        },

        off: function () {
            this.el.removeEventListener("touchstart", this._touchStart, false);
            this.el.removeEventListener("touchmove", this._touchMove, false);
            this.el.removeEventListener("touchend", this._touchEnd, false);
            this.el.removeEventListener("touchcancel", this._touchCancel, false);
        },

        destroy: function () {
            // this.gesture.destroy();
        },

        _touchStart: function (evt) {
            if (!evt.touches) return;
            this.now = Date.now();
            this.x1 = evt.touches[0].pageX;
            this.y1 = evt.touches[0].pageY;
            this.delta = this.now - (this.last || this.now);
            this.onTouchStart(evt);
            if (this.preTapPosition.x !== null) {
                this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30);
            }
            this.preTapPosition.x = this.x1;
            this.preTapPosition.y = this.y1;
            this.last = this.now;
            var preV = this.preV,
                len = evt.touches.length;
            if (len > 1) {
                this._cancelLongTap();
                var v = {x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1};
                preV.x = v.x;
                preV.y = v.y;
                this.pinchStartLen = this.pinchLen = getLen(preV);
                this.onMultipointStart(evt);
            }
            this.longTapTimeout = setTimeout(function () {
                this.onLongTap(evt);
            }.bind(this), 750);
        },

        _touchMove: function (evt) {
            if (!evt.touches) return;
            var preV = this.preV,
                len = evt.touches.length,
                currentX = evt.touches[0].pageX,
                currentY = evt.touches[0].pageY;
            this.isDoubleTap = false;
            if (len > 1) {
                var v = {x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY};

                if (preV.x !== null) {
                    if (this.pinchStartLen > 0) {
                        var _len = getLen(v);
                        evt.scale = _len / this.pinchStartLen;
                        evt.deltaLen = _len - this.pinchLen;
                        this.pinchLen = _len;
                        this.onPinch(evt);
                    }

                    evt.angle = getRotateAngle(v, preV);
                    this.onRotate(evt);
                }
                preV.x = v.x;
                preV.y = v.y;
            } else {
                if (this.x2 !== null) {
                    evt.deltaX = currentX - this.x2;
                    evt.deltaY = currentY - this.y2;

                } else {
                    evt.deltaX = 0;
                    evt.deltaY = 0;
                }
                this.onPressMove(evt);
            }

            this.onTouchMove(evt);

            this._cancelLongTap();
            this.x2 = currentX;
            this.y2 = currentY;
            if (evt.touches.length > 1) {
                this._cancelLongTap();
                evt.preventDefault();
            }
        },

        _touchEnd: function (evt) {
            if (!evt.changedTouches) return;
            this._cancelLongTap();
            var _self = this;
            if (evt.touches.length < 2) {
                this.onMultipointEnd(evt);
            }
            this.onTouchEnd(evt);
            //swipe
            if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
                (this.y2 && Math.abs(this.preV.y - this.y2) > 30)) {
                evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
                this.swipeTimeout = setTimeout(function () {
                    _self.onSwipe(evt);
                }, 0)
            } else {
                this.tapTimeout = setTimeout(function () {
                    _self.onTap(evt);
                    // trigger double tap immediately
                    if (_self.isDoubleTap) {
                        _self.onDoubleTap(evt);
                        clearTimeout(_self.touchTimeout);
                        _self.isDoubleTap = false;
                    } else {
                        _self.touchTimeout = setTimeout(function () {
                            _self.onSingleTap(evt);
                        }, 250);
                    }
                }, 0)
            }

            this.preV.x = 0;
            this.preV.y = 0;
            this.scale = 1;
            this.pinchStartLen = null;
            this.x1 = this.x2 = this.y1 = this.y2 = null;
        },

        _touchCancel: function (evt) {
            clearTimeout(this.touchTimeout);
            clearTimeout(this.tapTimeout);
            clearTimeout(this.longTapTimeout);
            clearTimeout(this.swipeTimeout);
            this.onTouchCancel(evt);
        },

        _cancelLongTap: function () {
            clearTimeout(this.longTapTimeout);
        },

        _swipeDirection: function (x1, x2, y1, y2) {
            return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
        }

    });

    return Gesturer;

})));
