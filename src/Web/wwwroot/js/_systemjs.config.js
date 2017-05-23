var createSystemJsConfig = (function (global) {

    return function (baseURL) {

        // map tells the System loader where to look for things
        var map = {
            //'app':      'app', // 'dist',
            //'@angular': 'node_modules/@angular',
            //'rxjs':     'node_modules/rxjs',  
        };

        // packages tells the System loader how to load when no filename and/or no extension
        var packages = {
            'rxjs': { 
                defaultExtension: 'js'
            },
            
            // Rules for loading application scripts
            '/': { 
                defaultExtension: 'js',
            }
        };

        var paths = {
            // Application 
            //'pages': '/js/generated/pages',

            // Libraries
            "jquery":    "/lib/jquery/jquery.js",
            "bootstrap": "/lib/bootstrap/bootstrap.js",
            "react":     "/lib/react/react.js",
            "react-dom": "/lib/react/react-dom.js",

            // Typescript support library
            "tslib":     "/lib/tslib/tslib.js"
        };

        /*
        // Individual files (~300 requests):
        function packIndex(pkgName) {
            packages['@angular/' + pkgName] = { main: 'index.js', defaultExtension: 'js' };
        }

        // Bundled (~40 requests):
        function packUmd(pkgName) {
            packages['@angular/' + pkgName] = { main: '/bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
        }
        
        // Add package entries for angular packages
        var ngPackageNames = [
            'common',
            'compiler',
            'core',
            'forms',
            'http',
            'platform-browser',
            'platform-browser-dynamic',
            'router',
            'upgrade',
        ];
        // Most environments should use UMD; some (Karma) need the individual index files
        ngPackageNames.forEach(System.packageWithIndex ? packIndex : packUmd);
        */
    
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