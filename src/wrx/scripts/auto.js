function randomInteger(min, max) {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}
function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
}

let wantStop = false
let isRunning = false
let retry = 0

const selectorMap = {
    prev: 'button.readerHeaderButton',
    next: 'button.readerFooter_button',
}

// 在页面添加一个按钮
document.addEventListener('DOMContentLoaded', () => {
    const span = document.createElement('span')
    span.textContent = '自动阅读: 关'
    span.id = '__wrx_auto_read__'
    span.style.position = 'fixed'
    span.style.top = '20px'
    span.style.right = '20px'
    span.style.fontSize = '16px'
    span.style.fontWeight = 'bold'
    span.style.background = '#e9e9e99c'
    span.style.color = '#a32727'
    span.style.padding = '.5em .75em'
    span.style.borderRadius = '5px'
    span.style.zIndex = '9999'
    document.body.appendChild(span)
})

function setAutoRunningStatus(open) {
    const span = document.querySelector('#__wrx_auto_read__')
    span.textContent = `自动阅读: ${open ? '开' : '关'}`
    if (open) {
        span.style.background = 'green'
        span.style.color = 'white'
    } else {
        span.style.background = '#e9e9e99c'
        span.style.color = '#a32727'
    }
}

async function run(direction, interval, isScroll) {
    const adjustInterval = randomInteger(interval * 1000, (interval + 1) * 1000 + 500)

    isRunning = true
    setAutoRunningStatus(isRunning)

    if (wantStop) {
        isRunning = false
        setAutoRunningStatus(isRunning)
        return
    }

    let btn = document.querySelector(selectorMap[direction])
    if (!btn) {
        // 按钮不存在，可能还没有加载出来
        if (!document.querySelector('.renderTargetContainer')) {
            if (retry <= 6) {
                retry++
                console.debug('按钮没有出现，5秒后重试')
                setTimeout(() => {
                    run(direction, interval, isScroll)
                }, 5000)
            } else {
                console.warn('未找到按钮，超时结束')
                isRunning = false
                setAutoRunningStatus(isRunning)
            }
        } else {
            console.debug(`已经翻到${direction === 'prev' ? '第' : '最后'}一页了，正常结束`)
            isRunning = false
            setAutoRunningStatus(isRunning)
        }
        return
    }

    // 按钮出现，重置重试次数
    retry = 0
    if (isScroll) {
        await sleep(1000)
        if (direction === 'prev') {
            window.scroll({top: 0, behavior: 'smooth'})
        } else {
            window.scroll({top: 100000, behavior: 'smooth'})
        }
        await sleep(1500)
    }
    console.debug('开始翻页')
    btn.click()
    setTimeout(() => {
        run(direction, interval, isScroll)
    }, adjustInterval)
}

chrome.runtime.onMessage.addListener(async (msg) => {
    console.debug(msg)
    const {type, args = {}} = msg
    const {direction, interval, isScroll} = args

    switch (type) {
        case 'start':
            if (isRunning) {
                // 避免重复执行
                console.debug('正在运行中，不需要重复执行')
                return
            }
            wantStop = false
            await run(direction, interval, isScroll)
            break
        case 'stop':
            wantStop = true
            break
    }
})
