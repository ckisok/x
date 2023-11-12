// utils.js
(() => {
    // 提前引入的库
    const base64js = window.base64js
    const cryptoJS = window.CryptoJS

    function base64Decode(input) {
        return new TextDecoder().decode(base64js.toByteArray(input))
    }

    function md5(data) {
        return cryptoJS.MD5(data).toString()
    }


    function cs(str) {
        for (var _0x2405e1 = arguments['length'] > 0x1 && void 0x0 !== arguments[0x1] ? arguments[0x1] : 0x15, _0x6f4142 = '', _0x906562 = 0x0, _0x4e4be3 = str['length']; _0x906562 < _0x4e4be3; _0x906562 += 0x2)
            _0x6f4142 += String['fromCharCode'](parseInt(str['slice'](_0x906562, _0x906562 + 0x2), _0x2405e1));
        return _0x6f4142;
    }

    function decrypt(data) {
        if (!data || 'string' !== typeof data || data.length <= 1) {
            return ''
        }
        let _0xf518cd = data.slice(1);
        _0xf518cd = function (_0x3977ca) {
            var _0x3ab0a1 = function () {
                var _0x33e53b = _0x3977ca['length'];
                if (_0x33e53b < 0x4)
                    return [];
                if (_0x33e53b < 0xb)
                    return [0x0, 0x2];
                for (var _0x3cf60f = Math['min'](0x4, Math['ceil'](_0x33e53b / 0xa)), _0x5b3ac7 = '', _0x6a7382 = _0x33e53b - 0x1; _0x6a7382 > _0x33e53b - 0x1 - _0x3cf60f; _0x6a7382--) {
                    var _0x46e990 = _0x3977ca['charCodeAt'](_0x6a7382);
                    _0x5b3ac7 += parseInt(_0x46e990[_0x9b2b('0xca')](0x2), 0x4);
                }
                for (var _0x1800ae = _0x33e53b - _0x3cf60f - 0x2, _0x137a8d = _0x1800ae['toString']()['length'], _0x5cb455 = [], _0xd32f00 = 0x0; _0x5cb455['length'] < 0xa && _0xd32f00 + _0x137a8d < _0x5b3ac7['length']; _0xd32f00 += _0x137a8d) {
                    var _0x12637e = parseInt(_0x5b3ac7['slice'](_0xd32f00, _0xd32f00 + _0x137a8d));
                    _0x5cb455[_0x9b2b('0x59')](_0x12637e % _0x1800ae),
                        _0x12637e = parseInt(_0x5b3ac7['slice'](_0xd32f00 + 0x1, _0xd32f00 + 0x1 + _0x137a8d)),
                        _0x5cb455['push'](_0x12637e % _0x1800ae);
                }
                return _0x5cb455;
            }();
            return function (_0x5f5c96, _0x5e6785) {
                for (var _0x27b5fa = _0x5f5c96['split'](''), _0x112e21 = _0x5e6785['length'] - 0x1; _0x112e21 >= 0x0; _0x112e21 -= 0x2)
                    for (var _0x31d03c = 0x1; _0x31d03c >= 0x0; _0x31d03c--) {
                        var _0x1febc9 = _0x27b5fa[_0x5e6785[_0x112e21] + _0x31d03c];
                        _0x27b5fa[_0x5e6785[_0x112e21] + _0x31d03c] = _0x27b5fa[_0x5e6785[_0x112e21 - 0x1] + _0x31d03c],
                            _0x27b5fa[_0x5e6785[_0x112e21 - 0x1] + _0x31d03c] = _0x1febc9;
                    }
                return _0x27b5fa['join']('');
            }(_0x3977ca, _0x3ab0a1);
        }(_0xf518cd)
        return _0xf518cd = base64Decode(_0xf518cd);
    }

    window.decrypt = {
        chk: function (data) {
            if (!data || data.length <= 32) {
                return data
            }
            let header = data.slice(0, 32),
                body = data.slice(32);
            return header === md5(body).toUpperCase() ? body : '';
        },
        dT: function (data) {
            return data && 0 !== data.length ? decrypt(data) : '';
        },
        dH: function (data) {
            return data && 0 !== data.length ? decrypt(data) : '';
        },
        dS: function (data) {
            return data && 0 !== data.length ? decrypt(data) : '';
        },
        cs: cs
    };
})()
