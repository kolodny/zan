zan
===

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Drop in replacement for `React.PropTypes`:

```js
import { types } from 'zan';
const { string, number } = types;
React.createClass({
  propTypes: {
    name: string,
    age: number.isOptional
  },
  render() {
    // ...
  },
});
```

The primary differences this has with `React.PropTypes` is that

1. `zan` exposes an `exactShape` type.
2. checks by default are `isRequired` already and they each expose an `isOptional` method
3. `zan` exposes a `createCustomChecker` method which can be used as follows:

```js
const urlString = createCustomChecker(value => /^https?:/.test(value) );
```


This module also exposes an a checker so you can check types manually without React

### Usage

```js
import { check, types, createCustomChecker } from 'zan';

check(types.bool, true); // null
check(types.bool, 123); // returns Error object

check(types.shape({name: types.string}), {name: 'Me'}); // null
check(types.shape({name: types.string}), {}); // returns Error object
check(types.shape({name: types.string}), {name: 'Me', age: 22}); // null
check(types.exactShape({name: types.string}), {name: 'Me', age: 22}); // returns Error object
```

`check` is curry-able so `const numberChecker = check(types.number); numberChecker(22);` works

see [test.js](test.js) from more usage


[npm-image]: https://img.shields.io/npm/v/zan.svg?style=flat-square
[npm-url]: https://npmjs.org/package/zan
[travis-image]: https://img.shields.io/travis/kolodny/zan.svg?style=flat-square
[travis-url]: https://travis-ci.org/kolodny/zan
[coveralls-image]: https://img.shields.io/coveralls/kolodny/zan.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/kolodny/zan
[downloads-image]: http://img.shields.io/npm/dm/zan.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/zan
