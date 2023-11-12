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

    window.utils = {
        mergeSpanInHtml: mergeSpanInHtml,
        downloadImage: downloadImage,
    }
})();
