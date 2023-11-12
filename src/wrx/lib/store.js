(() => {
    let db

    const request = window.indexedDB.open('wrx', 1);
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
        // console.debug('[wrx] storeBookChapter: ', bid, cid, type)

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
                    version: new Date().getTime(),
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
        // console.debug('[wrx] storeBookToc: ', bookId)

        const tocStore = db.transaction('tocs', 'readwrite').objectStore('tocs')
        const bid = window.utils.hash(bookId)
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
        // console.debug('[wrx] storeBookDetail: ', bookId)

        const detailStore = db.transaction('details', 'readwrite').objectStore('details')
        const bid = window.utils.hash(bookId)
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
    function updatePageCatalog(bid) {
        // console.debug('[wrx] updatePageCatalog: ', bid)

        const tocStore = db.transaction('tocs', 'readonly').objectStore('tocs')
        tocStore.get(bid).onsuccess = (evt) => {
            const tocObj = evt.target.result
            // console.debug('[wrx] tocObj: ', tocObj)
            if (tocObj && Array.isArray(tocObj.toc) && tocObj.toc.length > 0) {
                // 避免重复更新
                const $ul = document.querySelector('.readerCatalog ul')
                if ($ul.dataset.updated === '1') {
                    return
                }

                const $lis = $ul.querySelectorAll('li')
                // console.debug('[wrx] update catalog', $lis.length)
                $lis.forEach($li => {
                    // 找到对应的信息
                    // txt书籍需要去掉标题开头的 第*章
                    const re = /^第\d+?章\s/
                    const targetTitle = $li.textContent.replace(re, '')

                    const target = tocObj.toc.find(item => {
                        if (item.title.replace(re, '') === targetTitle) {
                            return true
                        }
                        if (Array.isArray(item.anchors)) {
                            return item.anchors.find(_ => _.title.replace(re, '') === targetTitle)
                        }
                        return false
                    })
                    // console.debug('[wrx] ', target)
                    if (target) {
                        $li.dataset.chapterIdx = target.chapterIdx
                        $li.dataset.chapterUid = target.chapterUid
                        $li.dataset.cid = window.utils.hash(target.chapterUid)
                    }
                })
                $ul.dataset.updated = '1'
            }
        }
    }

    /**
     * 标记对应章节的下载状态
     * @param bid bookId
     * @param cid chapterUId
     */
    function markChapterDownloaded(bid, cid) {
        // console.debug('[wrx] updateChapterDownloadState: ', bid, cid)

        document.querySelectorAll(`li[data-cid="${cid}"]`).forEach($li => {
            $li.dataset.downloaded = '1'
        })
    }

    // 从缓存中读取数据更新到页面
    function initBookState(bid) {
        // console.debug('[wrx] initBook: ', bid)

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
                    markChapterDownloaded(bid, chapter.cid)
                })
            }
        }, 500)
    }

    // 导出缓存中的书籍数据
    function exportBookData(bid) {
        // console.debug('[wrx] exportBookData: ', bid)

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
                    window.utils.downloadFile(file)
                }
            }
        }
    }

    window.store = {
        storeBookChapter: storeBookChapter,
        storeBookToc: storeBookToc,
        storeBookDetail: storeBookDetail,
        updatePageCatalog: updatePageCatalog,
        markChapterDownloaded: markChapterDownloaded,
        initBookState: initBookState,
        exportBookData: exportBookData,
    }
})()
