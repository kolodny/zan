var assert = require('assert');
var zan = require('./');

describe('zan', function() {
  describe('simple types', function() {
    var types = [
      ['bool', true, 1],
      ['func', function() {}, 'logger'],
      ['number', 123, '123'],
      ['string', 'foo', /foo/],
    ];
    types.forEach(function(type) {
      it('can check if an object is ' + type[0], function() {

        assert.doesNotThrow(function() {
          zan.check(zan.types[type[0]], type[1]);
        });

        assert.throws(function() {
          zan.check(zan.types[type[0]], type[2]);
        });

      });
    });

    it('is able to produce custom types', function() {
      var custom = zan.validator(function(arg) { return /(foo|bar)g?/.test(arg) });
      zan.check(custom, 'foo');
      zan.check(custom, 'foog');
      zan.check(custom, 'bar');
      zan.check(custom, 'barg');
      assert.throws(function() {
        zan.check(custom, 'fog');
      });
    });

  });

  describe('complex types', function() {

    describe('has a type `array` that', function() {
      it('can check if an object is an array', function() {
        zan.check(zan.types.array, ['a', 22]);
        assert.throws(function() {
          zan.check(zan.types.array, {a: 22});
        });
      });
    });

    describe('has a type `object` that', function() {
      it('can check if an object is an object', function() {
        zan.check(zan.types.object, {a: 22});
        assert.throws(function() {
          zan.check(zan.types.object, ['a', 22]);
        });
      });
    });

    describe('has a type `objectOf` that', function() {
      it('can check if an object is an objectOf', function() {
        zan.check(zan.types.objectOf(zan.types.number), {id: 22});
        assert.throws(function() {
          zan.check(zan.types.objectOf(zan.types.number), {id: '22'});
        });
      });
    });

    describe('has a type `arrayOf` that', function() {
      it('can check if an object is an arrayOf', function() {
        zan.check(zan.types.arrayOf(zan.types.number), [22]);
        assert.throws(function() {
          zan.check(zan.types.arrayOf(zan.types.number), ['22']);
        });
        assert.throws(function() {
          zan.check(zan.types.arrayOf(zan.types.number), [22, '22']);
        });
      });
    });

    describe('has a type `instanceOf` that', function() {
      it('can check if an object is an instanceOf', function() {
        var C = function C() {};
        var c = new C();
        zan.check(zan.types.instanceOf(C), c);
        assert.throws(function() {
          zan.check(zan.types.instanceOf(C), {});
        });
      });
    });

    describe('has a type `oneOf` that', function() {
      it('can check if an object is oneOf a list of specific value', function() {
        zan.check(zan.types.oneOf(['foo', 'bar']), 'bar');
        assert.throws(function() {
          zan.check(zan.types.oneOf(['foo', 'bar']), 'baz');
        });
      });
    });

    describe('has a type `any` that', function() {
      it('can check if an object anything', function() {
        zan.check(zan.types.any, 'bar');
        assert.throws(function() {
          zan.check(zan.types.any, null);
        });
      });
    });

    describe('has a type `oneOfType` that', function() {
      it('can check if an object is oneOfType a list of specific value', function() {
        var stringOrFunction = zan.types.oneOfType([zan.types.string, zan.types.func]);
        zan.check(stringOrFunction, 'foo');
        zan.check(stringOrFunction, function() {});
        assert.throws(function() {
          zan.check(stringOrFunction, 123);
        });
      });
    });

    describe('has a type `oneOfType` that', function() {
      it('can check if an object is oneOfType a list of specific value', function() {
        var stringOrFunction = zan.types.oneOfType([zan.types.string, zan.types.func]);
        zan.check(stringOrFunction, 'foo');
        zan.check(stringOrFunction, function() {});
        assert.throws(function() {
          zan.check(stringOrFunction, 123);
        });
      });
    });

    describe('has a type `shape` that', function() {
      it('can check if an object matches a shape', function() {
        var shape = zan.types.shape({
          name: zan.types.string,
          age: zan.types.number,
          address: zan.types.shape({
            street: zan.types.string
          })
        });
        zan.check(shape, {extra: 123, name: 'Bob', age: 99, address: {street: '2nd Ave'}});
        assert.throws(function() {
          zan.check(shape, {extra: 123, name: 'Bob', age: 99, address: {street: 2}});
        });
      });
    });

  });

  describe('has a type `exactShape` that', function() {
    it('can check if an object exactly matches a exactShape', function() {
      var exactShape = zan.types.exactShape({
        name: zan.types.string,
        age: zan.types.number,
        address: zan.types.exactShape({
          street: zan.types.string
        })
      });
      zan.check(exactShape, {name: 'Bob', age: 99, address: {street: '2nd Ave'}});
      assert.throws(function() {
        zan.check(exactShape, {extra: 123, name: 'Bob', age: 99, address: {street: '2nd Ave'}});
      });
      assert.throws(function() {
        zan.check(exactShape, {age: 99, address: {street: '2nd Ave'}});
      });
      assert.throws(function() {
        zan.check(exactShape, {name: 'Bob', age: 99, address: {street: 2}});
      });
    });
  });



});
