import {onready} from 'init';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

console.log('Loading home/index');


export interface HelloProps { compiler: string; framework: string; }

export class Hello extends React.Component<HelloProps, {}> {
    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}

export function init(selector: string) {

    onready(() => {

        console.log('Ready for action');

        ReactDOM.render(
            <Hello compiler="TypeScript" framework="React" />,
            document.querySelector(selector)
        );

    });

}
