# Changelog

## [3.3.0](https://github.com/node-modules/get-ready/compare/v3.2.0...v3.3.0) (2024-12-18)


### Features

* export isReady and readyError getter ([#6](https://github.com/node-modules/get-ready/issues/6)) ([cce2f08](https://github.com/node-modules/get-ready/commit/cce2f085334d2230908e7109efb129df94704be6))

## [3.2.0](https://github.com/node-modules/get-ready/compare/v3.1.0...v3.2.0) (2024-12-15)


### Features

* merge Ready and EventEmitter ([#5](https://github.com/node-modules/get-ready/issues/5)) ([bb049ea](https://github.com/node-modules/get-ready/commit/bb049ea9a90550906ad046663aad401af694df26))

## [3.1.0](https://github.com/node-modules/get-ready/compare/v3.0.0...v3.1.0) (2023-10-10)


### Features

* support esm and cjs both ([#3](https://github.com/node-modules/get-ready/issues/3)) ([ac03fe2](https://github.com/node-modules/get-ready/commit/ac03fe2001f8d4072512b4ca10ab7b0d9af026ba))

## [3.0.0](https://github.com/node-modules/get-ready/compare/v2.0.1...v3.0.0) (2023-06-05)


### ⚠ BREAKING CHANGES

* Drop Node.js < 16.13.0 support

https://github.com/eggjs/egg-core/issues/264

### Features

* refactor with typescript ([#1](https://github.com/node-modules/get-ready/issues/1)) ([9eb913f](https://github.com/node-modules/get-ready/commit/9eb913fb43889b2c253bab7b1adc139b60747684))

2.0.1 / 2017-02-09
==================

  * fix: it should reject error when ready return promise (#3)

2.0.0 / 2017-02-08
==================

  * feat: [BREAKING_CHANGE] reimplement get-ready (#2)
  * fix typo on readme

1.0.0 / 2015-09-29
==================

 * chore: use eslint and es6
 * test: add test with co
 * travis: test on node(1,2,3,4)
 * feat: support promise
 * fork from supershabam/ready
