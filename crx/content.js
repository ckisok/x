// 注入自定义的 xhr 和 fetch
const s = document.createElement('script');
s.src = chrome.runtime.getURL('lib/xhr-fetch.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


// 在页面添加一个按钮
document.addEventListener('DOMContentLoaded', () => {
    const parts = location.pathname.split('/')
    const bid = parts[parts.length - 1].split('k')[0]

    const btn = document.createElement('button')
    btn.textContent = '下载已缓存数据'
    btn.style.position = 'fixed'
    btn.style.bottom = '20px'
    btn.style.right = '20px'
    btn.style.fontSize = '16px'
    btn.style.background = 'green'
    btn.style.color = 'white'
    btn.style.padding = '.5em .75em'
    btn.style.borderRadius = '5px'
    btn.style.zIndex = '9999'
    btn.addEventListener('click', () => {
        downloadBook(bid)
    })
    document.body.appendChild(btn)

    initBook(bid)
})



// 处理 api 数据
function handleApiData(data) {
    let bookId

    const {api, search, request, response} = data
    switch (api) {
        case '/web/book/chapter/e_0':
        case '/web/book/chapter/e_1':
        case '/web/book/chapter/e_2':
        case '/web/book/chapter/e_3':
        case '/web/book/chapter/t_0':
        case '/web/book/chapter/t_1':
            // 保存 chapter 数据
            const {b, c} = JSON.parse(request)
            storeBookChapter(b, c, api, response)

            setTimeout(() => {
                updateChapterDownloadState(b, c)
            }, 200)
            break
        case '/web/book/publicinfos':
            bookId = JSON.parse(request).bookIds[0]
            storeBookDetail(bookId, JSON.parse(response))
            break
        case '/web/book/info':
            bookId = new URLSearchParams(search).get('bookId')
            storeBookDetail(bookId, JSON.parse(response))
            break
        case '/web/book/publicchapterInfos':
        case '/web/book/chapterInfos':
            bookId = JSON.parse(request).bookIds[0]
            storeBookToc(bookId, JSON.parse(response))

            // 拿到目录数据之后，更新当前页面的目录 dom 上方便后续处理
            setTimeout(() => {
                updatePageCatalog(hash(bookId), bookId)
            }, 500)
            break
    }
}

window.addEventListener('message', ({data}) => {
    if (data && data.api) {
        handleApiData(data)
    }
});
