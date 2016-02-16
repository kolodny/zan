var propTypes = require('react').PropTypes;

var types = exports.types = {};

Object.keys(propTypes).forEach(function(key) {
  types[key] = propTypes[key].isRequired
    ? wrapChecker(propTypes[key])
    : wrapCheckerCreator(propTypes[key]);
});

exports.createCustomChecker = function(isValid) {
  return function(props, propName, componentName, location) {
    if (!isValid(props[propName])) {
      return new Error(
        'Invalid ' + location + ' `' + propName + '` supplied to `' + componentName + '`.'
      );
    }
    return null;
  }
};

types.exactShape = function(shape) {
  return createRequiredChecker(function(isOptional) {
    return addInspectors(isOptional, [shape], function (props, propName, componentName, location) {
      if (isOptional && props[propName] == null) {
        return null;
      }
      var diff = keysDiff(shape, props[propName]);
      if (diff) {
        return new Error('Invalid ' + location + ' `' + propName + '` supplied to `' + componentName + '`: ' + diff + '.');
      }
      return types.shape(shape).apply(this, arguments);
    });
  });
};

exports.check = function(propTypeValidator) {
  var curriedCheck = function(value, label) {
    label = label || 'zan-check';
    var testObj = { value: value };
    return propTypeValidator(testObj, 'value', label, 'prop');
  };
  return arguments.length > 1
    ? curriedCheck.apply(null, Array.prototype.slice.call(arguments, 1))
    : curriedCheck;
};

var recursive = exports.recursive = function(object, isRecursive) {
  if (typeof object !== 'object' || object === null) {
    return object;
  }
  if (object instanceof Array) {
    return types.arrayOf(recursive(object[0], true));
  }

  var ret = {};
  for (var i in object) {
    if (Object.prototype.hasOwnProperty.call(object, i)) {
      ret[i] = recursive(object[i], true);
    }
  }
  return isRecursive ? types.shape(ret) : ret;
};

// HELPERS /////

function wrapCheckerCreator(reactCheckerCreator) {
  return function() {
    var reactChecker = reactCheckerCreator.apply(null, arguments);
    return wrapChecker(reactChecker, arguments);
  };
}

function wrapChecker(reactChecker, args) {
  return createRequiredChecker(function(isOptional) {
    return addInspectors(isOptional, args, function() {
      return isOptional
        ? reactChecker.apply(null, arguments)
        : reactChecker.isRequired.apply(null, arguments)
    });
  });
}

function addInspectors(isOptional, args, checker) {
  checker.inspectIsOptional = function inspectIsOptional() {
    return isOptional;
  };
  checker.inspectArgs = function inspectArgs() {
    return args
      ? Array.prototype.slice.apply(args)
      : [];
  };
  return checker;
}

function createRequiredChecker(makeChecker) {
  const checker = makeChecker(false);
  checker.isOptional = makeChecker(true);
  checker.isRequired = checker.isOptional.isRequired = checker;
  return checker;
}

function keysDiff(o1, o2) {
  var map1 = {};
  var map2 = {};
  for (var key in o1) if (Object.prototype.hasOwnProperty.call(o1, key)) map1[key] = true;
  for (key in o2) if (Object.prototype.hasOwnProperty.call(o2, key)) {
    map1[key] ? delete map1[key] : map2[key] = true;
  }
  var left = Object.keys(map1);
  var right = Object.keys(map2);
  if (left.length === 0 && right.length === 0) return null;
  var errorMessages = [];
  if (left.length) errorMessages.push('missing keys: ' + JSON.stringify(left));
  if (right.length) errorMessages.push('extra keys: ' + JSON.stringify(right));
  return errorMessages.join('\n');
}

