(() => {
    function randomInteger(min, max) {
        const rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
    function sleep(duration) {
        return new Promise(resolve => setTimeout(resolve, duration))
    }
    let isStop = false
    let retry = 0
    async function run(cls, duration, scroll = false) {
        let btn = document.querySelector('.' + cls)
        if (!btn) {
            if (retry <= 6) {
                retry++
                console.debug('按钮没有出现，5秒后重试')
                setTimeout(() => {
                    run(cls, duration, scroll)
                }, 5000)
            } else {
                console.warn('未找到按钮，超时结束')
            }
        } else {
            // 重置重试次数
            retry = 0
            if (!isStop) {
                if (scroll) {
                    window.scroll({top: 100000, behavior: 'smooth'})
                    await sleep(1500)
                    window.scroll({top: 0, behavior: 'smooth'})
                    await sleep(1500)
                }
                console.debug('开始翻页')
                btn.click()
                setTimeout(() => {
                    run(cls, duration, scroll)
                }, randomInteger(duration * 1000, (duration + 1) * 1000 + 500))
            }
        }
    }
    chrome.runtime.onMessage.addListener(async (msg) => {
        console.debug(msg)
        const {type, args} = msg
        switch (type) {
            case 'start':
                isStop = false
                await run(args.dir, args.duration, args.scroll)
                break
            case 'stop':
                isStop = true
                break
        }
    });
})();
