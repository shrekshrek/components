/*!
 * GIT: https://github.com/shrekshrek/components
 **/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.ImgEditor = factory());
}(this, (function () {
    'use strict';

    var ImgEditor = function (config) {
        var _self = this;
        this.el = config.el;
        this.color = config.color;
        this.type = config.type || 'jpeg';
        this.quality = config.quality || 0.8;

        this.ctx = this.el.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.width = config.width || this.el.width;
        this.height = config.height || this.el.height;
        this.el.width = this.width;
        this.el.height = this.height;
        this.editData = {x: this.width / 2, y: this.height / 2, r: 0, s: 1};

        this.editImg = new Image();
        this.editImg.onload = function () {
            _self.editData.s = Math.max(_self.width / this.width, _self.height / this.height);
            _self.update();
        };
    };

    ImgEditor.prototype = {
        resize: function (width, height) {
            this.width = width;
            this.height = height;
            this.el.width = this.width;
            this.el.height = this.height;
            this.reset();
        },

        reset: function () {
            this.editData = {x: this.width / 2, y: this.height / 2, r: 0, s: 1};
            this.ctx.clearRect(0, 0, this.width, this.height);
        },

        setImg: function (src) {
            this.editImg.src = src;
        },

        getImg: function () {
            return this.el.toDataURL(this.type, this.quality);
        },

        update: function () {
            this.ctx.clearRect(0, 0, this.width, this.height);
            if (this.color) {
                this.ctx.fillStyle = this.color;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
            this.ctx.save();
            this.ctx.translate(this.editData.x, this.editData.y);
            this.ctx.rotate(this.editData.r * Math.PI / 180);
            this.ctx.scale(this.editData.s, this.editData.s);
            this.ctx.drawImage(this.editImg, -this.editImg.width / 2, -this.editImg.height / 2, this.editImg.width, this.editImg.height);
            this.ctx.restore();
        },

        move: function (evt) {
            this.editData.x = Math.max(-this.width * 0.5, Math.min(this.width * 1.5, this.editData.x + evt.deltaX * 1));
            this.editData.y = Math.max(0, Math.min(this.height, this.editData.y + evt.deltaY * 1));
            this.update();
        },

        pinch: function (evt) {
            this.editData.s = Math.max(0.5, Math.min(3, this.editData.s + evt.deltaLen * 0.005));
            this.update();
        },

        rotate: function (evt) {
            this.editData.r += evt.angle * 1;
            this.editData.r %= 360;
            this.update();
        },

    };

    return ImgEditor;

})));
