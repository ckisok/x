(() => {
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
        const dom = new DOMParser().parseFromString(html, 'text/html').documentElement

        const spanElements = Array.from(dom.querySelectorAll("span"));
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

        return dom.querySelector('body').innerHTML;
    }


    async function downloadImage(url) {
        const resp = await chrome.runtime.sendMessage({ url: url })
        console.log('下载结果:', resp)
    }

    // 处理图片的尺寸
    function fixImgSize(rootElement, containerWidth) {
        const imgs = rootElement.getElementsByTagName('img')
        for (const img of imgs) {
            const imgHtml = img.outerHTML
            const minWidth = Math.min(containerWidth, img.parentNode.offsetWidth)
            if (imgHtml.includes('data-w') && imgHtml.includes('data-ratio')) {
                let datawRe = /data-w="(.*?)px"/gi
                imgHtml.match(datawRe)
                let dataw = RegExp.$1
                let height = dataw && dataw.length > 0 ? parseInt(dataw) : 0;
                if (/data-w-new="(.*?)px"/gi.test(imgHtml)) {
                    datawRe = /data-w-new="(.*?)px"/gi
                    imgHtml.match(datawRe)
                    let datawNew = RegExp.$1
                    height = datawNew && datawNew.length > 0 ? parseInt(datawNew) : 0;
                }
                datawRe = /data-ratio="(.*?)"/gi
                imgHtml.match(datawRe)
                let dataRatio = RegExp.$1
                let ratio = dataRatio && dataRatio.length > 0 ? parseFloat(dataRatio) : 0;
                if (0 !== height && 0 !== ratio) {
                    let imgRect = img.getBoundingClientRect()
                    let intrinsicWidth = height / ratio
                    let width = intrinsicWidth
                    if ((datawRe = /width[0-9]{2,3}/gi).test(imgHtml)) {
                        datawRe = /width([0-9]{2,3})/gi
                        imgHtml.match(datawRe)
                        let widthNum = RegExp.$1
                        let widthN = widthNum && widthNum.length > 0 ? parseInt(widthNum) : 0;
                        if (widthN > 0 && widthN <= 100) {
                            height *= (width = minWidth * widthN / 100) / intrinsicWidth
                        }
                    } else {
                        imgHtml.includes('qqreader-fullimg') || imgHtml.includes('bleed-pic') || img.parentNode.classList.contains('bleed-pic')
                            ? height *= (width = minWidth) / intrinsicWidth
                            : imgRect.height > 1
                                ? width = (height = imgRect.height) / ratio
                                : imgRect.width > 1 && (height *= (width = imgRect.width) / intrinsicWidth)
                    }
                    if (width > minWidth && minWidth > 1) {
                        height *= minWidth / width
                        width = minWidth
                    }
                    img.style.width = width + 'px'
                    img.style.height = height + 'px'
                }
            }
        }
    }

    /**
     * 通过一个 iframe 渲染图片并调整图片大小
     * @param chapterHtml
     * @return {Promise<string>}
     */
    function adjustImgSizeInChapter(chapterHtml) {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe')
            iframe.srcdoc = chapterHtml
            iframe.style.visibility = 'hidden'
            iframe.style.position = 'absolute'
            iframe.style.left = '0'
            iframe.style.top = '0'
            iframe.style.zIndex = '-1'
            iframe.style.width = '800px'
            iframe.style.frameborder = '0'
            iframe.onload = function () {
                fixImgSize(iframe.contentDocument.documentElement, 800)
                const resultHtml = iframe.contentDocument.body.innerHTML
                resolve(resultHtml)
                iframe.remove()
            }
            iframe.onerror = function (event) {
                console.error(event)
                reject(new Error('图片加载失败'))
                iframe.remove()
            }
            document.body.appendChild(iframe)
        })
    }


    window.utils = {
        mergeSpanInHtml: mergeSpanInHtml,
        downloadImage: downloadImage,
        adjustImgSizeInChapter: adjustImgSizeInChapter,
    }
})();
