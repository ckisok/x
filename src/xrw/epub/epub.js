(() => {
    // import {getImgExt, getUid, slugify, CORS_PROXY} from "./utils.js";
    const uuid = window.uuidv4

    const {escapeXml, zipFile} = window.epub.utils

    function getChapter(chapter) {
        const {title, html, style} = chapter;

        return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>${title}</title>
    <link rel="stylesheet" href="styles/common.css" />
    <style>${style}</style>
  </head>
  <body>
    ${html}
    
    <script src="scripts/common.js"></script>
  </body>
</html>
`;
    }

    function getContainer() {
        return `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    }

    function getPackage(book) {
        const {id, cover, coverMineType, title, description, lang, author, isbn, publisher, publishTime, chapters} = book;
        // 微信读书的出版时间是一个字符串，没办法确定时区，比如 2000-01-01T00:00:00Z
        // 这里按照北京时间算
        let created
        if (publishTime) {
            created = new Date(publishTime).toISOString().split(".")[0] + "Z";
        }
        const modified = new Date().toISOString().split(".")[0] + "Z";

        return `<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" dir="auto" unique-identifier="BookId" xmlns="http://www.idpf.org/2007/opf">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookId">urn:uuid:${id}</dc:identifier>
    ${isbn ? '<dc:identifier id="isbn">' + isbn +'</dc:identifier>' : '<!-- isbn -->'}
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>${escapeXml(lang)}</dc:language>
    <dc:creator id="creator">${escapeXml(author)}</dc:creator>
    ${created ? '<dc:date>' + created + '</dc:date>' : '<!-- created -->'}
    <dc:description>${escapeXml(description)}</dc:description>
    <dc:publisher>${escapeXml(publisher)}</dc:publisher>
    <meta refines="#creator" property="role" scheme="marc:relators" id="role">aut</meta>
    <meta refines="#BookId" property="identifier-type" scheme="onix:codelist5">22</meta>
    ${isbn ? '<meta refines="#isbn" property="identifier-type" scheme="onix:codelist5">15</meta>' : '<!-- isbn -->'}
    <meta property="dcterms:modified">${modified}</meta>
    <meta property="dcterms:identifier" id="meta-identifier">BookId</meta>
    <meta name="generator" content="weread.deno.dev" />
  </metadata>
  <manifest>
    <item id="chapter-image-placeholder" href="images/img-placeholder.png" media-type="image/png" />
    ${cover && coverMineType ? '<item id="cover-image" href="' + cover + '" media-type="' + coverMineType + '" properties="cover-image" />' : ''}
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav" />
${chapters.map(chapter => `    <item id="chapter-${chapter.chapterIdx}" href="${chapter.chapterIdx}.xhtml" media-type="application/xhtml+xml" properties="scripted" />`).join('\n')}
${chapters.flatMap(chapter => chapter.images).map(({id, type}) => `    <item id="chapter-image-${id}" href="images/${id}" media-type="${type}" fallback="chapter-image-placeholder" />`).join('\n')}
    <item id="common-style" href="styles/common.css" media-type="text/css" />
    <item id="common-script" href="scripts/common.js" media-type="application/javascript" />
  </manifest>
  <spine>
    <itemref idref="toc"/>
${chapters.map((chapter) => `    <itemref idref="chapter-${chapter.chapterIdx}" />`).join("\n")}
  </spine>
</package>
`;
    }

    function renderToc(toc) {
        let html = '<ol>\n'
        for (let i = 0; i < toc.length; i++) {
            const {title, chapterIdx, anchor, children} = toc[i]
            const idx = String(chapterIdx).padStart(3, "0")
            if (anchor) {
                html += `<li id="chapter-${idx}-${anchor}"><a epub:type="bodymatter" href="${idx}.xhtml#${anchor}">${escapeXml(title)}</a>`
            } else {
                html += `<li id="chapter-${idx}"><a epub:type="bodymatter" href="${idx}.xhtml">${escapeXml(title)}</a>`
            }
            if (Array.isArray(children) && children.length > 0) {
                html += renderToc(children)
            }
            html += '</li>'
        }
        html += '</ol>'
        return html
    }

    function getToc(epub) {
        const {toc} = epub;
        const tocHtml = renderToc(toc)

        return `<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html>
<html xmlns:epub="http://www.idpf.org/2007/ops" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>目录</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <h1>目录</h1>
    <nav id="toc" epub:type="toc">
      ${tocHtml}
    </nav>
  </body>
</html>
`;
    }



    /**
     * @typedef Book
     * @property {string} id
     * @property {string} cover 封面
     * @property {string} coverMineType
     * @property {string} title 书名
     * @property {string} author 作者
     * @property {string} description 简介
     * @property {string} lang 语言
     * @property {string} isbn ISBN
     * @property {string} publisher 出版公司
     * @property {string} publishTime 出版时间
     * @property {{chapterIdx: number, chapterUid: number, title: string, level: number, anchor: string, children: {}[]}[]} toc 目录
     * @property {{chapterIdx: number, chapterUid: number, title: string, html: string, style: string}[]} chapters 章节数据
     * @property {string[]} styles
     * @property {string[]} scripts
     */
    class Book extends EventTarget {
        constructor(options) {
            super()

            this.id = uuid()
            this.cover = options.cover || ''
            this.coverMineType = ''
            this.isbn = options.isbn || ''
            this.author = options.author?.replace(/\s+著$/i, '') || 'anonymous'
            this.description = options.description || ''
            this.publisher = options.publisher || 'anonymous'
            this.publishTime = options.publishTime || ''
            this.title = options.title || '[Untitled]'
            this.lang = options.lang || "zh"
            this.toc = options.toc || []
            this.chapters = options.chapters || []
            this.styles = options.styles || []
            this.scripts = options.scripts || []
        }

        /**
         * 解析并下载章节中的图片
         * @return {Promise<void>}
         */
        async resolveHtmlImages() {
            const chapters = []
            // 解析图片
            let imageCount = 0
            let errorCount = 0
            for (const chapter of this.chapters) {
                const $htmlDom = new DOMParser().parseFromString(
                    chapter.html,
                    "text/html"
                );

                const chapterImages = []
                const imgEls = Array.from($htmlDom.querySelectorAll("img"))
                for (const imgEl of imgEls) {
                    const src = imgEl.getAttribute("src");

                    if (imgEl.hasAttribute("srcset")) {
                        imgEl.removeAttribute("srcset");
                    }

                    // 下载图片并替换图片地址为本地地址
                    try {
                        const imgBlob = await window.utils.downloadImage(src)
                        imageCount++

                        const uid = window.epub.utils.getUid();
                        const ext = window.epub.utils.getImgExt({mimeType: '', fileUrl: src})
                        const id = `${uid}.${ext}`;

                        imgEl.setAttribute("src", `images/${id}`);
                        chapterImages.push({
                            id: id,
                            type: imgBlob.type,
                            blob: imgBlob,
                        })
                    } catch (e) {
                        errorCount++
                        console.error(e);
                        console.warn("Failed to fetch (will use placeholder):", src);
                        imgEl.setAttribute("src", "images/img-placeholder.png");
                    }

                    this.dispatchEvent(
                        new CustomEvent('image', {
                            detail: {
                                success: imageCount,
                                error: errorCount,
                            }
                        })
                    )
                }

                chapters.push({
                    chapterIdx: String(chapter.chapterIdx).padStart(3, "0"),
                    chapterUid: String(chapter.chapterUid).padStart(3, "0"),
                    title: chapter.title || "[Untitled]",
                    html: new XMLSerializer().serializeToString($htmlDom.querySelector("body > section")),
                    style: chapter.style,
                    images: chapterImages,
                })
            }

            this.chapters = chapters
        }

        /**
         * 导出 html
         * @return {Promise<void>}
         */
        async export2html() {
            const style = this.styles.map(style => `<style>${style}</style>`).join('\n')
            const script = this.scripts.map(script => `<script>${script}\x3c/script>`).join('\n')
            const contentHtml = this.chapters.map(chapter => `<!-- ${chapter.title} -->\n<style>${chapter.style}</style>\n${chapter.html}`).join('\n')

            let html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${this.title}</title>
    ${style}
</head>
<body>
<!-- todo: toc -->
${contentHtml}
${script}
</body>
</html>
`
            await zipFile(this.title + '.html', html)
        }

        /**
         * 导出 epub
         * @return {Promise<*>}
         */
        async export2epub() {
            await this.resolveHtmlImages()

            console.debug('图片解析之后:')
            console.debug(this)

            console.log(
                "Fetched %s images total.",
                this.chapters
                    .map((chapter) => chapter.images.length)
                    .reduce((a, b) => a + b, 0)
            );

            let zip = new JSZip();
            zip.file("mimetype", "application/epub+zip");
            zip.file("META-INF/container.xml", getContainer());

            // 下载封面图
            if (this.cover) {
                console.debug('下载封面图: ', this.cover)
                const coverImgBlob = await window.utils.downloadImage(this.cover)
                const ext = window.epub.utils.getImgExt({mimeType: '', fileUrl: this.cover})
                this.cover = `images/book-cover-image.${ext}`
                this.coverMineType = coverImgBlob.type
                zip.file("OEBPS/" + this.cover, coverImgBlob)
            }
            // 下载缺失图片占位符
            const placeholderImgBlob = await fetch(chrome.runtime.getURL('assets/book/img-placeholder.png'), {cache: "no-cache"}).then(resp => resp.blob())
            zip.file("OEBPS/images/img-placeholder.png", placeholderImgBlob);

            zip.file("OEBPS/package.opf", getPackage(this));
            zip.file("OEBPS/toc.xhtml", getToc(this));
            zip.file("OEBPS/styles/common.css", this.styles.join('\n'))
            zip.file("OEBPS/scripts/common.js", this.scripts.join('\n'))
            this.chapters.forEach((chapter) => {
                zip.file(`OEBPS/${chapter.chapterIdx}.xhtml`, getChapter(chapter));

                chapter.images.forEach(({id, blob}) => {
                    zip.file(`OEBPS/images/${id}`, blob);
                });
            });

            return zip
                .generateAsync({type: "blob", mimeType: "application/epub+zip"})
                .then((content) => {
                    saveAs(content, `${window.epub.utils.slugify(this.title)}.epub`);
                });
        }
    }

    window.epub.main = {
        Book: Book,
    }
})();
