/*!
 * VERSION: 0.1.0
 * DATE: 2016-7-7
 * GIT: https://github.com/shrekshrek/components
 * @author: Shrek.wang
 **/

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function (exports) {
            window.ImgEditor = factory(exports);
        });
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        window.ImgEditor = factory({});
    }

}(function (ImgEditor) {

    ImgEditor = function () {
        this.initialize.apply(this, arguments);
    };

    ImgEditor.prototype = {
        initialize: function (config) {
            var _self = this;
            this.el = config.el;
            this.color = config.color;
            this.type = config.type || 'jpeg';
            this.quality = config.quality || 0.7;

            this.ctx = this.el.getContext('2d');
            this.ctx.imageSmoothingEnabled = true;
            this.width = this.el.width;
            this.height = this.el.height;
            this.editData = {x: this.width / 2, y: this.height / 2, r: 0, s: 1};

            this.editImg = new Image();
            this.editImg.onload = function () {
                _self.editData.s = Math.max(_self.width / this.width, _self.height / this.height);
                _self.update();
            };

        },

        size: function (rect) {
            this.width = rect.width;
            this.height = rect.height;
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

        onMove: function (evt) {
            this.editData.x = Math.max(-this.width * 0.5, Math.min(this.width * 1.5, this.editData.x + evt.deltaX * 1));
            this.editData.y = Math.max(0, Math.min(this.height, this.editData.y + evt.deltaY * 1));
            this.update();
        },

        onPinch: function (evt) {
            this.editData.s = Math.max(0.5, Math.min(3, this.editData.s + evt.deltaLen * 0.005));
            this.update();
        },

        onRotate: function (evt) {
            this.editData.r += evt.angle * 1;
            this.editData.r %= 360;
            this.update();
        },

    };

    return ImgEditor;
}));
