
console.log('Loading init');

const _handlers: (() => void)[] = [];
function completed() {
    document.removeEventListener('DOMContentLoaded', completed);
    window.removeEventListener('load', completed);
    while (_handlers.length) {
        var handler = _handlers.pop();
        handler();
    }
}

document.addEventListener('DOMContentLoaded', completed);
window.addEventListener('load', completed);

export function onready(handler: () => void) {

    console.log('onready');

    // Defer execution while the document is loading
    if (document.readyState !== 'loading') {
        handler();
    }
    else {
        _handlers.push(handler);
    }
}