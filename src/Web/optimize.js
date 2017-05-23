// Build script for combining and minifying generated systemjs scripts
const path = require('path');
const fs = require('fs');
const process = require('process');

/** Given a file-relative path, returns an absolute path */
function rel(p) {
    return path.resolve(__dirname, p);
}

console.log('Loading configuration');

// Copy in external config
var factory = require(rel('./wwwroot/js/_systemjs.config.js'));

var config = factory.createSystemJsConfig('./wwwroot/js/generated');

// HACK HACK: Re-write library paths to be file-relative
var libMatch = /^\/lib\//;
Object.keys(config.paths).forEach(function (key) {
    var path = config.paths[key];
    if (libMatch.test(path)) {
        var newPath = path.replace(libMatch, './wwwroot/lib/');
        console.log('Re-mapping library path: ' + key + ' to ' + newPath);
        config.paths[key] = newPath;
    }
});

console.log('Starting optimization');

var Builder = require('systemjs-builder');
new Builder(config)
    .bundle(
        './wwwroot/js/generated/**/*',
        './wwwroot/main-built.js'
    )
    .then(function (result) {
        console.log('Build complete.');
    })
    .catch(function (err) {
        console.log('Build failed.');
        console.log(err);
    });