# get-ready

[![NPM version][npm-image]][npm-url]
[![CI](https://github.com/node-modules/get-ready/actions/workflows/nodejs.yml/badge.svg)](https://github.com/node-modules/get-ready/actions/workflows/nodejs.yml)
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/get-ready.svg?style=flat-square
[npm-url]: https://npmjs.org/package/get-ready
[codecov-image]: https://codecov.io/github/node-modules/get-ready/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/get-ready?branch=master
[download-image]: https://img.shields.io/npm/dm/get-ready.svg?style=flat-square
[download-url]: https://npmjs.org/package/get-ready

**Fork from [supershabam/ready](https://github.com/supershabam/ready)**

one-time ready event object.

## Usage

Create `ready` event object.

```ts
import { Ready } from 'get-ready';

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

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/221826?v=4" width="100px;"/><br/><sub><b>supershabam</b></sub>](https://github.com/supershabam)<br/>|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|[<img src="https://avatars.githubusercontent.com/u/32174276?v=4" width="100px;"/><br/><sub><b>semantic-release-bot</b></sub>](https://github.com/semantic-release-bot)<br/>|
| :---: | :---: | :---: | :---: | :---: |

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Mon Jun 05 2023 14:06:50 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
