(() => {
    function randomInteger(min, max) {
        const rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
    function sleep(duration) {
        return new Promise(resolve => setTimeout(resolve, duration))
    }
    let isStop = false
    async function run(cls, duration, scroll = false) {
        let btn
        while(btn = document.querySelector('.' + cls)) {
            if (isStop) {
                break
            }
            if (scroll) {
                window.scroll({top: 100000, behavior: 'smooth'})
                await sleep(1500)
                window.scroll({top: 0, behavior: 'smooth'})
                await sleep(1500)
            }
            console.debug('开始翻页')
            btn.click()
            await sleep(randomInteger(duration * 1000, (duration + 1) * 1000 + 500))
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
