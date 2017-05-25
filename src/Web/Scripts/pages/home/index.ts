import {onready} from 'init';
import {delay} from 'util';

console.log('Loading home/index');

onready(async () => {

    console.log('Waiting a bit');

    await delay(1000);

    console.log('Ready for action');

});