// 提前引入的库
const base64js = window.base64js
const cryptoJS = window.CryptoJS


function base64Decode(input) {
    return new TextDecoder().decode(base64js.toByteArray(input))
}

function md5(data) {
    return cryptoJS.MD5(data).toString()
}

/**
 * 计算参数的编码
 * @param {string} data
 * @return {string}
 */
function hash(data) {
    if (typeof data === "number") {
        data = data.toString();
    }
    if (typeof data !== "string") {
        return data;
    }

    const dataMd5 = md5(data);
    let _0x38b4d1 = dataMd5.substr(0, 3);
    const _0x4718f7 = function (data) {
        if (/^\d*$/.test(data)) {
            const dataLen = data.length;
            const _0xd2c2b1 = [];
            for (let i = 0; i < dataLen; i += 9) {
                const _0x56eaa4 = data.slice(i, Math.min(i + 9, dataLen));
                _0xd2c2b1.push(parseInt(_0x56eaa4).toString(16));
            }
            return ["3", _0xd2c2b1];
        }

        let _0x397242 = "";
        for (let i = 0; i < data.length; i++) {
            _0x397242 += data.charCodeAt(i).toString(16);
        }
        return ["4", [_0x397242]];
    }(data);

    _0x38b4d1 += _0x4718f7[0];
    _0x38b4d1 += 2 + dataMd5.substr(dataMd5.length - 2, 2);

    const _0x1e41f3 = _0x4718f7[1];
    for (let i = 0; i < _0x1e41f3.length; i++) {
        let _0x5c593c = _0x1e41f3[i].length.toString(16);
        1 === _0x5c593c.length && (_0x5c593c = "0" + _0x5c593c);
        _0x38b4d1 += _0x5c593c;
        _0x38b4d1 += _0x1e41f3[i];
        i < _0x1e41f3.length - 1 && (_0x38b4d1 += "g");
    }

    if (_0x38b4d1.length < 20) {
        _0x38b4d1 += dataMd5.substr(0, 20 - _0x38b4d1.length);
    }

    return _0x38b4d1 + md5(_0x38b4d1).substr(0, 3);
}

/**
 * 解密
 * @param {string} data
 * @return {string}
 */
function decrypt(data) {
    if (!data || "string" != typeof data || data.length <= 1) {
        return "";
    }
    let result = data.slice(1);
    result = function (result) {
        const _0x402072 = function () {
            const len = result.length;
            if (len < 4) {
                return [];
            }
            if (len < 11) {
                return [0, 2];
            }

            const _0x20b71e = Math.min(4, Math.ceil(len / 10));
            let _0x2afb18 = "";
            for (let i = len - 1; i > len - 1 - _0x20b71e; i--) {
                const _0x186eec = result.charCodeAt(i);
                _0x2afb18 += parseInt(_0x186eec.toString(2), 4);
            }

            const _0x27af8b = len - _0x20b71e - 2,
                _0x586d78 = _0x27af8b.toString().length,
                _0x1d71d6 = [];
            for (
                let i = 0;
                _0x1d71d6.length < 10 && i + _0x586d78 < _0x2afb18.length;
                i += _0x586d78
            ) {
                let _0x352ab7 = parseInt(_0x2afb18.slice(i, i + _0x586d78));
                _0x1d71d6.push(_0x352ab7 % _0x27af8b);
                _0x352ab7 = parseInt(_0x2afb18.slice(i + 1, i + 1 + _0x586d78));
                _0x1d71d6.push(_0x352ab7 % _0x27af8b);
            }
            return _0x1d71d6;
        }();
        return function (_0x4e56fa, _0x11d5c6) {
            const _0x51ba85 = _0x4e56fa.split("");
            for (let i = _0x11d5c6.length - 1; i >= 0; i -= 2) {
                for (let j = 1; j >= 0; j--) {
                    const _0x262bf2 = _0x51ba85[_0x11d5c6[i] + j];
                    _0x51ba85[_0x11d5c6[i] + j] = _0x51ba85[_0x11d5c6[i - 0x1] + j];
                    _0x51ba85[_0x11d5c6[i - 1] + j] = _0x262bf2;
                }
            }
            return _0x51ba85.join("");
        }(result, _0x402072);
    }(result);

    result = base64Decode(result);
    return result;
}

function chk(data) {
    if (!data || data.length <= 32) {
        return data;
    }

    const header = data.slice(0, 32);
    const body = data.slice(32);
    return header === md5(body).toUpperCase() ? body : "";
}

function dT(data) {
    return data && 0 !== data.length ? decrypt(data) : "";
}

function dH(data) {
    return data && 0 !== data.length ? decrypt(data) : "";
}

function dS(data) {
    return data && 0 !== data.length ? decrypt(data) : "";
}

async function downloadImage(url) {
    const resp = await chrome.runtime.sendMessage({ url: url })
    console.log('下载结果:', resp)
}

function downloadFile(file) {
    const tmpLink = document.createElement("a");
    const objectUrl = URL.createObjectURL(file);

    tmpLink.href = objectUrl;
    tmpLink.download = file.name;
    document.body.appendChild(tmpLink);
    tmpLink.click();

    document.body.removeChild(tmpLink);
    URL.revokeObjectURL(objectUrl);
}
