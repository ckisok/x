const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const {rimrafSync} = require('rimraf')
const JavaScriptObfuscator = require('javascript-obfuscator')
const zl = require('zip-lib')

const sourceDir = '../src/xrw/'
const outputDir = '../build/xrw/'

function resolveSourceFile(file) {
    return path.resolve(__dirname, sourceDir, file)
}
function resolveOutputFile(file) {
    return path.resolve(__dirname, outputDir, file)
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

function copyAndObfuscateFile(src, dest) {
    const source = fs.readFileSync(resolveSourceFile(src)).toString('utf-8')
    fs.writeFileSync(resolveOutputFile(dest), obfuscate(source), {encoding: 'utf-8'})
}
function copyDirectory(src, dest) {
    fse.copySync(resolveSourceFile(src), resolveOutputFile(dest), {override: true})
}


function prepare() {
    rimrafSync(resolveOutputFile(''))
    fs.mkdirSync(resolveOutputFile('weread'), {recursive: true})
}

function build() {
    prepare();

    ;[
        'assets',
        'epub',
        'lib',
        'index.html',
        'manifest.json',
        'sw.js',
        'utils.js',
    ].forEach(item => copyDirectory(item, item))

    // 混淆核心文件
    ;[
        'weread/app.js',
        'weread/m278.js',
        'weread/mutation.js',
        'weread/utils.js',
        'index.js',
    ].forEach(item => copyAndObfuscateFile(item, item))
}

build()

zl.archiveFolder(resolveOutputFile('.'), resolveOutputFile('../xrw.zip')).then(() => {
    // rimrafSync(resolveOutputFile('.'))
})
