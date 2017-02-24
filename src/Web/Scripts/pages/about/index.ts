import {onready} from 'init';
import {foo, delay} from 'util';

console.log('Loading about/index');

onready(async () => {

    foo();
    console.log('Ready for action');
    foo();

    await delay(100);

    console.log('Waited a bit')
    foo();
});