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

// Scan for ".ts" files in the ./Scripts directory to find all possible page entry points,
// then convert file paths into root-relative import paths.
// E.g. `C:\Path\To\Web\Scripts\pages\home\index.tsx` -> "pages/home/index"
var entryPoints =
    walk(ROOT_TS_PATH, (subdir, file) => TS_FILE.test(file) && !TYPINGS_FILE.test(file))
        .map(file => {
            var idx = file.indexOf(ROOT_TS_PATH);
            if (idx !== 0) {
                throw new Error(`Expected path ${file} to be rooted in ${ROOT_TS_PATH}`);
            }
            // Trim leading ROOT_TS_PATH and file extension, ensure "/" path seperators
            var importpath = file.substring(ROOT_TS_PATH.length + 1, file.length - path.extname(file).length).replace(/\\/g, '/');
            console.log(`Found '${importpath}'`)
            return importpath;
        });

console.log('Starting optimization');

// NOTE: SystemJS loads compiled JavaScript directly
var sourceRootPath = './wwwroot/js';
var systemJsConfigPath = './wwwroot/_jspm.config.js';

var builder = new Builder(sourceRootPath, systemJsConfigPath);

// Trace each potential entrypoint module to build its dependency tree.
Promise.all(entryPoints.map(moduleName => builder.trace(moduleName)))
    // Collapse all dependency trees into a single tree
    .then(trees => trees.reduce((left, right) => builder.addTrees(left, right)))
    // Re-write app module names to remove .js extension added by trace.
    .then(tree => {
        /* 
            When the SystemJS-Builder trace function locates our entrypoint modules
            it appends '.js' to the module name (as that is the name of the file on disk).

            We need to trim this extension from the module names so that we can load the modules
            directly using `System.import('module/name')` in the browser, as it works in Dev mode.

            TODO: Can we use _jspm.config.js to make this mapping explicit?
            Not sure how to do so without require ALL loose app modules to be added to the config explicitly.
        */
        entryPoints.forEach(moduleName => {
            var jsModuleName = `${moduleName}.js`;
            console.log(`Patching module name: ${jsModuleName} -> ${moduleName}`);
            var mod = tree[jsModuleName];
            if (!mod) {
                throw new Error(`Unable to find expected module name ${jsModuleName} in module tree!`);
            }
            // Rename the module in the tree
            // NOTE: This appears to be all that is needed. No need to change the key in the `tree` object/dictionary.
            mod.name = moduleName;
        });
        return tree;
    })
    // And bundle into a single file
    // TODO: Split into app, dependencies files?
    .then(tree => {
        var outputFile = './wwwroot/js/_main.js';
        var config = {
            minify: true
        };
        return builder.bundle(tree, outputFile, config);
    })
    .then(result => {
        console.log('Build complete.');
    })
    .catch(err => {
        console.error('Build failed.');
        console.error(err);
    });