chrome.runtime.onMessage.addListener(({url}, sender, sendResponse) => {
    download(url, sendResponse)
    return true
})

async function download(url, sendResponse) {
    const resp = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow',
    })
    const blob = await resp.blob()
    const base64 = await convertBlobToBase64(blob)
    sendResponse(base64)
}

function convertBlobToBase64(blob) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
            const base64data = reader.result
            resolve(base64data)
        }
    })
}
