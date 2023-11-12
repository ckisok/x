(() => {
    /**
     * Check if a URL is relative to the current path or not
     * https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
     * @param {string} url
     * @returns {boolean}
     */
    function isUrlAbsolute(url) {
        if (url.indexOf("//") === 0) {
            return true;
        } // URL is protocol-relative (= absolute)
        if (url.indexOf("://") === -1) {
            return false;
        } // URL has no protocol (= relative)
        if (url.indexOf(".") === -1) {
            return false;
        } // URL does not contain a dot, i.e. no TLD (= relative, possibly REST)
        if (url.indexOf("/") === -1) {
            return false;
        } // URL does not contain a single slash (= relative)
        if (url.indexOf(":") > url.indexOf("/")) {
            return false;
        } // The first colon comes after the first slash (= relative)
        if (url.indexOf("://") < url.indexOf(".")) {
            return true;
        } // Protocol is defined before first dot (= absolute)
        return false; // Anything else must be relative
    }

    /**
     * Take a relative path, resolve it within a base path, and return it
     * @param {string} relativeUrl
     * @param {string} baseUrl
     * @return {string}
     */
    function resolveUrl(relativeUrl, baseUrl) {
        const url = new URL(relativeUrl, baseUrl);
        return url.href ? url.href : relativeUrl;
    }

    /**
     * https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
     * @param {string} string
     * @returns {boolean}
     */
    function isValidHttpUrl(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    /**
     * https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
     * @param {string} file
     * @param {string} contents
     */
    function downloadFile({ file, contents }) {
        var element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(contents)
        );
        element.setAttribute("download", file);

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    /**
     * https://gist.github.com/codeguy/6684588
     * @param {string} str
     * @returns {string}
     */
    function slugify(str) {
        str = str.replace(/^\s+|\s+$/g, ""); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        const to = "aaaaeeeeiiiioooouuuunc------";
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
        }

        str = str
            // .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
            .replace(/\s+/g, "-") // collapse whitespace and replace by '-'
            .replace(/-+/g, "-"); // collapse dashes

        return str;
    }


    function stripHtml(html) {
        if (typeof window !== "undefined") {
            var doc = new DOMParser().parseFromString(html, "text/html");
            return doc.body.textContent || "";
        } else {
            return html;
        }
    }

    function isValidUrl(string) {
        try {
            new URL(string);
        } catch (_) {
            return false;
        }

        return true;
    }

    /**
     * Check if a string is ISO8601 format, specifically: `YYYY-MM-DDTHH:MN:SS.MSSZ`
     * https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
     * @param {string} str
     * @returns {boolean}
     */
    function isIsoDate(str) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
        var d = new Date(str);
        return d.toISOString() === str;
    }


    /**
     * https://stackoverflow.com/a/27979933/1339693
     */
    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "&":
                    return "&amp;";
                case "'":
                    return "&apos;";
                case '"':
                    return "&quot;";
            }
        });
    }

    /**
     * Given an image's mimetype, return the extension. If there's no extension
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
     * @param {{
     *   mimeType: string,
     *   fileUrl: string
     * }}
     * @returns {string}
     */
    function getImgExt({ mimeType, fileUrl }) {
        switch (mimeType) {
            case "image/apng":
                return "apng";
            case "image/bmp":
                return "bmp";
            case "image/gif":
                return "gif";
            case "image/x-icon":
                return "ico";
            case "image/jpeg":
                return "jpg";
            case "image/png":
                return "png";
            case "image/svg+xml":
                return "svg";
            case "image/tiff":
                return "tiff";
            case "image/webp":
                return "webp";
            default:
                // Pull it from the filename if we can't get it
                // https://stackoverflow.com/questions/6997262/how-to-pull-url-file-extension-out-of-url-string-using-javascript
                return fileUrl.split(/[#?]/)[0].split(".").pop().trim();
        }
    }

    /**
     * Import a UMD file using a promise
     * @param {string} url
     */
    function importUMD(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.onload = () => {
                resolve();
            };
            script.onerror = (err) => {
                reject(err);
            };
            script.src = url;

            document.head.appendChild(script);
        });
    }

    /**
     * https://gist.github.com/SimonHoiberg/ad2710c8626c5a74cddd8f6385795cc0
     * @returns {string}
     */
    function getUid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 打包 zip 文件
     * @param {string} filename
     * @param {string} content
     * @return {Promise<void>}
     */
    async function zipFile(filename, content) {
        const zip = new JSZip()
        zip.file(filename, content)
        const blob = await zip.generateAsync({type: "blob"})
        saveAs(blob, `${filename}.zip`)
    }

    window.epubUtils = {
        slugify: slugify,
        escapeXml: escapeXml,
        getImgExt: getImgExt,
        getUid: getUid,
        zipFile: zipFile,
    }
})();
