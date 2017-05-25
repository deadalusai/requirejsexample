// Build script for combining and minifying generated systemjs scripts
const path = require('path');
const fs = require('fs');
const Builder = require('jspm').Builder;


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
 * Trims the file extension from the given file path string.
 */
function trimExtension(filePath) {
    return filePath.substring(0, filePath.length - path.extname(filePath).length);
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

console.log('Scanning for app modules');

const TS_FILE = /\.tsx?$/i;
const TYPINGS_FILE = /\.d\.ts$/i;

const ROOT_TS_PATH = rel('./Scripts');

// Scan for ".ts" files to include all possible page entry points, then
// convert file paths into root-relative import paths.
// E.g. `C:\Path\To\Web\Scripts\pages\home\index.js` -> "pages/home/index"
var entryPoints =
    walk(ROOT_TS_PATH, (subdir, file) => TS_FILE.test(file) && !TYPINGS_FILE.test(file))
        .map(file => {
            var idx = file.indexOf(ROOT_TS_PATH);
            if (idx !== 0) {
                throw new Error(`Expected path ${file} to be rooted in ${ROOT_TS_PATH}`);
            }
            // Trim leading ROOT_TS_PATH and extension, switch to web path seperators
            var importpath = file.substring(ROOT_TS_PATH.length + 1, file.length - path.extname(file).length).replace(/\\/g, '/');
            console.log(`Found '${importpath}'`)
            return importpath;
        });

console.log('Starting optimization');

var builder = new Builder('./wwwroot/js', './wwwroot/_jspm.config.js');

// Trace the entrypoints individually and then patch their names so
// that we can load them from the web page
Promise.all(entryPoints.map(file => builder.trace(file)))
    // Collapse all modules into a single tree
    .then(trees => trees.reduce((left, right) => builder.addTrees(left, right)))
    // HACK HACK: Re-write module names to remove .js extension added by trace.
    .then(tree => {
        var newTree = {};
        Object.keys(tree).forEach(name => {
            var mod = tree[name];
            // Only patch packages from our build
            if (mod.path.indexOf('jspm_packages') === 0) {
                newTree[name] = mod;
                return;
            }
            var newName = trimExtension(mod.name);
            console.log(`Patching module name: ${name} -> ${newName}`);
            mod.name = newName;
            newTree[newName] = mod;
        });
        return newTree;
    })
    // And bundle into a single file
    // TODO: Split into app, dependencies files?
    .then(tree => builder.bundle(tree, './wwwroot/js/_main.js'))
    .then(result => {
        console.log('Build complete.');
    })
    .catch(err => {
        console.error('Build failed.');
        console.error(err);
    });