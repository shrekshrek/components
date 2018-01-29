/*!
 * VERSION: 0.1.0
 * DATE: 2016-7-7
 * GIT: https://github.com/shrekshrek/components
 * @author: Shrek.wang
 **/

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function (exports) {
            window.Former = factory(exports);
        });
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        window.Former = factory({});
    }

}(function (Former) {

    // 'date','month','week','time','datetime-local',
    // 'email','password','tel','text',

    // -------------------------------------------------------------------基类
    var BaseInput = function (params) {
        this.el = params.el || document.createElement('input');

        this.el.style.position = 'absolute';
        this.el.style.border = '0px';
        this.el.style.background = 'transparent';

        this.set(params);

        this.reg = /\S/;
    };

    Object.assign(BaseInput.prototype, {
        check: function () {
            return this.reg.test(this.el.value);
        },

        set: function (params) {
            if (params.id) this.el.id = params.id;
            if (params.class) this.el.className = params.class;
            if (params.position) this.el.style.position = params.position;
            if (params.border) this.el.style.border = params.border;
            if (params.background) this.el.style.background = params.background;
            if (params.name) this.el.name = params.name;
            if (params.maxLength) this.el.maxLength = params.maxLength;
            if (params.left) this.el.style.left = params.left + 'px';
            if (params.top) this.el.style.top = params.top + 'px';
            if (params.width) this.el.style.width = params.width + 'px';
            if (params.height) this.el.style.height = this.el.style.lineHeight = params.height + 'px';
            if (params.fontSize) this.el.style.fontSize = params.fontSize + 'px';
        },

        value: function () {
            return this.el.value;
        },

    });

    // -------------------------------------------------------------------text普通文本输入框
    var TextInput = function (params) {
        params = params || {};

        BaseInput.call(this, params);
        this.el.type = 'text';

        if (params.limitLength) this.limitLength = params.limitLength;
        if (params.language) this.language = params.language;

        if (this.limitLength || this.language) {
            var _self = this;
            this.el.addEventListener('change', function () {
                if (_self.language) _self.checkLanguage();
                if (_self.limitLength) _self.checkLimit();
            });
        }

    };

    TextInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: TextInput,

        checkLanguage: function () {
            switch (this.language) {
                case 'cn':
                    // console.log(this.el.value.replace(/[^\u4e00-\u9fa5]/ig, ''));
                    this.el.value = this.el.value.replace(/[^\u4e00-\u9fa5]/ig, '');
                    break;
                case 'en':
                    this.el.value = this.el.value.replace(/[^A-Za-z0-9]/ig, '');
                    break;
            }
        },

        checkLength: function () {
            var _result = this.el.value.match(/[^\x00-\xff]/ig);
            var _cnLength = _result ? _result.length : 0;
            var _length = this.el.value.length + _cnLength;
            return _length;
        },

        checkLimit: function () {
            var _length = this.checkLength();
            if (_length > this.limitLength) {
                this.el.value = this.el.value.substring(0, this.el.value.length - 1);
                this.checkLimit();
            }
        }

    });

    // -------------------------------------------------------------------mobile手机号输入框
    var MobileInput = function (params) {
        params = params || {};

        BaseInput.call(this, params);
        this.el.type = 'tel';
        this.el.maxLength = 11;

        this.reg = /^[1][3|4|5|7|8][0-9]{9}$/;
    };

    MobileInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: MobileInput,
    });

    // -------------------------------------------------------------------Email邮箱输入框
    var EmailInput = function (params) {
        params = params || {};

        BaseInput.call(this, params);
        this.el.type = 'email';

        this.reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    };

    EmailInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: EmailInput,
    });

    // -------------------------------------------------------------------password星型密码输入框
    var PasswordInput = function (params) {
        params = params || {};

        BaseInput.call(this, params);
        this.el.type = 'password';
    };

    PasswordInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: PasswordInput,
    });

    // -------------------------------------------------------------------date日期输入框
    var DateInput = function (params) {
        params = params || {};

        BaseInput.call(this, params);
        this.el.type = 'date';
    };

    DateInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: DateInput,
    });

    // -------------------------------------------------------------------select下拉选单
    var ComboBox = function (params) {
        this.el = params.el || document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.background = 'transparent';

        this.textEl = document.createElement('div');
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

        var _self = this;
        this.selectEl.addEventListener('change', function (evt) {
            _self.textEl.innerText = _self.selectEl.value;
            _self.onChange(evt);
        });

        this.set(params);
    };

    Object.assign(ComboBox.prototype, {
        set: function (params) {
            if (params.id) this.el.id = params.id;
            if (params.class) this.el.className = params.class;

            if (params.position) this.el.style.position = params.position;
            if (params.left) this.el.style.left = params.left + 'px';
            if (params.top) this.el.style.top = params.top + 'px';
            if (params.border) this.textEl.style.border = params.border;
            if (params.background) this.textEl.style.background = params.background;
            if (params.width) this.textEl.style.width = this.selectEl.style.width = params.width + 'px';
            if (params.height) this.textEl.style.height = this.el.style.lineHeight = this.selectEl.style.height = params.height + 'px';

            if (params.fontSize) this.el.style.fontSize = params.fontSize + 'px';
            if (params.onChange) this.onChange = params.onChange;

            this.selectEl.style.opacity = 0;

            if (params.data) {
                var _html = '';
                for (var i = 0, l = params.data.length; i < l; i++) {
                    _html += '<option value ="' + params.data[i] + '">' + params.data[i] + '</option>';
                }
                this.selectEl.innerHTML = _html;
            }
        },

        value: function () {
            return this.selectEl.value;
        },

        onChange: function () {

        },
    });


    // -------------------------------------------------------------------


    Former.TextInput = TextInput;
    Former.MobileInput = MobileInput;
    Former.EmailInput = EmailInput;
    Former.PasswordInput = PasswordInput;
    Former.DateInput = DateInput;
    Former.ComboBox = ComboBox;

    return Former;
}));
