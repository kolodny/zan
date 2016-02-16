import expect from 'expect';
import React from 'react';

const nodeInstance = <div></div>;

import { check, types, createSimpleChecker, recursive } from './';

const {
  any,
  array,
  arrayOf,
  bool,
  exactShape,
  func,
  instanceOf,
  node,
  number,
  object,
  objectOf,
  oneOf,
  oneOfType,
  shape,
  string,
} = types;

var zan = require('./');

describe('zan', () => {
  it('is curry-able', () => {
    expect(  check(number)(123)  ).toBeFalsy();
  });

  it('can do optional checks',() => {
    expect(  check(number.isOptional, 123)  ).toBeFalsy();
    expect(  check(number.isOptional, undefined)  ).toBeFalsy();
    expect(  check(number.isOptional, null)  ).toBeFalsy();
    expect(  check(number.isOptional, 'x')  ).toBeAn(Error);
  });

  it('can convert optional checks to required checks', () => {
    expect(check(number.isOptional.isRequired, null)).toBeAn(Error);
    expect(check(shape({num: number}).isOptional.isRequired, null)).toBeAn(Error);
    expect(check(exactShape({num: number}).isOptional.isRequired, null)).toBeAn(Error);
  });

  it('can convert optional checks to required checks and back again', () => {
    expect(check(number.isOptional.isRequired.isOptional, null)).toBeFalsy();
    expect(check(shape({num: number}).isOptional.isRequired.isOptional, null)).toBeFalsy();
    expect(check(exactShape({num: number}).isOptional.isRequired.isOptional, null)).toBeFalsy();
  });

  it ('can statically inspect if a type checker is requried or optional', () => {
    expect(number.inspectIsOptional()).toEqual(false);
    expect(number.isOptional.inspectIsOptional()).toEqual(true);
    expect(number.isOptional.isRequired.inspectIsOptional()).toEqual(false);
    expect(shape({num: number}).inspectIsOptional()).toEqual(false);
    expect(shape({num: number}).isOptional.inspectIsOptional()).toEqual(true);
    expect(shape({num: number}).isOptional.isRequired.inspectIsOptional()).toEqual(false);
    expect(exactShape({num: number}).inspectIsOptional()).toEqual(false);
    expect(exactShape({num: number}).isOptional.inspectIsOptional()).toEqual(true);
    expect(exactShape({num: number}).isOptional.isRequired.inspectIsOptional()).toEqual(false);
  });

  it ('can statically inspect the arguments passed to a checker', () => {
    expect(number.inspectArgs()).toEqual([]);
    expect(shape({num: number}).inspectArgs()).toEqual([{num: number}]);
    expect(exactShape({num: number}).inspectArgs()).toEqual([{num: number}]);
  });

  it ('can predictably inspect type type of an inspector', () => {
    expect(number.inspectType()).toEqual(number);
    expect(shape({num: number}).inspectType()).toEqual(shape);
    expect(shape({num: number}.isOptional).inspectType()).toEqual(shape);
    expect(shape({num: number}).isOptional.isRequired.inspectType()).toEqual(shape);
    expect(exactShape({num: number}).inspectType()).toEqual(exactShape);
    expect(exactShape({num: number}).isOptional.inspectType()).toEqual(exactShape);
  });

  it('can do optional shapes',() => {
    expect( check(shape({num: number}), {num: 22} )).toBeFalsy();
    expect( check(shape({num: number}), {num: 'x'} )).toBeAn(Error);
    expect( check(shape({num: number}), null )).toBeAn(Error);
    expect( check(shape({num: number}).isOptional, null )).toBeFalsy();
    expect( check(exactShape({num: number}), null )).toBeAn(Error);
  });

  describe('simple types', () => {

    it('can check if a value is a boolean', () => {
      expect(check(bool, true)).toBeFalsy();
      expect(check(bool, 1)).toBeAn(Error);
    });

    it('can check if a value is a function', () => {
      expect(check(func, () => {})).toBeFalsy();
      expect(check(func, 'str')).toBeAn(Error);
      expect(check(func.isOptional, null)).toBeFalsy();
    });

    it('can check if a value is a number', () => {
      expect(check(number, 123)).toBeFalsy();
      expect(check(number, '123')).toBeAn(Error);
    });

    it('can check if a value is a node', () => {
      expect(check(node, nodeInstance)).toBeFalsy();
      expect(check(node, {})).toBeAn(Error);
    });

    it('can check if a value is a string', () => {
      expect(check(string, 'foo')).toBeFalsy();
      expect(check(string, /foo/)).toBeAn(Error);
    });

    it('is able to produce custom checkers', function() {
      var customValidator = createSimpleChecker(value => /(foo|bar)g?/.test(value) );
      expect(check(customValidator, 'foo')).toBeFalsy();
      expect(check(customValidator, 'foog')).toBeFalsy();
      expect(check(customValidator, 'bar')).toBeFalsy();
      expect(check(customValidator, 'barg')).toBeFalsy();
      expect(check(customValidator, 'fog')).toBeAn(Error);
    });
  });

  describe('custom validators', () => {
    it ('should have isOptional and isRequired extentions', () => {
      var customValidator = createSimpleChecker(value => /(foo|bar)g?/.test(value) );
      expect(check(customValidator, null)).toBeAn(Error);
      expect(check(customValidator.isRequired, null)).toBeAn(Error);
      expect(check(customValidator.isOptional, null)).toBeFalsy();
    });
  });

  describe('complex types', function() {

    describe('has a type `array` that', function() {
      it('can check if an object is an array', function() {
        expect(check(array, ['a', 22])).toBeFalsy();
        expect(check(array, {a: 22})).toBeAn(Error)
      });
    });

    describe('has a type `object` that', function() {
      it('can check if an object is an object', function() {
        expect(check(object, {a: 22})).toBeFalsy();
        expect(check(object, ['a', 22])).toBeAn(Error)
      });
    });

    describe('has a type `objectOf` that', function() {
      it('can check if an object is an objectOf', function() {
        expect(check(objectOf(number), {id: 22})).toBeFalsy();
        expect(check(objectOf(number), {id: '22'})).toBeAn(Error)
      });
    });

    describe('has a type `arrayOf` that', function() {
      it('can check if an object is an arrayOf', function() {
        expect(check(arrayOf(number), [22])).toBeFalsy();
        expect(check(arrayOf(number), ['22'])).toBeAn(Error)
        expect(check(arrayOf(number), [22, '22'])).toBeAn(Error)
      });
    });

    describe('has a type `instanceOf` that', function() {
      it('can check if an object is an instanceOf', function() {
        var C = function C() {};
        var c = new C();
        expect(check(instanceOf(C), c)).toBeFalsy();
        expect(check(instanceOf(C), {})).toBeAn(Error)
      });
    });

    describe('has a type `oneOf` that', function() {
      it('can check if an object is oneOf a list of specific value', function() {
        expect(check(oneOf(['foo', 'bar']), 'bar')).toBeFalsy();
        expect(check(oneOf(['foo', 'bar']), 'baz')).toBeAn(Error)
      });
    });

    describe('has a type `any` that', function() {
      it('can check if an object anything', function() {
        expect(check(any, 'bar')).toBeFalsy();
        expect(check(any, null)).toBeAn(Error)
      });
    });

    describe('has a type `oneOfType` that', function() {
      it('can check if an object is oneOfType a list of specific value', function() {
        var stringOrFunction = oneOfType([string, func]);
        expect(check(stringOrFunction, 'foo')).toBeFalsy();
        expect(check(stringOrFunction, function() {})).toBeFalsy();
        expect(check(stringOrFunction, 123)).toBeAn(Error)
      });
    });

    describe('has a type `oneOfType` that', function() {
      it('can check if an object is oneOfType a list of specific value', function() {
        var stringOrFunction = oneOfType([string, func]);
        expect(check(stringOrFunction, 'foo')).toBeFalsy();
        expect(check(stringOrFunction, function() {})).toBeFalsy();
        expect(check(stringOrFunction, 123)).toBeAn(Error)
      });
    });

    describe('has a type `shape` that', function() {
      it('can check if an object matches a shape', function() {
        var myShape = shape({
          name: string,
          age: number,
          address: shape({
            street: string
          })
        });
        expect(check(myShape, {extra: 123, name: 'Bob', age: 99, address: {street: '2nd Ave'}})).toBeFalsy();
        expect(check(myShape, {extra: 123, name: 'Bob', age: 99, address: {street: 2}})).toBeAn(Error)
        expect(check(shape({name: string.isOptional}), {})).toBeFalsy();
      });
    });

  });

  describe('has a type `exactShape` that', function() {
    it('can check if an object exactly matches a exactShape', function() {
      var myExactShape = exactShape({
        name: string,
        age: number,
        address: exactShape({
          street: string
        })
      });
      expect(check(myExactShape, {name: 'Bob', age: 99, address: {street: '2nd Ave'}})).toBeFalsy();
      expect(check(myExactShape, {extra: 123, name: 'Bob', age: 99, address: {street: '2nd Ave'}})).toBeAn(Error)
      expect(check(myExactShape, {age: 99, address: {street: '2nd Ave'}})).toBeAn(Error)
      expect(check(myExactShape, {name: 'Bob', age: 99, address: {street: 2}})).toBeAn(Error)
    });
  });

  describe('recursive', () => {
    it("doesn't alter 1 level deep objects", () => {
      const shallowObject = {a: 1, b: '2', c: null, d: () => {}};
      expect( recursive(shallowObject) ).toEqual(shallowObject);
    });
    it('can check at least one level', () => {
      const deepChecker = recursive({
        value: {
          level1: string,
        }
      }).value;
      expect( check(deepChecker, {level1: 123} )).toBeAn(Error);
      expect( check(deepChecker, {level1: '123'} )).toBeFalsy();
    });
    it('can check until the last turtle', () => {
      const deepChecker = recursive({
        value: {
          foo: number,
          level1: {
            level2: [{
              level3: [[string]]
            }]
          }
        }
      }).value;
      expect( check(deepChecker, {foo: '3', level1: { level2: [{ level3: [['abc'], [], ['xyz']] }] }} )).toBeAn(Error);
      expect( check(deepChecker, {foo: 3, level1: { level99: [{ level3: [['abc'], [], ['xyz']] }] }} )).toBeAn(Error);
      expect( check(deepChecker, {foo: 3, level1: { level2: [{ level3: ['abc'] }] }} )).toBeAn(Error);
      expect( check(deepChecker, {foo: 3, level1: { level2: [{ level3: [] }] }} )).toBeFalsy();
      expect( check(deepChecker, {foo: 3, level1: { level2: [{ level3: [['abc'], [], ['xyz']] }] }} )).toBeFalsy();
    });
  });

  it("doesn't alter React.PropTypes", () => {
    expect(React.PropTypes.number.isRequired.isOptional).toBeFalsy();
  });



});
