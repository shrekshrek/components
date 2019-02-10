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

        this.preV = {x: null, y: null};
        this.pinchStartLen = null;
        this.scale = 1;
        this.isDoubleTap = false;

        this.onRotate = config.onRotate;
        this.onTouchStart = config.onTouchStart;
        this.onMultipointStart = config.onMultipointStart;
        this.onMultipointEnd = config.onMultipointEnd;
        this.onPinch = config.onPinch;
        this.onSwipe = config.onSwipe;
        this.onTap = config.onTap;
        this.onDoubleTap = config.onDoubleTap;
        this.onLongTap = config.onLongTap;
        this.onSingleTap = config.onSingleTap;
        this.onPressMove = config.onPressMove;
        this.onTwoFingerPressMove = config.onTwoFingerPressMove;
        this.onTouchMove = config.onTouchMove;
        this.onTouchEnd = config.onTouchEnd;
        this.onTouchCancel = config.onTouchCancel;

        this._cancelAllHandler = this.cancelAll.bind(this);
        window.addEventListener('scroll', this._cancelAllHandler);

        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.singleTapTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition = {x: null, y: null};

        this._start = this._start.bind(this);
        this._move = this._move.bind(this);
        this._end = this._end.bind(this);
        this._cancel = this._cancel.bind(this);
    };

    Object.assign(Gesturer.prototype, {
        on: function () {
            this.el.addEventListener("touchstart", this._start, false);
            this.el.addEventListener("touchmove", this._move, false);
            this.el.addEventListener("touchend", this._end, false);
            this.el.addEventListener("touchcancel", this._cancel, false);
        },

        off: function () {
            this.el.removeEventListener("touchstart", this._start, false);
            this.el.removeEventListener("touchmove", this._move, false);
            this.el.removeEventListener("touchend", this._end, false);
            this.el.removeEventListener("touchcancel", this._cancel, false);
        },

        destroy: function () {
            if (this.singleTapTimeout) clearTimeout(this.singleTapTimeout);
            if (this.tapTimeout) clearTimeout(this.tapTimeout);
            if (this.longTapTimeout) clearTimeout(this.longTapTimeout);
            if (this.swipeTimeout) clearTimeout(this.swipeTimeout);

            this.off();

            this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = this.onRotate = this.onTouchStart = this.onMultipointStart = this.onMultipointEnd = this.onPinch = this.onSwipe = this.onTap = this.onDoubleTap = this.onLongTap = this.onSingleTap = this.onPressMove = this.onTouchMove = this.onTouchEnd = this.onTouchCancel = this.onTwoFingerPressMove = null;

            window.removeEventListener('scroll', this._cancelAllHandler);
            return null;
        },

        _start: function (evt) {
            if (!evt.touches) return;
            this.now = Date.now();
            this.x1 = evt.touches[0].pageX;
            this.y1 = evt.touches[0].pageY;
            this.delta = this.now - (this.last || this.now);
            if (this.onTouchStart) this.onTouchStart(evt);
            if (this.preTapPosition.x !== null) {
                this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30);
                if (this.isDoubleTap) clearTimeout(this.singleTapTimeout);
            }
            this.preTapPosition.x = this.x1;
            this.preTapPosition.y = this.y1;
            this.last = this.now;
            var preV = this.preV,
                len = evt.touches.length;
            if (len > 1) {
                this._cancelLongTap();
                this._cancelSingleTap();
                var v = {x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1};
                preV.x = v.x;
                preV.y = v.y;
                this.pinchStartLen = this.pinchLen = getLen(preV);
                if (this.onMultipointStart) this.onMultipointStart(evt);
            }
            this._preventTap = false;
            this.longTapTimeout = setTimeout(function () {
                if (this.onLongTap) this.onLongTap(evt);
                this._preventTap = true;
            }.bind(this), 750);
        },

        _move: function (evt) {
            if (!evt.touches) return;
            var preV = this.preV,
                len = evt.touches.length,
                currentX = evt.touches[0].pageX,
                currentY = evt.touches[0].pageY;
            this.isDoubleTap = false;
            if (len > 1) {
                var sCurrentX = evt.touches[1].pageX,
                    sCurrentY = evt.touches[1].pageY
                var v = {x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY};

                if (preV.x !== null) {
                    if (this.pinchStartLen > 0) {
                        var _len = getLen(v);
                        evt.zoom = _len / this.pinchStartLen;
                        evt.deltaLen = _len - this.pinchLen;
                        this.pinchLen = _len;
                        if (this.onPinch) this.onPinch(evt);
                    }

                    evt.angle = getRotateAngle(v, preV);
                    if (this.onRotate) this.onRotate(evt);
                }
                preV.x = v.x;
                preV.y = v.y;

                if (this.x2 !== null && this.sx2 !== null) {
                    evt.deltaX = (currentX - this.x2 + sCurrentX - this.sx2) / 2;
                    evt.deltaY = (currentY - this.y2 + sCurrentY - this.sy2) / 2;
                } else {
                    evt.deltaX = 0;
                    evt.deltaY = 0;
                }
                if (this.onTwoFingerPressMove) this.onTwoFingerPressMove(evt);

                this.sx2 = sCurrentX;
                this.sy2 = sCurrentY;
            } else {
                if (this.x2 !== null) {
                    evt.deltaX = currentX - this.x2;
                    evt.deltaY = currentY - this.y2;

                    var movedX = Math.abs(this.x1 - this.x2),
                        movedY = Math.abs(this.y1 - this.y2);

                    if (movedX > 10 || movedY > 10) {
                        this._preventTap = true;
                    }
                } else {
                    evt.deltaX = 0;
                    evt.deltaY = 0;
                }
                if (this.onPressMove) this.onPressMove(evt);
            }

            if (this.onTouchMove) this.onTouchMove(evt);

            this._cancelLongTap();
            this.x2 = currentX;
            this.y2 = currentY;

            if (len > 1) evt.preventDefault();
        },

        _end: function (evt) {
            if (!evt.changedTouches) return;
            this._cancelLongTap();
            var _self = this;
            if (evt.touches.length < 2) {
                if (this.onMultipointEnd) this.onMultipointEnd(evt);
                this.sx2 = this.sy2 = null;
            }

            //swipe
            if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
                (this.y2 && Math.abs(this.y1 - this.y2) > 30)) {
                evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
                this.swipeTimeout = setTimeout(function () {
                    if (_self.onSwipe) _self.onSwipe(evt);
                }, 0)
            } else {
                this.tapTimeout = setTimeout(function () {
                    if (!_self._preventTap) {
                        if (_self.onTap) _self.onTap(evt);
                    }
                    // trigger double tap immediately
                    if (_self.isDoubleTap) {
                        if (_self.onDoubleTap) _self.onDoubleTap(evt);
                        _self.isDoubleTap = false;
                    }
                }, 0)

                if (!_self.isDoubleTap) {
                    _self.singleTapTimeout = setTimeout(function () {
                        if (_self.onSingleTap) _self.onSingleTap(evt);
                    }, 250);
                }
            }

            if (this.onTouchEnd) this.onTouchEnd(evt);

            this.preV.x = 0;
            this.preV.y = 0;
            this.zoom = 1;
            this.pinchStartLen = null;
            this.x1 = this.x2 = this.y1 = this.y2 = null;
        },

        cancelAll: function () {
            this._preventTap = true;
            clearTimeout(this.singleTapTimeout);
            clearTimeout(this.tapTimeout);
            clearTimeout(this.longTapTimeout);
            clearTimeout(this.swipeTimeout);
        },

        _cancel: function (evt) {
            this.cancelAll();
            if (this.onTouchCancel) this.onTouchCancel(evt);
        },

        _cancelLongTap: function () {
            clearTimeout(this.longTapTimeout);
        },

        _cancelSingleTap: function () {
            clearTimeout(this.singleTapTimeout);
        },

        _swipeDirection: function (x1, x2, y1, y2) {
            return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
        }

    });

    return Gesturer;

})));
