const books = {
    d7932200813ab6ffeg016c0e: {
        bid: 'd7932200813ab6ffeg016c0e',
        bookId: '',
        chapters: [
            {
                cid: '',
                chapterUid: 'e4d32d5015e4da3b7fbb1fa',
                '/web/book/chapter/e_0': '',
                '/web/book/chapter/e_1': '',
                '/web/book/chapter/e_2': '',
                '/web/book/chapter/e_3': '',
            },
            {
                chapterUid: 'c81322c012c81e728d9d180',
                '/web/book/chapter/t_0': '',
                '/web/book/chapter/t_1': '',
            }
        ],
        detail: {},
        toc: [],
    },
}
const chapters = [
    {
        bid: '',
        chapters: [
            {
                cid: '',
                chapterUid: 'e4d32d5015e4da3b7fbb1fa',
                '/web/book/chapter/e_0': '',
                '/web/book/chapter/e_1': '',
                '/web/book/chapter/e_2': '',
                '/web/book/chapter/e_3': '',
            },
        ],
    }
]
const tocs = [
    {
        bid: '',
        bookId: '',
        toc: [],
    },
    {
        bid: '',
        bookId: '',
        toc: [],
    }
]
const details = [
    {
        bid: '',
        bookId: '',
        detail: [],
    },
    {
        bid: '',
        bookId: '',
        detail: [],
    }
]



let db

const request = window.indexedDB.open('wereadx', 1);
request.onsuccess = (evt) => {
    db = evt.target.result
}
request.onupgradeneeded = (evt) => {
    db = evt.target.result

    db.createObjectStore("chapters", {keyPath: 'bid'})
    db.createObjectStore("tocs", {keyPath: 'bid'})
    db.createObjectStore("details", {keyPath: 'bid'})
}


// 存储 chapter 数据
function storeBookChapter(bid, cid, type, content) {
    const chapterStore = db.transaction('chapters', 'readwrite').objectStore('chapters')
    chapterStore.get(bid).onsuccess = (evt) => {
        let chapterObj = evt.target.result
        if (!chapterObj) {
            chapterObj = {
                bid: bid,
                chapters: [],
            }
        }
        let chapter = chapterObj.chapters.find(chapter => chapter.cid === cid)
        if (!chapter) {
            chapter = {
                cid: cid,
                chapterUid: '',
            }
            chapterObj.chapters.push(chapter)
        }
        chapter[type] = content

        // 写入store
        chapterStore.put(chapterObj)
    }
}

// 存储 toc 数据
function storeBookToc(bookId, response) {
    const tocStore = db.transaction('tocs', 'readwrite').objectStore('tocs')
    const bid = hash(bookId)
    tocStore.get(bid).onsuccess = (evt) => {
        let tocObj = evt.target.result
        if (!tocObj) {
            tocObj = {
                bid: bid,
                bookId: bookId,
                toc: response.data[0].updated,
            }
            tocStore.put(tocObj)
        }
    }
}

// 存储 detail 数据
function storeBookDetail(bookId, response) {
    const detailStore = db.transaction('details', 'readwrite').objectStore('details')
    const bid = hash(bookId)
    detailStore.get(bid).onsuccess = (evt) => {
        let detailObj = evt.target.result
        if (!detailObj) {
            detailObj = {
                bid: bid,
                bookId: bookId,
                detail: response,
            }
            detailStore.put(detailObj)
        }
    }
}

// 更新页面目录
function updatePageCatalog(bid, bookId) {
    const tocStore = db.transaction('tocs', 'readonly').objectStore('tocs')
    tocStore.get(bid).onsuccess = (evt) => {
        const tocObj = evt.target.result
        if (tocObj && Array.isArray(tocObj.toc) && tocObj.toc.length > 0) {
            // 避免重复更新
            const $ul = document.querySelector('.readerCatalog ul')
            if ($ul.dataset.updated === '1') {
                return
            }
            const $lis = $ul.querySelectorAll('li')
            $lis.forEach($li => {
                // 找到对应的信息
                const targetTitle = $li.textContent
                const target = tocObj.toc.find(item => {
                    if (item.title === targetTitle) {
                        return true
                    }
                    if (Array.isArray(item.anchors)) {
                        return item.anchors.find(_ => _.title === targetTitle)
                    }
                    return false
                })
                if (target) {
                    $li.dataset.chapterIdx = target.chapterIdx
                    $li.dataset.chapterUid = target.chapterUid
                    $li.dataset.cid = hash(target.chapterUid)
                }
            })
            $ul.dataset.updated = '1'
        }
    }
}

// 更新章节下载状态
function updateChapterDownloadState(bid, cid) {
    document.querySelectorAll(`li[data-cid="${cid}"]`).forEach($li => {
        $li.dataset.downloaded = '1'
    })
}

// 从缓存中读取数据更新页面
function initBook(bid) {
    // 初始化 catalog
    updatePageCatalog(bid)

    setTimeout(() => {
        const chapterStore = db.transaction('chapters', 'readonly').objectStore('chapters')
        chapterStore.get(bid).onsuccess = (evt) => {
            let chapterObj = evt.target.result
            if (!chapterObj) {
                return
            }
            chapterObj.chapters.forEach(chapter => {
                updateChapterDownloadState(bid, chapter.cid)
            })
        }
    }, 500)
}

function downloadBook(bid) {
    const chapterStore = db.transaction('chapters', 'readonly').objectStore('chapters')
    chapterStore.get(bid).onsuccess = (evt) => {
        let chapterObj = evt.target.result

        const tocStore = db.transaction('tocs', 'readonly').objectStore('tocs')
        tocStore.get(bid).onsuccess = (evt) => {
            let tocObj = evt.target.result

            const detailStore = db.transaction('details', 'readonly').objectStore('details')
            detailStore.get(bid).onsuccess = (evt) => {
                let detailObj = evt.target.result

                const book = {
                    toc: tocObj,
                    detail: detailObj,
                    chapters: chapterObj,
                }
                const file = new File([JSON.stringify(book)], tocObj.bookId + ".json", {
                    type: "application/json",
                })
                downloadFile(file)
            }
        }
    }
}
