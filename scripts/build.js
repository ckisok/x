const path = require('path')
const fs = require('fs')
const {rimrafSync} = require('rimraf')
const JavaScriptObfuscator = require('javascript-obfuscator')

const sourceDir = '../src/crx/'

function resolveSourceFile(file) {
    return path.resolve(__dirname, sourceDir, file)
}

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
    const xhrSource = fs.readFileSync(resolveSourceFile('lib/xhr-fetch.js')).toString('utf-8')
    fs.writeFileSync(path.resolve(__dirname, '../build/lib/x.js'), obfuscate(xhrSource), {encoding: 'utf-8'})
}

function handleContentFile() {
    const utilsSource = fs.readFileSync(resolveSourceFile('lib/utils.js')).toString('utf-8')
    const storeSource = fs.readFileSync(resolveSourceFile('lib/store.js')).toString('utf-8')
    let contentSource = fs.readFileSync(resolveSourceFile('lib/content.js')).toString('utf-8')
    // 改写 xhr-fetch.js 的引入路径
    contentSource = contentSource.replace('lib/xhr-fetch.js', 'lib/x.js')
    const source = `${utilsSource};${storeSource};${contentSource}`
    fs.writeFileSync(path.resolve(__dirname, '../build/lib/content.js'), obfuscate(source), {encoding: 'utf-8'})
}

function copyFile(src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src, 'utf-8'), 'utf-8')
}

function handleManifestFile() {
    copyFile(resolveSourceFile('lib/crypto-js@4.2.0.min.js'), path.resolve(__dirname, '../build/lib/crypto-js@4.2.0.min.js'))
    copyFile(resolveSourceFile( 'toc.css'), path.resolve(__dirname, '../build/toc.css'))

    const manifest = JSON.parse(fs.readFileSync(resolveSourceFile('manifest.json'), 'utf-8'))
    manifest['web_accessible_resources'][0]['resources'][0] = 'lib/x.js'
    manifest['content_scripts'][0]['js'][1] = 'lib/content.js'
    manifest['content_scripts'][0]['js'].length = 2
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
