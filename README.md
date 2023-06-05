# get-ready

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/get-ready.svg?style=flat-square
[npm-url]: https://npmjs.org/package/get-ready
[download-image]: https://img.shields.io/npm/dm/get-ready.svg?style=flat-square
[download-url]: https://npmjs.org/package/get-ready

**Fork from [supershabam/ready](https://github.com/supershabam/ready)**

one-time ready event object.

## Usage

Create `ready` event object.

```ts
import Ready from 'get-ready';

const obj = new Ready();

// register a callback
obj.ready(() => console.log('ready'));

// mark ready
obj.ready(true);
```

### Register

Register a callback to the callback stack, it will be called when mark as ready, see example above.

If the callback is undefined, register will return a promise.

```ts
obj.ready().then(() => console.log('ready'));
obj.ready(true);
```

If it has been ready, the callback will be called immediately.

```ts
// already ready
obj.ready(true);
obj.ready().then(() => console.log('ready'));
```

**Warning: the callback is called after nextTick**

### Emit

Mark it as ready, you can simply using `.ready(true)`.

You can also mark it not ready.

```ts
obj.ready(true);
// call immediately
obj.ready(() => console.log('ready'));

obj.ready(false);
obj.ready(() => throw 'don\'t run');
```

When exception throws, you can pass an error object, then the callback will receive it as the first argument.

```ts
obj.ready(err => console.log(err));
obj.ready(new Error('err'));
```

## License

[MIT](LICENSE)
