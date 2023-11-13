

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#start').addEventListener('click', async (evt) => {
        evt.preventDefault()

        const formData = new FormData(document.querySelector('form'))
        const dir = formData.get('direction')
        let duration = parseInt(formData.get('duration').toString())
        if (Number.isNaN(duration)) {
            duration = 4
        }
        const isScroll = formData.get('isScroll') === 'on'

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "start",
                args: {
                    dir: dir,
                    duration: duration,
                    scroll: isScroll,
                },
            })
        });
    })
    document.querySelector('#stop').addEventListener('click', (evt) => {
        evt.preventDefault()

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "stop",
            })
        });
    })
})
