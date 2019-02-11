/*!
 * GIT: https://github.com/shrekshrek/components
 **/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.Former = factory());
}(this, (function () {
    'use strict';

    // 'date','month','week','time','datetime-local',
    // 'email','password','tel','text',

    // -------------------------------------------------------------------基类
    var BaseInput = function (options) {
        this.el = options.el || document.createElement('input');

        this.onUpdate = options.onUpdate || null;
        this.onFocusin = options.onFocusin || null;
        this.onFocusout = options.onFocusout || null;

        this.el.style.margin = '0px';
        this.el.style.padding = '0px';
        this.el.style.position = 'absolute';
        this.el.style.border = '0px';
        this.el.style.background = 'transparent';

        this.init(options);

        this.reg = /\S/;
    };

    Object.assign(BaseInput.prototype, {
        check: function () {
            return this.reg.test(this.el.value);
        },

        init: function (options) {
            if (options.id !== undefined) this.el.id = options.id;
            if (options.class !== undefined) this.el.className = options.class;
            if (options.name !== undefined) this.el.name = options.name;

            if (options.position !== undefined) this.el.style.position = options.position;
            if (options.left !== undefined) this.el.style.left = options.left + 'px';
            if (options.top !== undefined) this.el.style.top = options.top + 'px';
            if (options.border !== undefined) this.el.style.border = options.border;
            if (options.background !== undefined) this.el.style.background = options.background;
            if (options.width !== undefined) this.el.style.width = options.width + 'px';
            if (options.height !== undefined) this.el.style.height = this.el.style.lineHeight = options.height + 'px';
            if (options.fontSize !== undefined) this.el.style.fontSize = options.fontSize + 'px';
            if (options.maxLength !== undefined) this.el.maxLength = options.maxLength;
        },

        val: function () {
            if (value == undefined) return this.el.value;
            else this.el.value = value;
        },

    });

    // -------------------------------------------------------------------text普通文本输入框
    var TextInput = function (options) {
        options = options || {};

        BaseInput.call(this, options);
        this.el.type = 'text';

        this.limitLength = options.limitLength || '';
        this.language = options.language || '';

        var _isComposition = false;

        this.el.addEventListener('focusin', function () {
            if (this.onFocusin) this.onFocusin();
        }.bind(this));

        this.el.addEventListener('focusout', function () {
            if (this.onFocusout) this.onFocusout();
        }.bind(this));

        this.el.addEventListener('input', function () {
            if (!_isComposition) {
                if (this.language) this.checkLanguage();
                if (this.limitLength) this.checkLimit();
                if (this.onUpdate) this.onUpdate();
            }
        }.bind(this));

        this.el.addEventListener('compositionstart', function () {
            _isComposition = true;
        }.bind(this));

        this.el.addEventListener('compositionend', function () {
            _isComposition = false;
            if (this.language) this.checkLanguage();
            if (this.limitLength) this.checkLimit();
            if (this.onUpdate) this.onUpdate();
        }.bind(this));
    };

    TextInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: TextInput,

        checkLanguage: function () {
            switch (this.language) {
                case 'cn':
                    this.el.value = this.el.value.replace(/[^\u4e00-\u9fa5]/ig, '');
                    break;
                case 'en':
                    this.el.value = this.el.value.replace(/[^A-Za-z0-9]/ig, '');
                    break;
            }
        },

        getLength: function () {
            var _result = this.el.value.match(/[^\x00-\xff]/ig);
            var _cnLength = _result ? _result.length : 0;
            var _length = this.el.value.length + _cnLength;
            return _length;
        },

        checkLimit: function () {
            var _length = this.getLength();
            if (_length > this.limitLength) {
                this.el.value = this.el.value.substring(0, this.el.value.length - 1);
                this.checkLimit();
            }
        }

    });

    // -------------------------------------------------------------------mobile手机号输入框
    var MobileInput = function (options) {
        options = options || {};

        BaseInput.call(this, options);
        this.el.type = 'tel';
        this.el.maxLength = 11;

        this.reg = /^[1][3|4|5|7|8][0-9]{9}$/;
    };

    MobileInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: MobileInput,
    });

    // -------------------------------------------------------------------Email邮箱输入框
    var EmailInput = function (options) {
        options = options || {};

        BaseInput.call(this, options);
        this.el.type = 'email';

        this.reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    };

    EmailInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: EmailInput,
    });

    // -------------------------------------------------------------------password星型密码输入框
    var PasswordInput = function (options) {
        options = options || {};

        BaseInput.call(this, options);
        this.el.type = 'password';
    };

    PasswordInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: PasswordInput,
    });

    // -------------------------------------------------------------------date日期输入框
    var DateInput = function (options) {
        options = options || {};

        BaseInput.call(this, options);
        this.el.type = 'date';
    };

    DateInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: DateInput,
    });

    // -------------------------------------------------------------------select下拉选单
    var ComboBox = function (options) {
        this.el = options.el || document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.background = 'transparent';

        this.textEl = document.createElement('p');
        this.textEl.style.margin = '0px';
        this.textEl.style.padding = '0px';
        this.textEl.style.position = 'absolute';
        this.textEl.style.border = '0px';
        this.textEl.style.left = '0px';
        this.textEl.style.top = '0px';
        this.textEl.style.background = 'transparent';
        this.el.appendChild(this.textEl);

        this.selectEl = document.createElement('select');
        this.selectEl.style.position = 'absolute';
        this.selectEl.style.left = '0px';
        this.selectEl.style.top = '0px';
        this.el.appendChild(this.selectEl);

        this.selectEl.addEventListener('change', function (evt) {
            this.textEl.innerText = this.selectEl.value;
            this.onChange(evt);
        }.bind(this));

        this.set(options);
    };

    Object.assign(ComboBox.prototype, {
        set: function (options) {
            if (options.id !== undefined) this.el.id = options.id;
            if (options.class !== undefined) this.el.className = options.class;

            if (options.position !== undefined) this.el.style.position = options.position;
            if (options.left !== undefined) this.el.style.left = options.left + 'px';
            if (options.top !== undefined) this.el.style.top = options.top + 'px';
            if (options.border !== undefined) this.textEl.style.border = options.border;
            if (options.background !== undefined) this.textEl.style.background = options.background;
            if (options.width !== undefined) this.textEl.style.width = this.selectEl.style.width = options.width + 'px';
            if (options.height !== undefined) this.textEl.style.height = this.el.style.lineHeight = this.selectEl.style.height = options.height + 'px';

            if (options.fontSize !== undefined) this.el.style.fontSize = options.fontSize + 'px';
            if (options.onChange !== undefined) this.onChange = options.onChange;

            this.selectEl.style.opacity = 0;

            if (options.data) {
                var _html = '';
                for (var i = 0, l = options.data.length; i < l; i++) {
                    _html += '<option value ="' + options.data[i] + '">' + options.data[i] + '</option>';
                }
                this.selectEl.innerHTML = _html;
            }
        },

        val: function () {
            return this.selectEl.value;
        },

        onChange: function () {

        },
    });


    // -------------------------------------------------------------------

    var Former = {
        TextInput: TextInput,
        MobileInput: MobileInput,
        EmailInput: EmailInput,
        PasswordInput: PasswordInput,
        DateInput: DateInput,
        ComboBox: ComboBox
    };

    return Former;

})));
