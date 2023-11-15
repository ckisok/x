const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const {rimrafSync} = require('rimraf')
const {obfuscate} = require('./utils')
const zl = require('zip-lib')

const sourceDir = '../src/xrw/'
const outputDir = '../build/xrw/'

function resolveSourceFile(file) {
    return path.resolve(__dirname, sourceDir, file)
}
function resolveOutputFile(file) {
    return path.resolve(__dirname, outputDir, file)
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
        'chapter_uid_db.js',
        'index.html',
        'manifest.json',
        'sw.js',
        'utils.js',
    ].forEach(item => copyDirectory(item, item))

    // 混淆核心文件
    ;[
        'weread/8.js',
        'weread/__init__.js',
        'weread/m278.js',
        'weread/utils.js',
        'index.js',
    ].forEach(item => copyAndObfuscateFile(item, item))
}

build()

function readVersion() {
    const manifest = JSON.parse(fs.readFileSync(resolveSourceFile('manifest.json'), 'utf-8'))
    return manifest.version
}

zl.archiveFolder(resolveOutputFile('.'), resolveOutputFile(`../xrw-${readVersion()}.zip`)).then(() => {
    // rimrafSync(resolveOutputFile('.'))
})
