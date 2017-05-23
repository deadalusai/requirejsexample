var createSystemJsConfig = (function (global) {
    return function (baseURL) {

        // map tells the System loader where to look for things
        var map = {
            
        };

        // packages tells the System loader how to load when no filename and/or no extension
        var packages = {
            // Rules for loading application scripts
            '/': { 
                defaultExtension: 'js',
            }
        };

        var paths = {
            // Libraries
            "jquery":    "/lib/jquery/jquery.js",
            "bootstrap": "/lib/bootstrap/bootstrap.js",
            "react":     "/lib/react/react.js",
            "react-dom": "/lib/react/react-dom.js",
            "tslib":     "/lib/tslib/tslib.js"
        };
    
        return {
            baseURL: baseURL,
            map: map,
            packages: packages,
            paths: paths
        }
    };
})(this);

if (typeof exports === 'object') {
    exports.createSystemJsConfig = createSystemJsConfig;
}