// See:
var require = {
    // Note: baseUrl set at optimization stage (release) or in _Layout (dev)
    // baseUrl = ./generated
    paths: {
        // Map library names to their physical location relative to baseUrl
        "jquery":    "../../lib/jquery/jquery",
        "bootstrap": "../../lib/bootstrap/bootstrap",
        "react":     "../../lib/react/react",
        "react-dom": "../../lib/react/react-dom",
        // Typescript support library
        "tslib":     "../../lib/tslib/tslib"
    }
};
if (typeof exports === 'object') {
    exports.config = require;
}