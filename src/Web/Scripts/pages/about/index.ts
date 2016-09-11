import {onready} from 'init';
import {foo} from 'util';

console.log('Loading about/index');

onready(() => {

    console.log(GLOBAL_VARIABLE);

    foo();
    console.log('Ready for action');
    foo();

});