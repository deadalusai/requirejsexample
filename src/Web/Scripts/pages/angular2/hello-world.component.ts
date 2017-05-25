import { Component } from '@angular/core';

@Component({
    selector: 'hello-world',
    template: `<h1>Hello from {{name}}!</h1>`
})
export class HelloWorldComponent {
    name = 'Angular 2';
}
