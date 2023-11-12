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

function parseTxt(txt, sectionStep) {

}
function parseHtml(html, style, sectionStep) {

}
function parseStyle(style, options) {

}
function processStyles(style, bookId) {
    return ''
}
function processHtmls(htmls, bookId) {
    return []
}

/**
 * 判断是否为相同的 span 节点
 * @param node1
 * @param node2
 */
function hasSameAttributes(node1, node2) {
    if (node1.attributes.length !== node2.attributes.length) {
        return false;
    }

    for (const attr of node2.attributes) {
        if (attr.name === "data-wr-co") {
            continue;
        }
        const node1Attr = node1.attributes.getNamedItem(attr.name);
        if (!node1Attr || node1Attr.value !== attr.value) {
            return false;
        }
    }

    return true;
}

/**
 * 合并相邻的 span 节点
 * @param html
 */
function mergeSpanInHtml(html) {
    const document = new DOMParser().parseFromString(html, 'text/html').documentElement
    // const { document } = parseHTML(html);

    const spanElements = Array.from(document.querySelectorAll("span"));
    while (spanElements.length > 0) {
        const current = spanElements.shift();
        let next;
        while ((next = current.nextSibling)) {
            if (next.nodeType === 1) {
                // 确认是否与前一个span样式相同
                if (hasSameAttributes(current, next)) {
                    // 合并span内容
                    current.innerHTML += (next).innerHTML;
                    next.remove();
                    spanElements.shift();
                } else {
                    // attributes 不相同，不合并
                    break;
                }
            } else if (next.nodeType === 3) {
                if ((next).wholeText.replace(/\s/g, "")) {
                    // span后面有文本内容，不合并
                    break;
                } else {
                    next.remove();
                }
            }
        }
    }

    return document.toString();
}



function isObject(obj) {
    return typeof obj === 'object' && obj !== null
}

class M278 {
    static hasOtherType(bookInfo) {
        return isObject(bookInfo) && bookInfo.otherType && bookInfo.otherType.length > 0
    }

    static otherType(bookInfo) {
        if (this.hasOtherType(bookInfo) && isObject(bookInfo)) {
            return bookInfo.otherType[0].type
        } else {
            return null
        }
    }

    static isHasTranslate(bookInfo) {
        if (!this.hasOtherType(bookInfo) || !isObject(bookInfo) || !this.otherType(bookInfo)) {
            return false
        }
        const otherType = bookInfo.otherType || []
        return !!Array.isArray(otherType) && otherType.some((bookType) => {
            return bookType && undefined !== bookType.translateStatus && bookType.showType && bookType.translateDone
        })
    }

    static isTranslationEnabled(bookInfo) {
        if (!this.hasOtherType(bookInfo) || !isObject(bookInfo) || !this.otherType(bookInfo)) {
            return false
        }
        const otherType = bookInfo.otherType || []
        return !!Array.isArray(otherType) && otherType.some((bookType) => {
            return bookType && 'open' === bookType.translateStatus && bookType.showType && bookType.translateDone
        })
    }

    static showOtherType(bookInfo) {
        if (this.hasOtherType(bookInfo) && isObject(bookInfo) && this.otherType(bookInfo)) {
            return bookInfo.otherType[0].showType
        } else {
            return false
        }
    }

    static actualTreatBookFormatAs(bookInfo) {
        if (this.hasOtherType(bookInfo) && this.showOtherType(bookInfo)) {
            return this.otherType(bookInfo)
        } else {
            return bookInfo.format
        }
    }

    static actualTreatBookAsEpub(bookInfo) {
        return 'epub' === this.actualTreatBookFormatAs(bookInfo)
    }

    static actualTreatBookAsPdf(bookInfo) {
        return 'pdf' === this.actualTreatBookFormatAs(bookInfo)
    }

    static isSupportedBookType(type) {
        return 0 === type || 8 === type
    }

    static isLegacyReaderSupportBook(bookInfo) {
        const type = bookInfo.type
        return this.isSupportedBookType(type) || this.actualTreatBookAsEpub(bookInfo)
    }

