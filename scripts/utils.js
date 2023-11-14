const JavaScriptObfuscator = require("javascript-obfuscator");

function obfuscate(source) {
    const options = {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        numbersToExpressions: true,
        renameGlobals: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1,
    }
    return JavaScriptObfuscator.obfuscate(source, options).getObfuscatedCode()
}

module.exports = {
    obfuscate
}
