// See:
var require = {
    // Note: baseUrl set at optimization stage (release) or in _Layout (dev)
    // baseUrl = ./generated
    paths: {
        // Map library names to their physical location relative to baseUrl
        "jquery":    "../../lib/jquery/jquery",
        "bootstrap": "../../lib/bootstrap/bootstrap",

        // Note: You may wish to switch to the non-min versions at dev time
        "react":     "../../lib/react/react.min",
        "react-dom": "../../lib/react/react-dom.min"
    }
};
if (typeof exports === 'object') {
    exports.config = require;
}