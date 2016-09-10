import {onready} from 'init';
import {foo} from 'util';

console.log('Loading about/index');

onready(() => {

    foo();
    console.log('Ready for action');
    foo();

});