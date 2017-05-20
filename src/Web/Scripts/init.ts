
console.log('Loading init');

const _handlers: (() => void)[] = [];
var _ready = false;

function completed() {
    _ready = true;
    document.removeEventListener('DOMContentLoaded', completed);
    window.removeEventListener('load', completed);
    while (_handlers.length) {
        var handler = _handlers.pop();
        handler();
    }
}

// Document already ready?
if (document.readyState === 'complete') {
    _ready = true;
}
else {
    document.addEventListener('DOMContentLoaded', completed);
    window.addEventListener('load', completed);
}

export function onready(handler: () => void) {

    console.log('onready');

    // Defer execution while the document is loading
    if (_ready) {
        handler();
    }
    else {
        _handlers.push(handler);
    }
}