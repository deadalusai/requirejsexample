import * as $ from 'jquery';

export function onready(handler: () => void) {

    $(document).ready(() => handler());
}