/**
 * 解密文件
 * @param {string} data
 * @return {Promise<{bookInfo: *, bookToc: *[], bookChapters: *[], bookId: string}>}
 */
async function decryptFile(data) {
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
            chapter['/web/book/chapter/e_0'] = window.decrypt.chk(chapter['/web/book/chapter/e_0'])
            chapter['/web/book/chapter/e_1'] = window.decrypt.chk(chapter['/web/book/chapter/e_1'])
            chapter['/web/book/chapter/e_2'] = window.decrypt.chk(chapter['/web/book/chapter/e_2'])
            chapter['/web/book/chapter/e_3'] = window.decrypt.chk(chapter['/web/book/chapter/e_3'])

            style = window.decrypt.dS(chapter['/web/book/chapter/e_2'])
            style = window.style.parse(style, {
                removeFontSizes: true,
                enableTranslate: false,
            })
            chapter.style = window.mutation.processStyles(style, bookId)

            const html = window.decrypt.dH(chapter['/web/book/chapter/e_0'] + chapter['/web/book/chapter/e_1'] + chapter['/web/book/chapter/e_3'])
            const htmls = window.html.parse(html, style, 10000)
            chapter.htmls = window.mutation.processHtmls(htmls, bookId)
        } else if ('/web/book/chapter/t_0' in chapter) {
            // txt
            chapter['/web/book/chapter/t_0'] = window.decrypt.chk(chapter['/web/book/chapter/t_0'])
            chapter['/web/book/chapter/t_1'] = window.decrypt.chk(chapter['/web/book/chapter/t_1'])

            const html = window.decrypt.dT(chapter['/web/book/chapter/t_0'] + chapter['/web/book/chapter/t_1'])
            const htmls = window.html.parseTxt(html, 10000)
            chapter.htmls = window.mutation.processHtmls(htmls, bookId)
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


        const chapterInToc = bookToc.find(item => item.chapterUid === chapter.chapterUid)

        let html = `<section data-book-id="${bookId}" data-chapter-uid="${chapterInToc.chapterUid}" class="readerChapterContent">`
        // 判断是否添加章节标题
        if (window.m278.showChapterTitle(bookInfo)) {
            html += `<div class="chapterTitle">${window.m278.chapterTitleText(bookInfo, chapterInToc)}</div>`
        }
        html += `${sections}</section>`
        html = window.utils.mergeSpanInHtml(html)
        const title = window.m278.chapterTitleText(bookInfo, chapterInToc) || chapterInToc.title

        chapters.push({
            title: title,
            html: html,
            style: style,
            chapterUid: chapterInToc.chapterUid,
            chapterIdx: chapterInToc.chapterIdx,
        })
    })

    // 调整图片大小
    for (const chapter of chapters) {
        chapter.html = await window.utils.adjustImgSizeInChapter(chapter.html)
    }

    return {
        bookId: bookId,
        bookInfo: bookInfo,
        bookToc: bookToc,
        bookChapters: chapters.sort((a, b) => a.chapterIdx - b.chapterIdx)
    }
}

/**
 * 打包书籍
 * @param {'html'|'epub'}format 打包格式
 * @param {{bookId: string, bookInfo: *, bookToc: *[], bookChapters: *[]}} bookData
 * @param {string[]} commonStyles
 * @param {string[]} commonScripts
 */
async function bundleBook(format, bookData, commonStyles = [], commonScripts = []) {
    let {title, author, cover, intro, isbn, publishTime, publisher} = bookData.bookInfo
    const book = new window.epub.Book({
        cover: cover,
        isbn: isbn,
        author: author,
        description: intro,
        publisher: publisher,
        publishTime: publishTime,
        title: title,
        toc: bookData.bookToc,
        chapters: bookData.bookChapters,
        styles: commonStyles,
        scripts: commonScripts,
    })

    if (format === 'html') {
        await book.export2html()
    } else if (format === 'epub') {
        book.addEventListener('image', (evt) => {
            const {success, error} = evt.detail
            // 更新进度提示
            document.querySelector('.download_btn').textContent = `打包图片进度: (${success}:${error})`
        })
        await book.export2epub()
    } else {
        alert('不支持的下载格式: ' + format)
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.querySelector('textarea')
    let timer
    let dropFile
    textarea.addEventListener('dragover', (evt) => {
        evt.preventDefault()
        textarea.classList.add('overing')
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            textarea.classList.remove('overing')
        }, 50)
    })
    textarea.addEventListener('drop', (evt) => {
        evt.preventDefault()

        if (evt.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < evt.dataTransfer.items.length; i++) {
                if (evt.dataTransfer.items[i].kind === 'file') {
                    const file = evt.dataTransfer.items[i].getAsFile()
                    if (file && file.type === 'application/json') {
                        dropFile = file
                    }
                }
            }
        } else if (evt.dataTransfer.files) {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < evt.dataTransfer.files.length; i++) {
                const file = evt.dataTransfer.files[i]
                if (file && file.type === 'application/json') {
                    dropFile = file
                }
            }
        }

        if (dropFile) {
            textarea.value = dropFile.name
            document.querySelector('#btn').disabled = false
        } else {
            alert('请使用json文件')
        }
    })


    document.querySelector('#btn').addEventListener('click', async (evt) => {
        evt.preventDefault()

        const formData = new FormData(document.querySelector('form'))
        const format = formData.get('format')

        if (format !== 'html') {
            alert('目前仅支持 html 格式')
            return
        }

        if (dropFile) {
            try {
                document.querySelector('#btn').disabled = true
                document.querySelector('#btn').textContent = '生成中'
                const fileContent = await dropFile.text()
                const book = await decryptFile(JSON.parse(fileContent))
                console.log(book)
                await bundleBook(format, book)
            } catch (e) {
                console.error(e)
            } finally {
                document.querySelector('#btn').disabled = false
                document.querySelector('#btn').textContent = '生成'
            }
        }
    })
})
