Zan
===

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Zan is a drop in replacement for `React.PropTypes`:

```js
import { types } from 'zan';
React.createClass({
  propTypes: {
    name: types.string,
    age: types.number.isOptional
  },
  render() {/*...*/},
});
```

The primary differences between Zan and `React.PropTypes` are:

 1. Checks are `isRequired` by default and expose an `isOptional` property
 2. Provides an `exactShape` type checker
 3. Provides introspection methods
 4. Provides methods to help you create your own type checkers

## API

### `zan.types`
Exposes all the same type-checkers as `React.PropTypes`. Each type-checker is required by default and has the following properties:

 - `isOptional` - Returns an optional type checker. Optional checkers behave like `React.PropType`'s default behavior.

 - `inspectArgs()` - Returns the arguments passed to the type-checker creator.

    _Example:_ `shape(o).inspectArgs() === o`

 - `inspectType()` - Returns the checker type.

    _Example:_  `shape(o).inspectType() === shape`.

 - `inspectIsOptional()` - Return whether or not the checker is optional

     _Example:_  `shape(o).inspectIsOptional() === false`.

     _Example:_  `shape(o).isOptional.inspectIsOptional() === true`.

### `zan.types.exactShape(shape)`
Like `shape()`, but disallows unrecognized keys.

### `zan.check(type, value, [label])`

Validates value against a type checker. Useful when using Zan outside of React components. Returns `null` if the data validates successfully or an `Error` object if there's an error:

    Error: Invalid prop `value.field[0].subField` of type `object` supplied to `label`, expected an array.

Usage:

```javascript
// Normal
const error = zan.check(type, value, 'label');
// Curried
const check = zan.check(type);
const error = check(value, 'label');
```

### `createCustomChecker(checkerFn)`
Allows you to create your own type checker. Here's how you'd create a checker
that validates that data is an instance of a `RegExp`:

```javascript
const regex = zan.createCustomChecker((props, propName /*, ...*/) => {
  const value = props[propName];
  if (!(value instanceof RegExp)) {
    return new Error('Expected a regex but found "' + (typeof value) + '".');
  }
});
// regex gets all of Zan's built-in goodness:
regex.isOptional;
regex.inspectType() === regex;
```

The checker is passed all the same arguments as React PropType checkers: `props`, `propName`, `componentName`, `location`, and `propFullName`.

###### A Note on Error Formats
The final checker errors will be in  one of two forms:

```
Required prop `field.subField[0].name` was not specified in `MyComponent`.
Invalid prop `field.subField[0].name` of (type `number` OR value `xyz`) supplied to `MyComponent`...
```

If you return an error that doesn't start with `Required ` or `Invalid ` then Zan prefixes the error message with:

```
Invalid prop `field.subField[0].name` of value `xyz` supplied to `MyComponent`:
```

### `createCustomCheckerCreator(checkerCreatorFn)`
This is like `createCustomChecker()` but is for checkers that require arguments:

```javascript
const range = zan.createCustomCheckerCreator((min, max) =>
  (props, propName/*, ...*/) => {
    const value = props[propName];
    if (value < min || value > max) {
      return new Error('Expected number in range `' + min + '` to `' + max + '`.');
    }
  }
);
// regex gets all of Zan's build-in goodness:
range(1, 3).isOptional;
range(1, 3).inspectType() === range;
```


### `recursive(types)`

Converts native arrays and objects to `arrayOf()` and `shape()` calls, so you don't have to:

```js
import { types, recursive } from 'zan';
const { number, string } = types;

const propTypes = recursive({
  myAge: number,
  myFavoriteNumbers: [number],
  treeNode: {
    value: number
  },
  buddies: [{
    name: string,
    age: number,
  }],
});

// ...is equivalent to:

const propTypes = {
  myAge: number,
  myFavoriteNumbers: arrayOf(number),
  treeNode: shape({
    value: number,
  }),
  buddies: arrayOf(shape({
    name: string,
    age: number,
  })),
};

```

see [test.js](test.js) from more usage


[npm-image]: https://img.shields.io/npm/v/zan.svg?style=flat-square
[npm-url]: https://npmjs.org/package/zan
[travis-image]: https://img.shields.io/travis/kolodny/zan.svg?style=flat-square
[travis-url]: https://travis-ci.org/kolodny/zan
[coveralls-image]: https://img.shields.io/coveralls/kolodny/zan.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/kolodny/zan
[downloads-image]: http://img.shields.io/npm/dm/zan.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/zan
