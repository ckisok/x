const path = require('path')
const fs = require('fs')
const {rimrafSync} = require('rimraf')
const JavaScriptObfuscator = require('javascript-obfuscator')

function obfuscate(source) {
    const options = {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        debugProtection: true,
        debugProtectionInterval: 0,
        numbersToExpressions: true,
        renameGlobals: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1,
    }
    return JavaScriptObfuscator.obfuscate(source, options).getObfuscatedCode()
}

function handleXhrFetchFile() {
    const xhrSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/xhr-fetch.js')).toString('utf-8')
    fs.writeFileSync(path.resolve(__dirname, '../build/lib/x.js'), obfuscate(xhrSource), {encoding: 'utf-8'})
}

function handleContentFile() {
    const utilsSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/utils.js')).toString('utf-8')
    const storeSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/store.js')).toString('utf-8')
    const contentSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/content.js')).toString('utf-8')
    const source = `${utilsSource};${storeSource};${contentSource}`
    fs.writeFileSync(path.resolve(__dirname, '../build/lib/content.js'), obfuscate(source), {encoding: 'utf-8'})
}

function copyFile(src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src, 'utf-8'), 'utf-8')
}

function handleManifestFile() {
    copyFile(path.resolve(__dirname, '../src/lib/base64js.min.js'), path.resolve(__dirname, '../build/lib/base64js.min.js'))
    copyFile(path.resolve(__dirname, '../src/lib/crypto-js@4.2.0.min.js'), path.resolve(__dirname, '../build/lib/crypto-js@4.2.0.min.js'))
    copyFile(path.resolve(__dirname, '../src/toc.css'), path.resolve(__dirname, '../build/toc.css'))

    const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/manifest.json'), 'utf-8'))
    manifest['web_accessible_resources'][0]['resources'][0] = 'lib/x.js'
    manifest['content_scripts'][0]['js'][2] = 'lib/content.js'
    manifest['content_scripts'][0]['js'].length = 3
    fs.writeFileSync(path.resolve(__dirname, '../build/manifest.json'), JSON.stringify(manifest), 'utf-8')
}

function prepare() {
    rimrafSync(path.resolve(__dirname, '../build'))
    fs.mkdirSync(path.resolve(__dirname, '../build/lib'), {recursive: true})
}

function build() {
    prepare()

    handleXhrFetchFile()
    handleContentFile()
    handleManifestFile()
}

build()