    static isPDFBookType(type) {
        return 11 === type
    }

    static isMPBookType(type) {
        return type === 3
    }

    static isComicType(type) {
        return 5 === type
    }

    static isSelfBookType(type) {
        return 8 === type
    }

    static isImportedBook(bookId) {
        return 'string' === typeof bookId && bookId.startsWith('CB_')
    }

    static isBuyUnitWholeBook(bookInfo) {
        return isObject(bookInfo) && 0 !== (1 & bookInfo.payType)
    }

    static isBuyUnitChapter(bookInfo) {
        return isObject(bookInfo) && 0 !== (2 & bookInfo.payType)
    }

    static isFree(bookInfo) {
        return isObject(bookInfo) && 0 != (0x20 & bookInfo.payType)
    }

    static isLimitFree(bookInfo) {
        return isObject(bookInfo) && 0x0 != (0x40 & bookInfo.payType)
    }

    static isLimitedSalesPromotion(bookInfo) {
        return isObject(bookInfo) && bookInfo.originalPrice > 0 && bookInfo.originalPrice > bookInfo.price
    }

    static isSupportFreeMemberShip(bookInfo) {
        return isObject(bookInfo) && !(0x2 === bookInfo.payingStatus || 0x4 === bookInfo.payingStatus)
    }

    static isSupportMemberShip(bookInfo) {
        return isObject(bookInfo) && 0 != (0x1000 & bookInfo.payType)
    }

    static isPaidCoinPurchaseOnly(bookInfo) {
        return isObject(bookInfo) && 0x0 != (bookInfo.payType & 0x1 << 0x15)
    }

    static isEPub(bookInfo) {
        return isObject(bookInfo) && this.actualTreatBookFormatAs(bookInfo) === 'epub'
    }

    static isSupportReaderProgress(bookInfo) {
        return isObject(bookInfo)
    }

    static isOuterBook(bookId) {
        return 'string' == typeof bookId && bookId.startsWith('W')
    }

    static isSoldOut(bookInfo) {
        return isObject(bookInfo) && (0x1 === bookInfo.soldout || 0x2 === bookInfo.soldout)
    }

    static isPaperBook(bookInfo) {
        return isObject(bookInfo) && bookInfo.paperBook && Number(bookInfo.paperBook.skuId) > 0
    }

    static isTrialReadBook(bookInfo) {
        return isObject(bookInfo) && !bookInfo.paid && 0 != (bookInfo.payType & 0x1 << 0x13)
    }

    static isCopyRightForbiddenRead(bookInfo) {
        return isObject(bookInfo) && '金庸' === bookInfo.author
    }

    static isPoliticalSensitive(bookInfo) {
        if (!isObject(bookInfo)) {
            return false
        }
        const payType = bookInfo.payType
        return Boolean(0x8000 & payType || 0x10000 & payType || payType & 0x1 << 0x11 || payType & 0x1 << 0x12)
    }

    static isSinglePurchaseBook(bookInfo) {
        return (bookInfo) && 0 != (bookInfo.payType & 0x1 << 0x1a)
    }

    static copyRightForbiddenReadToast = '因版权原因，本书不支持在网页端阅读。请至微信读书 App 阅读本书'
}

/**
 * 获取章节标题
 * @param bookInfo
 * @param chapter
 */
function chapterTitleText(bookInfo, chapter) {
    if (!M278.isSupportedBookType(bookInfo.type)) {
        return ''
    }
    if (!chapter) {
        return ''
    }
    const title = chapter.title
    return [M278.isEPub(bookInfo) ? '' : '第' + (chapter.chapterIdx || '') + '章', title].join(' ')
}

/**
 * 是否显示章节标题
 * @param bookInfo
 */
function showChapterTitle(bookInfo) {
    return !(M278.isEPub(bookInfo) || M278.actualTreatBookAsEpub(bookInfo)) || M278.isTrialReadBook(bookInfo)
}

async function downloadImage(url) {
    const resp = await chrome.runtime.sendMessage({ url: url })
    console.log('下载结果:', resp)
}
