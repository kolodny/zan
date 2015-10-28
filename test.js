import expect from 'expect';
import React from 'react';

const nodeInstance = <div></div>;

import { check, types, createCustomChecker } from './';

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
      var customValidator = createCustomChecker(value => /(foo|bar)g?/.test(value) );
      expect(check(customValidator, 'foo')).toBeFalsy();
      expect(check(customValidator, 'foog')).toBeFalsy();
      expect(check(customValidator, 'bar')).toBeFalsy();
      expect(check(customValidator, 'barg')).toBeFalsy();
      expect(check(customValidator, 'fog')).toBeAn(Error);
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



});
