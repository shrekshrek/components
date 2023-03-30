/*!
 * GIT: https://github.com/shrekshrek/components
 **/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.ImgPicker = factory());
}(this, (function () {
    'use strict';

    var ImgPicker = function (config) {
        config = config || {};
        this.el = config.el || function () {
            var input = document.createElement("INPUT");
            input.type = 'file';
            input.accept = 'image/*';
            // input.accept = 'image/png,image/jpeg,image/gif';
            // input.capture = 'camera';
            input.multiple = false;
            return input;
        }();
        this.color = config.color;
        this.size = config.size || 500;
        this.type = config.type || 'jpeg';
        this.quality = config.quality || 0.8;
        this.handler = config.handler || function () {
        };

        this.cvs = document.createElement('canvas');
        this.ctx = this.cvs.getContext('2d');

        this._changeHandler = this._changeHandler.bind(this);
        this.el.addEventListener('change', this._changeHandler, false);
    };

    ImgPicker.prototype = {
        _changeHandler: function (evt) {
            var _self = this;

            var _file = evt.target.files[0];

            if (_file == undefined) return;

            var imgW, imgW2, tmpImgW;
            var imgH, imgH2, tmpImgH;

            window.URL = window.URL || window.webkitURL;
            var src = window.URL.createObjectURL(_file);

            var img = new Image();
            img.src = src;
            img.onload = function () {
                imgW = img.width;
                imgH = img.height;

                if (imgW >= imgH) {
                    imgW2 = _self.size;
                    imgH2 = imgW2 * imgH / imgW;
                    tmpImgW = imgW;
                    tmpImgH = imgH;
                } else {
                    imgH2 = _self.size;
                    imgW2 = imgH2 * imgW / imgH;
                    tmpImgW = imgH;
                    tmpImgH = imgW;
                }

                _self.cvs.width = imgW2;
                _self.cvs.height = imgH2;
                _self.ctx.clearRect(0, 0, imgW2, imgH2);

                if (_self.color) {
                    _self.ctx.fillStyle = _self.color;
                    _self.ctx.fillRect(0, 0, imgW2, imgH2);
                }

                _self.ctx.translate(imgW2 / 2, imgH2 / 2);

                if (3260 < tmpImgW || tmpImgH > 2440) {
                    _self.ctx.drawImage(img, 0, 0, imgW, imgH, -imgW2 / 2, -imgH2 / 2, imgW2, imgH2);
                } else {
                    _self.ctx.drawImage(img, -imgW2 / 2, -imgH2 / 2, imgW2, imgH2);
                }

                _self.handler.call(this, {
                    img: _self.cvs.toDataURL('image/' + _self.type, _self.quality),
                    width: _self.cvs.width,
                    height: _self.cvs.height
                });

                window.URL.revokeObjectURL(_file);
            };
        },

        select: function () {
            if (this.el) this.el.click();
        },

        destroy: function () {
            this.el.removeEventListener('change', this._changeHandler, false);
            delete this.ctx;
            delete this.cvs;
            delete this.el;
        }
    };

    return ImgPicker;

})));
