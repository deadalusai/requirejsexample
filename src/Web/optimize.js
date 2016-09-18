// Build script for combining and minifying generated requirejs scripts
const path = require('path');
const fs = require('fs');
const process = require('process');

/** Given a file-relative path, returns an absolute path */
function rel(p) {
    return path.resolve(__dirname, p);
}

/**
 * Recursively walks the given path and returns all files found.
 * Optionally provide a `matcher` function to filter the files found based on the directory path or filename.
 *
 * @param dir string The directory to walk
 * @param matcher ((subdir, file) => boolean) A function to match files to include (optional)
 */
function walk(dir, matcher) {
    var _files = [], _dirs = [dir];

    while (_dirs.length) {
        var subdir = _dirs.pop();
        fs.readdirSync(subdir).forEach(file => {
            var fullpath = path.join(subdir, file);
            if (fs.statSync(fullpath).isDirectory()) {
                // Recurse into subdirectory
                _dirs.push(fullpath);
            }
            else if (!matcher || matcher(subdir, file)) {
                _files.push(fullpath);
            }
        });
    }

    return _files;
}

/**
 * Given two strings, determines if {a} ends with {b}
 * @param a haystack
 * @param b needle
 */
function endsWith(a, b) {
    var idx = a.lastIndexOf(b);
    return idx === (a.length - b.length);
}

const ROOT_TS_PATH = rel('./Scripts');
const ROOT_JS_PATH = rel('./wwwroot/js/generated');

console.log('Scanning for app modules');

const TS_FILE = /\.tsx?$/i;
const TYPINGS_FILE = /\.d\.ts$/i;

// Scan for ".ts" files to include all possible page entry points, then
// convert file paths into ROOT_JS_PATH-relative import paths.
// E.g. `C:\Path\To\Web\Scripts\pages\home\index.js` -> "pages/home/index"
var entryPoints =
    walk(ROOT_TS_PATH, (subdir, file) => TS_FILE.test(file) && !TYPINGS_FILE.test(file))
        .map(file => {
            var idx = file.indexOf(ROOT_TS_PATH);
            if (idx !== 0) {
                console.error(`Expected path ${file} to be rooted in ${ROOT_TS_PATH}`);
                process.exit(1);
            }
            // Trim leading ROOT_TS_PATH and extension, switch to web path seperators
            var importpath = file.substring(ROOT_TS_PATH.length + 1, file.length - path.extname(file).length).replace(/\\/g, '/');
            console.log(`Found '${importpath}'`)
            return importpath;
        });

var config = {
    baseUrl: ROOT_JS_PATH,
    include: entryPoints,

    // Note: Almond provides a bare-bones AMD module loader for use with optimized requirejs modules
    // See: https://github.com/requirejs/almond
    name: rel('./node_modules/almond/almond.js'),
    out: rel('./wwwroot/js/generated/main-built.js'),
    // Note: License comments making up a significant portion of the generated file's bytecount
    preserveLicenseComments: false
};

console.log('Loading configuration');

// Copy in external config
var extern = require(rel('./wwwroot/js/_require.config.js'));

Object.keys(extern.config).forEach(prop => {
    if (prop in config) {
        console.error(`Attempted to overwrite config property ${prop}!`);
        process.exit(1);
    }
    config[prop] = extern.config[prop];
});

// Hack - scan for and use minified versions of libraries where available.
// This is to support libraries like React which ship with a .min version
// intended for production use, which excludes debug messages.
Object.keys(config.paths).forEach(mapping => {
    var libpath = config.paths[mapping];
    if (typeof libpath !== 'string') {
        console.warn(`Skipping check of ${mapping} (expected string, found ${typeof libpath})`);
        return;
    }
    var dir = path.dirname(libpath);
    var libname = path.basename(libpath);
    if (endsWith(libname, '.js')) {
        console.error(`.js extension should be omitted for ${mapping}`);
        process.exit(1);
    }
    // Not already using the min version?
    if (!endsWith(libname, '.min')) {
        // Does a min version exist on disk?
        var newlibpath = path.join(dir, `${libname}.min`);
        if (fs.existsSync(path.join(ROOT_JS_PATH, `${newlibpath}.js`))) {
            console.warn(`Using ${mapping} .min variation!`);
            libpath = newlibpath;
        }
    }
    console.log(`Using ${mapping}: ${libpath}`);
    config.paths[mapping] = libpath;
});

console.log('Starting optimization');

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