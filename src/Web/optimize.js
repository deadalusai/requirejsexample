// Build script for combining and minifying generated requirejs scripts
var path = require('path');
var fs = require('fs');
var process = require('process');

/** Given a file-relative path, returns an absolute path */
function rel(p) {
    return path.resolve(__dirname, p);
}

/** Recursively walk the given path, finding files which match the given pattern */
function walk(dir, pattern) {
    var _files = [], _dirs = [dir];

    while (_dirs.length) {
        var subdir = _dirs.pop();
        fs.readdirSync(subdir).forEach(file => {
            var fullpath = path.join(subdir, file);
            if (fs.statSync(fullpath).isDirectory()) {
                // Recurse into subdirectory
                _dirs.push(fullpath);
            }
            else if (pattern.test(file)) {
                _files.push(fullpath);
            }
        });
    }

    return _files;
}

const ROOT_TS_PATH = rel('./Scripts');
const ROOT_JS_PATH = rel('./wwwroot/js/generated');

console.log('Scanning for app modules');

// Scan for ".ts" files to include all possible page entry points, then
// convert file paths into ROOT_JS_PATH-relative import paths.
// E.g. `C:\Path\To\Web\Scripts\pages\home\index.js` -> "pages/home/index"
var entryPoints = walk(ROOT_TS_PATH, /(?!d\.)\.ts$/i).map(file => {
    var idx = file.indexOf(ROOT_TS_PATH);
    if (idx !== 0) {
        console.error(`Expected path ${file} to be rooted in ${ROOT_TS_PATH}`);
        process.exit(1);
    }
    // Trim leading ROOT_PATH and trailing ".ts", switch to web path seperators
    var importpath = file.substring(ROOT_TS_PATH.length + 1, file.length - 3).replace(/\\/g, '/');

    console.log(`Found '${importpath}'`)

    return importpath;
});

var config = {
    baseUrl: ROOT_JS_PATH,
    include: entryPoints,

    // Note: Almond provides a bare-bones AMD module loader for use with optimized requirejs modules
    // See: https://github.com/requirejs/almond
    name: rel('./node_modules/almond/almond.js'),
    out: rel('./wwwroot/js/generated/main-built.js')
};

// Copy in external config
var extern = require(rel('./wwwroot/js/_require.config.js'));

Object.keys(extern.config).forEach(prop => {
    if (prop in config) {
        console.error(`Attempted to overwrite config property ${prop}!`);
        process.exit(1);
    }
    config[prop] = extern.config[prop];
});

console.log('Starting optimization step');

require('requirejs').optimize(
    config,
    buildResponse => {
        console.log(buildResponse);
        process.exit(0);
    },
    err => {
        console.error(err.message);
        process.exit(1);
    }
);