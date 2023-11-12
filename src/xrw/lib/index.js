function handleFile(data) {
    console.log(data)
    const {toc: _toc, detail: _detail, chapters: _chapters} = data

    const bookInfo = _detail.detail
    const bookChapters = _chapters.chapters
    const bookToc = _toc.toc
    const bookId = bookInfo.bookId

    const chapters = []
    bookChapters.forEach(chapter => {
        chapter.chapterUid = ChapterUidMap[chapter.cid]

        let style
        if ('/web/book/chapter/e_0' in chapter) {
            // epub
            style = dS(chapter['/web/book/chapter/e_2'])
            style = parseStyle(style, {
                removeFontSizes: true,
                enableTranslate: false,
            })
            chapter.style = processStyles(style, bookId)

            const html = dH(chapter['/web/book/chapter/e_0'] + chapter['/web/book/chapter/e_1'] + chapter['/web/book/chapter/e_3'])
            const htmls = parseHtml(html, style, 10000)
            chapter.htmls = processHtmls(htmls, bookId)
        } else if ('/web/book/chapter/t_0' in chapter) {
            // txt
            const html = dT(chapter['/web/book/chapter/t_0'] + chapter['/web/book/chapter/t_1'])
            const htmls = parseTxt(html, 10000)
            chapter.htmls = processHtmls(htmls, bookId)
        }

        // 对 html 进行一些处理
        const sections = chapter.htmls.map((html) => {
            // 图片的处理
            // 去掉 base64 图片地址(该图片是占位符)
            html = html.replaceAll(/(<img[^>]+?)(src="data:[^"]+")/gs, "$1");
            // 将 data-src 替换成 src
            html = html.replaceAll(/(<img[^>]+?)data-src="/gs, '$1src="');

            // 替换不存在的封面图
            // https://res.weread.qq.com/wrepub/web/908872/device_phone_frontcover.jpg
            // https://wfqqreader-1252317822.image.myqcloud.com/cover/872/908872/t9_908872.jpg (bookInfo.cover)
            html = html.replaceAll(/(<img[^>]+?src=")([^"]+?device_phone_frontcover.jpg)("[^>]*?>)/gs, `$1${bookInfo.cover}$3`)

            // 剥离body外壳
            const bodyRe = /^<html><head><\/head><body>(?<body>.*)<\/body><\/html>$/s;
            const match = html.match(bodyRe);
            if (match) {
                return match.groups.body;
            }
            return html;
        }).join("");

        let html = `<section data-book-id="${bookId}" data-chapter-uid="${chapter.chapterUid}" class="readerChapterContent">`
        // 判断是否添加章节标题
        if (showChapterTitle(bookInfo)) {
            html += `<div class="chapterTitle">${chapterTitleText(bookInfo, chapter)}</div>`
        }
        html += `${sections}</section>`
        html = mergeSpanInHtml(html)
        const title = chapterTitleText(bookInfo, chapter) || chapter.title

        chapters.push({
            title: title,
            html: html,
            style: style,
        })
    })
    console.log(chapters)
}
