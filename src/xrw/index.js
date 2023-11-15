/**
 * 获取公共样式
 * @return {Promise<Awaited<string>[]>}
 */
async function getCommonStyles() {
    return await Promise.all([
        chrome.runtime.getURL('assets/book/styles/footer_note.css'),
        chrome.runtime.getURL('assets/book/styles/reset.css'),
    ].map(url => {
        return fetch(url).then(resp => resp.text())
    }))
}

/**
 * 获取公共脚本
 * @return {Promise<Awaited<string>[]>}
 */
async function getCommonScripts() {
    return await Promise.all([
        chrome.runtime.getURL('assets/book/js/footer_note.js'),
    ].map(url => {
        return fetch(url).then(resp => resp.text())
    }))
}

function getCoverChapterHtml(bookInfo) {
    return `<section data-book-id="${bookInfo.bookId}" data-chapter-uid="1" class="readerChapterContent"><div data-wr-bd="1" data-wr-co="337">
  <div class="custom-cover">
    <img src="${bookInfo.cover}" alt="封面">
  </div>
</div></section>`
}

/**
 * 解密 json 文件
 * @param {{toc: [], detail: *, chapters: []}} data 文件内容
 * @return {Promise<{bookInfo: *, bookToc: *[], bookChapters: *[], bookId: string}>}
 */
async function decryptFile(data) {
    const {toc: _toc, detail: _detail, chapters: _chapters} = data

    const bookInfo = _detail.detail
    const bookChapters = _chapters.chapters
    const bookToc = _toc.toc
    const bookId = bookInfo.bookId

    let chapters = []
    bookChapters.forEach(chapter => {
        chapter.chapterUid = ChapterUidDb[chapter.cid]

        let style
        if ('/web/book/chapter/e_0' in chapter) {
            // epub
            chapter['/web/book/chapter/e_0'] = window.weread.utils.chk(chapter['/web/book/chapter/e_0'])
            chapter['/web/book/chapter/e_1'] = window.weread.utils.chk(chapter['/web/book/chapter/e_1'])
            chapter['/web/book/chapter/e_2'] = window.weread.utils.chk(chapter['/web/book/chapter/e_2'])
            chapter['/web/book/chapter/e_3'] = window.weread.utils.chk(chapter['/web/book/chapter/e_3'])

            style = window.weread.utils.dS(chapter['/web/book/chapter/e_2'])
            style = window.weread.style.parse(style, {
                removeFontSizes: true,
                enableTranslate: false,
            })
            chapter.style = window.weread.store.processStyles(style, bookId)

            const html = window.weread.utils.dH(chapter['/web/book/chapter/e_0'] + chapter['/web/book/chapter/e_1'] + chapter['/web/book/chapter/e_3'])
            const htmls = window.weread.html.parse(html, style, 10000)
            chapter.htmls = window.weread.store.processHtmls(htmls, bookId)
        } else if ('/web/book/chapter/t_0' in chapter) {
            // txt
            chapter['/web/book/chapter/t_0'] = window.weread.utils.chk(chapter['/web/book/chapter/t_0'])
            chapter['/web/book/chapter/t_1'] = window.weread.utils.chk(chapter['/web/book/chapter/t_1'])

            const html = window.weread.utils.dT(chapter['/web/book/chapter/t_0'] + chapter['/web/book/chapter/t_1'])
            const htmls = window.weread.html.parseTxt(html, 10000)
            chapter.htmls = window.weread.store.processHtmls(htmls, bookId)
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
        if (window.weread.m278.showChapterTitle(bookInfo)) {
            html += `<div class="chapterTitle">${window.weread.m278.chapterTitleText(bookInfo, chapterInToc)}</div>`
        }
        html += `${sections}</section>`
        html = window.utils.mergeSpanInHtml(html)
        const title = window.weread.m278.chapterTitleText(bookInfo, chapterInToc) || chapterInToc.title

        chapters.push({
            title: title,
            html: html,
            style: style,
            chapterUid: chapterInToc.chapterUid,
            chapterIdx: chapterInToc.chapterIdx,
        })
    })

    // 调整图片大小
    let count = 0
    let total = chapters.length
    for (const chapter of chapters) {
        chapter.html = await window.utils.adjustImgSizeInChapter(chapter.html)
        document.querySelector('#btn').textContent = `解密进度: ${++count}/${total}`
    }
    chapters = chapters.sort((a, b) => a.chapterIdx - b.chapterIdx)

    // 封面图替换成高清图片
    const re = /(.+)\/s_([^/]+)$/
    if (re.test(bookInfo.cover)) {
        bookInfo.cover = bookInfo.cover.replace(/(.+)\/s_([^/]+)$/, '$1/t9_$2')
    }

    if (chapters[0].title !== '封面') {
        chapters.unshift({
            title: '封面',
            chapterUid: chapters[0].chapterUid-1,
            chapterIdx: chapters[0].chapterIdx-1,
            html: getCoverChapterHtml(bookInfo),
            style: chapters[0].style,
        })
    }

    return {
        bookId: bookId,
        bookInfo: bookInfo,
        bookToc: bookToc,
        bookChapters: chapters,
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
    const book = new window.epub.main.Book({
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
            document.querySelector('#btn').textContent = `打包图片进度: (${success}:${error})`
        })
        await book.export2epub()
    } else {
        alert('不支持的下载格式: ' + format)
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    let timer
    let dropFile
    let isRunning = false
    document.querySelector('input[type=file]').addEventListener('change', (evt) => {
        if (evt.target.files.length > 0) {
            dropFile = evt.target.files[0]
            textarea.value = dropFile.name
            document.querySelector('#btn').disabled = false
        }
    })

    const textarea = document.querySelector('textarea')
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
    textarea.addEventListener('click', (evt) => {
        evt.preventDefault()

        // 如果正在生成中，则不能选择新的文件
        if (isRunning === false) {
            document.querySelector('input[type=file]').click()
        }
    })


    document.querySelector('#btn').addEventListener('click', (evt) => {
        evt.preventDefault()

        if (dropFile) {
            document.querySelector('#btn').disabled = true
            document.querySelector('#btn').textContent = '解密中'
            isRunning = true

            setTimeout(async () => {
                const formData = new FormData(document.querySelector('form'))
                const format = formData.get('format')

                const commonStyles = await getCommonStyles()
                const commonScripts = await getCommonScripts()

                try {
                    const fileContent = await dropFile.text()
                    const book = await decryptFile(JSON.parse(fileContent))
                    console.log(book)
                    document.querySelector('#btn').textContent = '生成文件中'

                    await bundleBook(format, book, commonStyles, commonScripts)
                } catch (e) {
                    console.error(e)
                } finally {
                    document.querySelector('#btn').disabled = false
                    document.querySelector('#btn').textContent = '生成'
                    isRunning = false
                }
            }, 0)
        }
    })
})
