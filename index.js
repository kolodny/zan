var propTypes = require('react').PropTypes;

var types = exports.types = {};

Object.keys(propTypes).forEach(function(key) {
  types[key] = propTypes[key].isRequired
    ? wrapReactChecker(propTypes[key])
    : wrapReactCheckerCreator(propTypes[key]);
});

function startsWith(str, substr) {
  return str.slice(0, substr.length) === substr;
}

var createCustomChecker = exports.createCustomChecker = function(checker, args, type) {
  const creatorArgs = Array.prototype.slice.apply(args || []);
  return createRequiredChecker(function(isOptional) {
    return addInspectors(isOptional, creatorArgs, type,
      function(props, propName, componentName, location, propFullName) {
        const value = props[propName];
        if ((typeof value) === 'undefined' || value === null) {
          return isOptional ? null : new Error(
            'Required ' + location + ' `' + (propFullName || propName) +
            '` was not specified in `' + componentName + '`.'
          );
        }
        var error = checker.apply(null, arguments);
        // Errors must be of the form "Invalid prop...." or "Required prop.... was not specified"
        // If the error isn't either of these, we assume it to be a custom error and we prefix
        // the error message with "invalid prop ...: your message".
        if (error &&
          !startsWith(error.message, 'Invalid ') &&
          !startsWith(error.message, 'Required ')
        ) {
          error.message = (
            'Invalid ' + location + ' `' + (propFullName || propName) + '` ' +
            'of value `' + value + '` ' +
            'supplied to `' + componentName + '`: ' +
            error.message
          );
        }
        return error;
      }
    );
  });
};

var createCustomCheckerCreator = exports.createCustomCheckerCreator = function(creator) {
  return function checkerCreator() {
    var args = Array.prototype.slice.apply(arguments);
    var checker = creator.apply(null, args);
    checker = createCustomChecker(checker, args, checkerCreator);
    return checker;
  }
};

types.exactShape = createCustomCheckerCreator(function (shape) {
  return function (props, propName) {
    var diff = keysDiff(shape, props[propName]);
    return diff
      ? new Error(diff)
      : types.shape(shape).apply(null, arguments);
  }
});

exports.check = function(propTypeValidator) {
  var curriedCheck = function(value, label) {
    label = label || 'zan-check';
    var testObj = {value: value};
    return propTypeValidator(testObj, 'value', label, 'prop') || null;
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


function wrapReactCheckerCreator(reactCheckerCreator) {
  return function checkerCreator() {
    var reactChecker = reactCheckerCreator.apply(null, arguments);
    return wrapReactChecker(reactChecker, arguments, checkerCreator);
  };
}

function wrapReactChecker(reactChecker, args, type) {
  return createRequiredChecker(function(isOptional) {
    return addInspectors(isOptional, args, type, function() {
      return isOptional
        ? reactChecker.apply(null, arguments)
        : reactChecker.isRequired.apply(null, arguments)
    });
  });
}

function addInspectors(isOptional, args, type, checker) {
  if (!checker) {
    checker = type;
  }
  if (!type) {
    type = checker;
  }
  checker.inspectIsOptional = function inspectIsOptional() {
    return isOptional;
  };
  checker.inspectArgs = function inspectArgs() {
    return args
      ? Array.prototype.slice.apply(args)
      : [];
  };
  checker.inspectType = function() {
    return type;
  };
  return checker;
}

function createRequiredChecker(makeChecker) {
  var checker = makeChecker(false);
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
