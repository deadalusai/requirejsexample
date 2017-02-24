console.log('Loading util');

export function foo() {

    console.log('foo');

    return 1;
}

export function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}