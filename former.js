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

        this.el.style.position = params.position || 'absolute';
        this.el.style.border = (params.border || 0) + 'px';
        this.el.style.background = params.background || 'transparent';

        if (params.name) this.el.name = params.name;
        if (params.maxLength) this.el.maxLength = params.maxLength;
        if (params.left) this.el.style.left = params.left + 'px';
        if (params.top) this.el.style.top = params.top + 'px';
        if (params.width) this.el.style.width = params.width + 'px';
        if (params.height) this.el.style.height = this.el.style.lineHeight = params.height + 'px';
        if (params.fontSize) this.el.style.fontSize = params.fontSize + 'px';

        this.reg = /\S/;
    };

    Object.assign(BaseInput.prototype, {
        check: function () {
            return this.reg.test(this.el.value);
        }
    });

    // -------------------------------------------------------------------text普通文本输入框
    var TextInput = function (params) {
        params = params || {};

        BaseInput.call(this, params);
        this.el.type = 'text';

        if (params.limitLength) {
            var _self = this;
            this.limitLength = params.limitLength;
            this.el.addEventListener('input', function () {
                _self.checkLimit();
            });
        }

        // switch(params.lang){
        //     case 'cn':
        //         break;
        //     case 'en':
        //         break;
        //     case 'cen':
        //         break;
        // }

    };

    TextInput.prototype = Object.assign(Object.create(BaseInput.prototype), {
        constructor: TextInput,

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

    // -------------------------------------------------------------------
    var Select = function () {

    };

    Former.TextInput = TextInput;
    Former.MobileInput = MobileInput;
    Former.EmailInput = EmailInput;
    Former.PasswordInput = PasswordInput;
    Former.DateInput = DateInput;

    Former.Select = Select;

    return Former;
}));
