/**
 * PassFactory.js v0.2.0
 * iOS 6 Passes from the web browser
 * Global export development edition
 * 
 * Copyright 2012 Jimmy Theis, licensed under the MIT License.
 * <https://github.com/jetheis/PassFactory.js>
 */

(function() {
/**
 * almond 0.1.4 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/**
 * Underscore.js 1.3.3
 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Underscore may be freely distributed under the MIT license.
 * Portions of Underscore are inspired or borrowed from Prototype,
 * Oliver Steele's Functional, and John Resig's Micro-Templating.
 * For all details and documentation:
 * http://documentcloud.github.com/underscore
 */

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

define("lib/underscore", (function (global) {
    return function () {
        return global._;
    }
}(this)));

/**
 * CryptoJS v3.0.2
 * code.google.com/p/crypto-js
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * code.google.com/p/crypto-js/wiki/License
 */
var CryptoJS=CryptoJS||function(i,m){var p={},h=p.lib={},n=h.Base=function(){function a(){}return{extend:function(b){a.prototype=this;var c=new a;b&&c.mixIn(b);c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),o=h.WordArray=n.extend({init:function(a,b){a=
this.words=a||[];this.sigBytes=b!=m?b:4*a.length},toString:function(a){return(a||e).stringify(this)},concat:function(a){var b=this.words,c=a.words,d=this.sigBytes,a=a.sigBytes;this.clamp();if(d%4)for(var f=0;f<a;f++)b[d+f>>>2]|=(c[f>>>2]>>>24-8*(f%4)&255)<<24-8*((d+f)%4);else if(65535<c.length)for(f=0;f<a;f+=4)b[d+f>>>2]=c[f>>>2];else b.push.apply(b,c);this.sigBytes+=a;return this},clamp:function(){var a=this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-8*(b%4);a.length=i.ceil(b/4)},clone:function(){var a=
n.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],c=0;c<a;c+=4)b.push(4294967296*i.random()|0);return o.create(b,a)}}),q=p.enc={},e=q.Hex={stringify:function(a){for(var b=a.words,a=a.sigBytes,c=[],d=0;d<a;d++){var f=b[d>>>2]>>>24-8*(d%4)&255;c.push((f>>>4).toString(16));c.push((f&15).toString(16))}return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d+=2)c[d>>>3]|=parseInt(a.substr(d,2),16)<<24-4*(d%8);return o.create(c,b/2)}},g=q.Latin1={stringify:function(a){for(var b=
a.words,a=a.sigBytes,c=[],d=0;d<a;d++)c.push(String.fromCharCode(b[d>>>2]>>>24-8*(d%4)&255));return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d++)c[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return o.create(c,b)}},j=q.Utf8={stringify:function(a){try{return decodeURIComponent(escape(g.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return g.parse(unescape(encodeURIComponent(a)))}},k=h.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=o.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,c=b.words,d=b.sigBytes,f=this.blockSize,e=d/(4*f),e=a?i.ceil(e):i.max((e|0)-this._minBufferSize,0),a=e*f,d=i.min(4*a,d);if(a){for(var g=0;g<a;g+=f)this._doProcessBlock(c,g);g=c.splice(0,a);b.sigBytes-=d}return o.create(g,d)},clone:function(){var a=n.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});h.Hasher=k.extend({init:function(){this.reset()},
reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=k.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,c){return a.create(c).finalize(b)}},_createHmacHelper:function(a){return function(b,c){return l.HMAC.create(a,c).finalize(b)}}});var l=p.algo={};return p}(Math);
(function(){var i=CryptoJS,m=i.lib,p=m.WordArray,m=m.Hasher,h=[],n=i.algo.SHA1=m.extend({_doReset:function(){this._hash=p.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(o,i){for(var e=this._hash.words,g=e[0],j=e[1],k=e[2],l=e[3],a=e[4],b=0;80>b;b++){if(16>b)h[b]=o[i+b]|0;else{var c=h[b-3]^h[b-8]^h[b-14]^h[b-16];h[b]=c<<1|c>>>31}c=(g<<5|g>>>27)+a+h[b];c=20>b?c+((j&k|~j&l)+1518500249):40>b?c+((j^k^l)+1859775393):60>b?c+((j&k|j&l|k&l)-1894007588):c+((j^k^l)-
899497514);a=l;l=k;k=j<<30|j>>>2;j=g;g=c}e[0]=e[0]+g|0;e[1]=e[1]+j|0;e[2]=e[2]+k|0;e[3]=e[3]+l|0;e[4]=e[4]+a|0},_doFinalize:function(){var i=this._data,h=i.words,e=8*this._nDataBytes,g=8*i.sigBytes;h[g>>>5]|=128<<24-g%32;h[(g+64>>>9<<4)+15]=e;i.sigBytes=4*h.length;this._process()}});i.SHA1=m._createHelper(n);i.HmacSHA1=m._createHmacHelper(n)})();


// Force CryptoJS into current scope object
this.CryptoJS = CryptoJS;

define("lib/crypto-js-sha1", (function (global) {
    return function () {
        return global.CryptoJS;
    }
}(this)));

define('Utility',['lib/underscore',
        'lib/crypto-js-sha1'],

function(_, CryptoJS) {

    
    
    var Utility = {

        sha1: function(str) {
            return CryptoJS.SHA1(str).toString();
        },

        // callback(sha1, fileData)
        sha1File: function(file, callback) {
            var fileReader = new FileReader();

            fileReader.onload = function() {
                var fileData = fileReader.result;
                var sha1 = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(fileData)).toString();
                callback(sha1, fileData);
            };

            fileReader.readAsBinaryString(file);
        },

        /**
         * From: http://www.webtoolkit.info/javascript-base64.html
         */
        base64: function(str) {
            var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            var utf8Encode = function(s) {
                s = s.replace(/\r\n/g,"\n");
                var utftext = "";
                for (var n = 0; n < s.length; n++) {
                    var c = s.charCodeAt(n);
                    if (c < 128) utftext += String.fromCharCode(c);
                    else if (c > 127 && c < 2048) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            };
 
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
 
            str = utf8Encode(str);
 
            while (i < str.length) {
 
                chr1 = str.charCodeAt(i++);
                chr2 = str.charCodeAt(i++);
                chr3 = str.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
 
            }
 
            return output;
        },

        base64File: function(file, callback) {
            var fileReader = new FileReader();

            fileReader.onload = function() {
                var result = fileReader.result;
                callback(result.slice(result.indexOf(',') + 1));
            };

            fileReader.readAsDataURL(file);
        },

        lineBreakRubyStringLiteral: function(str) {
            var len = 50;
            var result = str.slice(0, len);

            for (var i = len; i < str.length; i += len) {
                result += "\n              " + str.slice(i, i + len);
            }

            return result;
        },

        isValidFieldValue: function(val) {
            return this.isCorrectType(val, String) ||
                   this.isCorrectType(val, Number) ||
                   this.isCorrectType(val, Date);
        },

        isCorrectType: function(obj, type) {
            switch (type) {
                case String:
                    return obj instanceof String ||
                           typeof obj === 'string';
                case Number:
                    return obj instanceof Number ||
                           typeof obj === 'number';

                case Boolean:
                    return obj instanceof Boolean ||
                           typeof obj === 'boolean';
                           
                default:
                    // Enums
                    if (typeof type === 'object') {
                        return _.values(type).indexOf(obj) > -1;
                    }
                    
                    // Regular inheritance case
                    return obj instanceof type;
            }
        },

        validateType: function(obj, type) {
            if (!this.isCorrectType(obj, type)) {
                throw new TypeError(obj + ' is not of type ' + type);
            }
        },

        validateTypeOrNull: function(obj, type) {
            if (!this.isCorrectType(obj, type) && obj !== null) {
                throw new TypeError(obj + ' is not of type ' + type);
            }
        },

        validateFieldValue: function(obj) {
            if (!this.isValidFieldValue(obj)) {
                throw new TypeError(obj + ' is not a valid field value');
            }
        },

        validateFieldValueOrNull: function(obj) {
            if (!this.isValidFieldValue(obj) || obj === null) {
                throw new TypeError(obj + ' is not a valid field value');
            }
        }
    };

    return Object.freeze(Utility);
});
define('model/BarcodeFormat',[],function() {

	

	var BarcodeFormat = {
        QR: 'PKBarcodeFormatQR',
        PDF417: 'PKBarcodeFormatPDF417',
        Aztec: 'PKBarcodeFormatAztec'
	};
	
    return Object.freeze(BarcodeFormat);
});

define('model/Barcode',['Utility',
        'model/BarcodeFormat'],
       
function(Utility, BarcodeFormat) {

    

    function Barcode(args) {
        this.altText = args.altText || null;
        this.format = args.format || null;
        this.message = args.message || null;
        this.messageEncoding = args.messageEncoding || null;
    }
    
    Barcode.prototype = {
        toJSON: function() {
            var notReadyMessage = 'Barcode not ready to be serialized. Property missing: ';
            var throwNotReadyError = function(p) { throw new Error(notReadyMessage + p); };

            if (!this.format) throwNotReadyError('format');
            if (!this.message) throwNotReadyError('message');
            if (!this.messageEncoding) throwNotReadyError('messageEncoding');

            var result = {
                format: this.format,
                message: this.message,
                messageEncoding: this.messageEncoding
            };

            if (this.altText) result.altText = this.altText;

            return result;
        }
    };

    Object.defineProperties(Barcode.prototype, {
        altText: {
            configurable: false,
            get: function() { return this._altText; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._altText = val;
            }
        },

        format: {
            configurable: false,
            get: function() { return this._format; },
            set: function(val) {
                Utility.validateTypeOrNull(val, BarcodeFormat);
                this._format = val;
            }
        },

        message: {
            configurable: false,
            get: function() { return this._message; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._message = val;
            }
        },

        messageEncoding: {
            configurable: false,
            get: function() { return this._messageEncoding; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._messageEncoding = val;
            }
        }
    });

    Object.freeze(Barcode.prototype);

    return Barcode;
});

define('model/TextAlignment',[],function() {

	

	var TextAlignment = {
		Left:    'PKTextAlignmentLeft',
        Center:  'PKTextAlignmentCenter',
        Right:   'PKTextAlignmentRight',
        Natural: 'PKTextAlignmentNatural'
	}

    return Object.freeze(TextAlignment);
});

define('model/DateStyle',[],function() {

	

	var DateStyle = {
		None: 'PKDateStyleNone',
		Short: 'PKDateStyleShort',
		Medium: 'PKDateStyleMedium',
		Long: 'PKDateStyleLong',
		Full: 'PKDateStyleFull'
	};

	return Object.freeze(DateStyle);
});
define('model/NumberStyle',[],function() {

	

	var NumberStyle = {
		Decimal: 'PKNumberStyleDecimal',
		Percent: 'PKNumberStylePercent',
		Scientific: 'PKNumberStyleScientific',
		SpellOut: 'PKNumberStyleSpellOut'
	};

	return Object.freeze(NumberStyle);
});
define('model/Field',['Utility',
        'model/TextAlignment',
        'model/DateStyle',
        'model/NumberStyle'],

function(Utility, TextAlignment, DateStyle, NumberStyle) {

    

    function Field(args) {
        this._key = null;
        this._value = null;
        this._changeMessage = null;
        this._label = null;
        this._textAlignment = null;

        this._dateStyle = null;
        this._timeStyle = null;
        this._isRelative = null;

        this._currencyCode = null;
        this._numberStyle = null;

        Utility.validateType(args, Object);

        this.key = args.key || null;
        if (args.value) this.value = args.value;
        if (args.changeMessage) this.changeMessage = args.changeMessage;
        if (args.label) this.label = args.label;
        if (args.textAlignment) this.textAlignment = args.textAlignment;

        if (args.dateStyle) this.dateStyle = args.dateStyle;
        if (args.timeStyle) this.timeStyle = args.timeStyle;
        if (args.isRelative !== undefined) this.isRelative = args.isRelative;

        if (args.currencyCode) this.currencyCode = args.currencyCode;
        if (args.numberStyle) this.numberStyle = args.numberStyle;
    }
    
    Field.prototype = {
        toJSON: function() {
            var message = 'Field not ready to be serialized. Missing property : ';

            if (!this.key) throw new Error(message + 'key');
            if (!this.value) throw new Error(message + 'value');

            var result = {
                key: this.key,
                value: this.value
            };

            if (this.changeMessage) result.value = this.changeMessage;
            if (this.label) result.label = this.label;
            if (this.textAlignment) result.textAlignment = this.textAlignment;

            if (this.dateStyle) result.dateStyle = this.dateStyle;
            if (this.timeStyle) result.timeStyle = this.timeStyle;
            if (this.isRelative !== null) result.isRelative = this.isRelative;

            if (this.currencyCode) result.currencyCode = this.currencyCode;
            if (this.numberStyle) result.numberStyle = this.numberStyle;

            return result;
        }
    };

    Object.defineProperties(Field.prototype, {
        key: {
            configurable: false,
            get: function() { return this._key; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._key = val;
            }
        },

        value: {
            configurable: false,
            get: function() { return this._value; },
            set: function(val) {
                Utility.validateFieldValueOrNull(val);
                this._value = val;
            }
        },

        changeMessage: {
            configurable: false,
            get: function() { return this._changeMessage; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._changeMessage = val;
            }
        },

        label: {
            configurable: false,
            get: function() { return this._label; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._label = val;
            }
        },

        textAlignment: {
            configurable: false,
            get: function() { return this._textAlignment; },
            set: function(val) {
                Utility.validateTypeOrNull(val, TextAlignment);
                this._textAlignment = val;
            }
        },

        dateStyle: {
            configurable: false,
            get: function() { return this._dateStyle; },
            set: function(val) {
                Utility.validateTypeOrNull(val, DateStyle);
                this._dateStyle = val;
            }
        },

        timeStyle: {
            configurable: false,
            get: function() { return this._timeStyle; },
            set: function(val) {
                Utility.validateTypeOrNull(val, DateStyle);
                this._timeStyle = val;
            }
        },

        isRelative: {
            configurable: false,
            get: function() { return this._isRelative; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Boolean);
                this._isRelative = val;
            }
        },

        currencyCode: {
            configurable: false,
            get: function() { return this._currencyCode; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._currencyCode = val;
            }
        },

        numberStyle: {
            configurable: false,
            get: function() { return this._numberStyle; },
            set: function(val) {
                Utility.validateTypeOrNull(val, NumberStyle);
                this._numberStyle = val;
            }
        }
    });

    Object.freeze(Field.prototype);

    return Field;
});

define('model/FieldSet',['model/Field'],

function(Field) {

    

    function FieldSet() {
        this._length = 0;
    }

    FieldSet.prototype = {
        addField: function(name, args) {
            var privateName = '_' + name;
            this[privateName] = new Field(args);

            Object.defineProperty(this, name, {
                configurable: true,
                get: function() { return this[privateName].value; },
                set: function(val) { this[privateName].value = val; }
            });

            this._length ++;
        },

        removeField: function(name) {
            if (this[name])  {
                delete this[name];
                delete this['_' + name];
                this._length --;
            }
        },

        toJSON: function() {
            var result = [];

            for (var property in this) {
                if (this.hasOwnProperty(property) && this[property] instanceof Field) {
                    result.push(this[property]);
                }
            }

            return result;
        }
    };

    Object.defineProperties(FieldSet.prototype, {
        length: {
            configurable: false,
            get: function() { return this._length; }
        }
    });

    Object.freeze(FieldSet.prototype);

    return FieldSet;
});

define('model/Color',['Utility'],

function(Utility) {

    

    function Color(redOrHex, green, blue) {
        if (Utility.isCorrectType(redOrHex, String)) {

            // Hex value supplied
            this.parseHexColor(redOrHex);

        } else {

            // RGB values supplied
            this.red = redOrHex || 0;
            this.green = green || 0;
            this.blue = blue || 0;

        }
    }
    
    Color.prototype = {
        parseHexColor: function(hex) {
            // Strip hash if it's there
            if (hex.indexOf('#') === 0) {
                hex = hex.substring(1);
            }

            if (hex.length === 6) {

                // Standard 6-character hex color
                this.red = parseInt(hex.substring(0, 2), 16);
                this.green = parseInt(hex.substring(2, 4), 16);
                this.blue = parseInt(hex.substring(4), 16);

            } else if (hex.length === 3) {

                // Web-safe 3-character hex color
                var expandedRed = hex.substring(0, 1) + hex.substring(0, 1);
                var expandedGreen = hex.substring(1, 2) + hex.substring(1, 2);
                var expandedBlue = hex.substring(2) + hex.substring(2);

                this.red = parseInt(expandedRed, 16);
                this.green = parseInt(expandedGreen, 16);
                this.blue = parseInt(expandedBlue, 16);

            } else {
                // Not sure what sort of color this is supposed to be
                throw new TypeError('Invalid hex color supplied: ' + hex);
            }
        },

        toJSON: function() {
            return 'rgb(' + this.red + ', ' + this.green + ', ' + this.blue + ')';
        }
    };

    Object.defineProperties(Color.prototype, {
        red: {
            configurable: false,
            get: function() { return this._red || 0; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) throw new TypeError('Invalid RBG red color value: ' + val);
                this._red = val;
            }
        },

        green: {
            configurable: false,
            get: function() { return this._green || 0; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) throw new TypeError('Invalid RBG green color value: ' + val);
                this._green = val;
            }
        },

        blue: {
            configurable: false,
            get: function() { return this._blue || 0; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) throw new TypeError('Invalid RBG blue color value: ' + val);
                this._blue = val;
            }
        }
    });

    Object.freeze(Color.prototype);

    return Color;
});

/**
 * JSZip - A Javascript class for generating and reading zip files
 * <http://stuartk.com/jszip>
 *
 * (c) 2009-2012 Stuart Knightley <stuart [at] stuartk.com>
 * Dual licenced under the MIT license or GPLv3. See LICENSE.markdown.
 */

/**
Usage:
   zip = new JSZip();
   zip.file("hello.txt", "Hello, World!").add("tempfile", "nothing");
   zip.folder("images").file("smile.gif", base64Data, {base64: true});
   zip.file("Xmas.txt", "Ho ho ho !", {date : new Date("December 25, 2007 00:00:01")});
   zip.remove("tempfile");

   base64zip = zip.generate();

**/

/**
 * Representation a of zip file in js
 * @constructor
 * @param {String=} data the data to load, if any (optional).
 * @param {Object=} options the options for creating this objects (optional).
 */
var JSZip = function(data, options) {
   // object containing the files :
   // {
   //   "folder/" : {...},
   //   "folder/data.txt" : {...}
   // }
   this.files = {};

   // Where we are in the hierarchy
   this.root = "";

   if(data) {
      this.load(data, options);
   }
};

JSZip.signature = {
   LOCAL_FILE_HEADER : "\x50\x4b\x03\x04",
   CENTRAL_FILE_HEADER : "\x50\x4b\x01\x02",
   CENTRAL_DIRECTORY_END : "\x50\x4b\x05\x06",
   ZIP64_CENTRAL_DIRECTORY_LOCATOR : "\x50\x4b\x06\x07",
   ZIP64_CENTRAL_DIRECTORY_END : "\x50\x4b\x06\x06",
   DATA_DESCRIPTOR : "\x50\x4b\x07\x08"
};

// Default properties for a new file
JSZip.defaults = {
   base64: false,
   binary: false,
   dir: false,
   date: null
};


JSZip.prototype = (function ()
{
   /**
    * A simple object representing a file in the zip file.
    * @constructor
    * @param {string} name the name of the file
    * @param {string} data the data
    * @param {Object} options the options of the file
    */
   var ZipObject = function (name, data, options) {
      this.name = name;
      this.data = data;
      this.options = options;
   };

   ZipObject.prototype = {
      /**
       * Return the content as UTF8 string.
       * @return {string} the UTF8 string.
       */
      asText : function ()
      {
         return this.options.binary ? JSZip.prototype.utf8decode(this.data) : this.data;
      },
      /**
       * Returns the binary content.
       * @return {string} the content as binary.
       */
      asBinary : function ()
      {
         return this.options.binary ? this.data : JSZip.prototype.utf8encode(this.data);
      }
   };

   /**
    * Transform an integer into a string in hexadecimal.
    * @private
    * @param {number} dec the number to convert.
    * @param {number} bytes the number of bytes to generate.
    * @returns {string} the result.
    */
   var decToHex = function(dec, bytes) {
      var hex = "", i;
      for(i = 0; i < bytes; i++)
      {
         hex += String.fromCharCode(dec&0xff);
         dec=dec>>>8;
      }
      return hex;
   };

   /**
    * Merge the objects passed as parameters into a new one.
    * @private
    * @param {...Object} var_args All objects to merge.
    * @return {Object} a new object with the data of the others.
    */
   var extend = function () {
      var result = {}, i, attr;
      for (i = 0; i < arguments.length; i++) // arguments is not enumerable in some browsers
      {
         for (attr in arguments[i])
         {
            if(typeof result[attr] === "undefined")
            {
               result[attr] = arguments[i][attr];
            }
         }
      }
      return result;
   };

   /**
    * Transforms the (incomplete) options from the user into the complete
    * set of options to create a file.
    * @private
    * @param {Object} o the options from the user.
    * @return {Object} the complete set of options.
    */
   var prepareFileAttrs = function (o) {
      o = o || {};
      if (o.base64 === true && o.binary == null) {
         o.binary = true;
      }
      o = extend(o, JSZip.defaults);
      o.date = o.date || new Date();

      return o;
   };

  /**
   * Add a file in the current folder.
   * @private
   * @param {string} name the name of the file
   * @param {string} data the data of the file
   * @param {Object} o the options of the file
   * @return {Object} the new file.
   */
   var fileAdd = function (name, data, o) {
      // be sure sub folders exist
      var parent = parentFolder(name);
      if (parent) {
         folderAdd.call(this, parent);
      }

      o = prepareFileAttrs(o);

      return this.files[name] = {name: name, data: data, options:o};
   };


   /**
    * Find the parent folder of the path.
    * @private
    * @param {string} path the path to use
    * @return {string} the parent folder, or ""
    */
   var parentFolder = function (path) {
      if (path.slice(-1) == '/')
      {
         path = path.substring(0, path.length - 1);
      }
      var lastSlash = path.lastIndexOf('/');
      return (lastSlash > 0) ? path.substring(0, lastSlash) : "";
   };

   /**
    * Add a (sub) folder in the current folder.
    * @private
    * @param {string} name the folder's name
    * @return {Object} the new folder.
    */
   var folderAdd = function (name) {
      // Check the name ends with a /
      if (name.slice(-1) != "/") {
         name += "/"; // IE doesn't like substr(-1)
      }

      // Does this folder already exist?
      if (!this.files[name])
      {
         // be sure sub folders exist
         var parent = parentFolder(name);
         if (parent) {
            folderAdd.call(this, parent);
         }

         fileAdd.call(this, name, '', {dir:true});
      }
      return this.files[name];
   };

   /**
    * Generate the data found in the local header of a zip file.
    * Do not create it now, as some parts are re-used later.
    * @private
    * @param {Object} file the file to use.
    * @param {string} utfEncodedFileName the file name, utf8 encoded.
    * @param {string} compressionType the compression to use.
    * @return {Object} an object containing header and compressedData.
    */
   var prepareLocalHeaderData = function(file, utfEncodedFileName, compressionType) {
      var useUTF8 = utfEncodedFileName !== file.name,
          data    = file.data,
          o       = file.options,
          dosTime,
          dosDate;

      // date
      // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
      // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
      // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html

      dosTime = o.date.getHours();
      dosTime = dosTime << 6;
      dosTime = dosTime | o.date.getMinutes();
      dosTime = dosTime << 5;
      dosTime = dosTime | o.date.getSeconds() / 2;

      dosDate = o.date.getFullYear() - 1980;
      dosDate = dosDate << 4;
      dosDate = dosDate | (o.date.getMonth() + 1);
      dosDate = dosDate << 5;
      dosDate = dosDate | o.date.getDate();

      if (o.base64 === true) {
         data = JSZipBase64.decode(data);
      }
      // decode UTF-8 strings if we are dealing with text data
      if(o.binary === false) {
         data = this.utf8encode(data);
      }


      var compression    = JSZip.compressions[compressionType];
      var compressedData = compression.compress(data);

      var header = "";

      // version needed to extract
      header += "\x0A\x00";
      // general purpose bit flag
      // set bit 11 if utf8
      header += useUTF8 ? "\x00\x08" : "\x00\x00";
      // compression method
      header += compression.magic;
      // last mod file time
      header += decToHex(dosTime, 2);
      // last mod file date
      header += decToHex(dosDate, 2);
      // crc-32
      header += decToHex(this.crc32(data), 4);
      // compressed size
      header += decToHex(compressedData.length, 4);
      // uncompressed size
      header += decToHex(data.length, 4);
      // file name length
      header += decToHex(utfEncodedFileName.length, 2);
      // extra field length
      header += "\x00\x00";

      return {
         header:header,
         compressedData:compressedData
      };
   };


   // return the actual prototype of JSZip
   return {
      /**
       * Read an existing zip and merge the data in the current JSZip object.
       * The implementation is in jszip-load.js, don't forget to include it.
       * @param {string} stream  The stream to load
       * @param {Object} options Options for loading the stream.
       *  options.base64 : is the stream in base64 ? default : false
       * @return {JSZip} the current JSZip object
       */
      load : function (stream, options)
      {
         throw new Error("Load method is not defined. Is the file jszip-load.js included ?");
      },

      /**
       * Filter nested files/folders with the specified function.
       * @param {Function} search the predicate to use :
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       * @return {Array} An array of matching elements.
       */
      filter : function (search)
      {
         var result = [], filename, relativePath, file, fileClone;
         for (filename in this.files)
         {
            file = this.files[filename];
            // return a new object, don't let the user mess with our internal objects :)
            fileClone = new ZipObject(file.name, file.data, extend(file.options));
            relativePath = filename.slice(this.root.length, filename.length);
            if (filename.slice(0, this.root.length) === this.root && // the file is in the current root
                search(relativePath, fileClone)) // and the file matches the function
            {
               result.push(fileClone);
            }
         }
         return result;
      },

      /**
       * Add a file to the zip file, or search a file.
       * @param   {string|RegExp} name The name of the file to add (if data is defined),
       * the name of the file to find (if no data) or a regex to match files.
       * @param   {string} data  The file data, either raw or base64 encoded
       * @param   {Object} o     File options
       * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
       * a file (when searching by string) or an array of files (when searching by regex).
       */
      file : function(name, data, o)
      {
         if (arguments.length === 1)
         {
            if (name instanceof RegExp)
            {
               var regexp = name;
               return this.filter(function(relativePath, file) {
                  return !file.options.dir && regexp.test(relativePath);
               });
            }
            else // text
            {
               return this.filter(function (relativePath, file) {
                  return !file.options.dir && relativePath === name;
               })[0]||null;
            }
         }
         else // more than one argument : we have data !
         {
            name = this.root+name;
            fileAdd.call(this, name, data, o);
         }
         return this;
      },

      /**
       * Add a directory to the zip file, or search.
       * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
       * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
       */
      folder : function(arg)
      {
         if (!arg)
         {
            throw new Error("folder : wrong argument");
         }

         if (arg instanceof RegExp)
         {
            return this.filter(function(relativePath, file) {
               return file.options.dir && arg.test(relativePath);
            });
         }

         // else, name is a new folder
         var name = this.root + arg;
         var newFolder = folderAdd.call(this, name);

         // Allow chaining by returning a new object with this folder as the root
         var ret = this.clone();
         ret.root = newFolder.name;
         return ret;
      },

      /**
       * Delete a file, or a directory and all sub-files, from the zip
       * @param {string} name the name of the file to delete
       * @return {JSZip} this JSZip object
       */
      remove : function(name)
      {
         name = this.root + name;
         var file = this.files[name];
         if (!file)
         {
            // Look for any folders
            if (name.slice(-1) != "/") {
               name += "/";
            }
            file = this.files[name];
         }

         if (file)
         {
            if (!file.options.dir)
            {
               // file
               delete this.files[name];
            }
            else
            {
               // folder
               var kids = this.filter(function (relativePath, file) {
                  return file.name.slice(0, name.length) === name;
               });
               for (var i = 0; i < kids.length; i++)
               {
                  delete this.files[kids[i].name];
               }
            }
         }

         return this;
      },

      /**
       * Generate the complete zip file
       * @param {Object} options the options to generate the zip file :
       * - base64, true to generate base64.
       * - compression, "STORE" by default.
       * @return {string} the zip file
       */
      generate : function(options)
      {
         options = extend(options || {}, {
            base64 : true,
            compression : "STORE"
         });
         var compression = options.compression.toUpperCase();

         // The central directory, and files data
         var directory = [], files = [], fileOffset = 0;

         if (!JSZip.compressions[compression]) {
            throw compression + " is not a valid compression method !";
         }

         for (var name in this.files)
         {
            if( !this.files.hasOwnProperty(name) ) { continue; }

            var file = this.files[name];

            var utfEncodedFileName = this.utf8encode(file.name);

            var fileRecord = "",
            dirRecord = "",
            data = prepareLocalHeaderData.call(this, file, utfEncodedFileName, compression);
            fileRecord = JSZip.signature.LOCAL_FILE_HEADER + data.header + utfEncodedFileName + data.compressedData;

            dirRecord = JSZip.signature.CENTRAL_FILE_HEADER +
            // version made by (00: DOS)
            "\x14\x00" +
            // file header (common to file and central directory)
            data.header +
            // file comment length
            "\x00\x00" +
            // disk number start
            "\x00\x00" +
            // internal file attributes TODO
            "\x00\x00" +
            // external file attributes
            (this.files[name].dir===true?"\x10\x00\x00\x00":"\x00\x00\x00\x00")+
            // relative offset of local header
            decToHex(fileOffset, 4) +
            // file name
            utfEncodedFileName;

            fileOffset += fileRecord.length;

            files.push(fileRecord);
            directory.push(dirRecord);
         }

         var fileData = files.join("");
         var dirData = directory.join("");

         var dirEnd = "";

         // end of central dir signature
         dirEnd = JSZip.signature.CENTRAL_DIRECTORY_END +
         // number of this disk
         "\x00\x00" +
         // number of the disk with the start of the central directory
         "\x00\x00" +
         // total number of entries in the central directory on this disk
         decToHex(files.length, 2) +
         // total number of entries in the central directory
         decToHex(files.length, 2) +
         // size of the central directory   4 bytes
         decToHex(dirData.length, 4) +
         // offset of start of central directory with respect to the starting disk number
         decToHex(fileData.length, 4) +
         // .ZIP file comment length
         "\x00\x00";

         var zip = fileData + dirData + dirEnd;
         return (options.base64) ? JSZipBase64.encode(zip) : zip;
      },

      /**
       *
       *  Javascript crc32
       *  http://www.webtoolkit.info/
       *
       */
      crc32 : function(str, crc)
      {

         if (str === "" || typeof str === "undefined") {
            return 0;
         }

         var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

         if (typeof(crc) == "undefined") { crc = 0; }
         var x = 0;
         var y = 0;

         crc = crc ^ (-1);
         for( var i = 0, iTop = str.length; i < iTop; i++ ) {
            y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
            x = "0x" + table.substr( y * 9, 8 );
            crc = ( crc >>> 8 ) ^ x;
         }

         return crc ^ (-1);

      },

      // Inspired by http://my.opera.com/GreyWyvern/blog/show.dml/1725165
      clone : function()
      {
         var newObj = new JSZip();
         for (var i in this)
         {
            if (typeof this[i] !== "function")
            {
               newObj[i] = this[i];
            }
         }
         return newObj;
      },


      /**
       * http://www.webtoolkit.info/javascript-utf8.html
       */
      utf8encode : function (string) {
         string = string.replace(/\r\n/g,"\n");
         var utftext = "";

         for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
               utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
               utftext += String.fromCharCode((c >> 6) | 192);
               utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
               utftext += String.fromCharCode((c >> 12) | 224);
               utftext += String.fromCharCode(((c >> 6) & 63) | 128);
               utftext += String.fromCharCode((c & 63) | 128);
            }

         }

         return utftext;
      },

      /**
       * http://www.webtoolkit.info/javascript-utf8.html
       */
      utf8decode : function (utftext) {
         var string = "";
         var i = 0;
         var c = 0, c1 = 0, c2 = 0, c3 = 0;

         while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
               string += String.fromCharCode(c);
               i++;
            }
            else if((c > 191) && (c < 224)) {
               c2 = utftext.charCodeAt(i+1);
               string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
               i += 2;
            }
            else {
               c2 = utftext.charCodeAt(i+1);
               c3 = utftext.charCodeAt(i+2);
               string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
               i += 3;
            }

         }

         return string;
      }
   };
}());

/*
 * Compression methods
 * This object is filled in as follow :
 * name : {
 *    magic // the 2 bytes indentifying the compression method
 *    compress // function, take the uncompressed content and return it compressed.
 *    uncompress // function, take the compressed content and return it uncompressed.
 * }
 *
 * STORE is the default compression method, so it's included in this file.
 * Other methods should go to separated files : the user wants modularity.
 */
JSZip.compressions = {
   "STORE" : {
      magic : "\x00\x00",
      compress : function (content)
      {
         return content; // no compression
      },
      uncompress : function (content)
      {
         return content; // no compression
      }
   }
};

/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 *  Hacked so that it doesn't utf8 en/decode everything
 **/
var JSZipBase64 = (function() {
   // private property
   var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

   return {
      // public method for encoding
      encode : function(input, utf8) {
         var output = "";
         var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
         var i = 0;

         while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
               enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
               enc4 = 64;
            }

            output = output +
               _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
               _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

         }

         return output;
      },

      // public method for decoding
      decode : function(input, utf8) {
         var output = "";
         var chr1, chr2, chr3;
         var enc1, enc2, enc3, enc4;
         var i = 0;

         input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

         while (i < input.length) {

            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
               output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
               output = output + String.fromCharCode(chr3);
            }

         }

         return output;

      }
   };
}());

// enforcing Stuk's coding style
// vim: set shiftwidth=3 softtabstop=3:


// Force JSZip into current scope object
this.JSZip = JSZip;

define("lib/jszip", (function (global) {
    return function () {
        return global.JSZip;
    }
}(this)));

/**
 * @license RequireJS text 2.0.3 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

define('text',['module'], function (module) {
    

    var text, fs,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [],
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.3',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var strip = false, index = name.indexOf("."),
                modName = name.substring(0, index),
                ext = name.substring(index + 1, name.length);

            index = ext.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = ext.substring(index + 1, ext.length);
                strip = strip === "strip";
                ext = ext.substring(0, index);
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + '.' +
                                     parsed.ext) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node)) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback) {
            var file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file.indexOf('\uFEFF') === 0) {
                file = file.substring(1);
            }
            callback(file);
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback) {
            var xhr = text.createXhr();
            xhr.open('GET', url, true);

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                stringBuffer.append(line);

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    }

    return text;
});

define('text!text/generate_pass.rb',[],function () { return '# This file can\'t have any double quotes in it, because it will actually be\n# passed in as a quoted parameter to the ruby command-line executable.\n\nrequire \'base64\'\nrequire \'digest/sha1\'\nrequire \'fileutils\'\nrequire \'openssl\'\nrequire \'tmpdir\'\n\ndef generate_pass(pass_name, zip_data, key_data, password)\n\n    # Clear the screen first\n    200.times { |i| puts }\n\n    # Load the key and certificate\n    puts \'==> Loading key and certificate\'\n    p12 = OpenSSL::PKCS12.new(Base64.decode64(key_data), password)\n    cert = p12.certificate\n    key = p12.key\n\n    # Extract teamIdentifier and passTypeIdentifier from certificate\n    puts \'==> Looking for developer data\'\n    team_identifier = nil;\n    pass_type_identifier = nil;\n    cert.subject.to_a.each do |part|\n        part_type = part[0]\n        part_value = part[1]\n\n        if part_type == \'OU\'\n            team_identifier = part_value\n            puts \'    Found Team Identifier: \' + team_identifier\n        elsif part_type == \'UID\'\n            pass_type_identifier = part_value\n            puts \'    Found Pass Type Identifier: \' + pass_type_identifier\n        end\n    end\n\n    # Create a temporary directory for file work (automatically deleted)\n    puts \'==> Creating temporary directory\'\n    Dir.mktmpdir do |dir|\n\n        FileUtils.cd dir do |cwd|\n\n            # Unpack the current zip file\n            # (unzipping requires an extra library, so use the command-line version)\n            puts \'==> Decoding and unzipping pass data\'\n            open \'infile.zip\', \'w\' do |io| io.write Base64.decode64(zip_data) end\n            system \'unzip infile.zip\'\n            File.delete \'infile.zip\';\n\n            # Load the WWDR cert\n            puts \'==> Loading WWDR certificate\'\n            wwdr = OpenSSL::X509::Certificate.new(File.read \'wwdr.pem\')\n            File.delete \'wwdr.pem\'\n\n            # Replace placeholder values with teamIdentifier and passTypeIdentifier\n            puts \'==> Injecting developer data into pass.json\'\n            pass_text = File.read(\'pass.json\')\n            File.open(\'pass.json\', \'w\') { |file| file.write pass_text.gsub(\'**TEAM_IDENTIFIER**\', team_identifier)\n                                                                     .gsub(\'**PASS_TYPE_IDENTIFIER**\', pass_type_identifier) }\n\n            # Calculate the checksum for pass.json, now that it\'s in its final state\n            puts \'==> Calculating SHA-1 sum for new pass.json\'\n            pass_sha1 = Digest::SHA1.hexdigest File.read(\'pass.json\')\n\n            # Inject pass.json checksum into pass manifest\n            puts \'==> Injecting SHA-1 sum for new pass.json into pass manifest\'\n            manifest_text = File.read(\'manifest.json\')\n            File.open(\'manifest.json\', \'w\') { |file| file.write manifest_text.gsub(\'**PASS_SHA1**\', pass_sha1) }\n\n            # Sign the manifest\n            puts \'==> Signing pass manifest\'\n            signature = OpenSSL::PKCS7::sign(cert, key, File.read(\'manifest.json\'), [wwdr],\n                                             OpenSSL::PKCS7::BINARY | OpenSSL::PKCS7::NOATTR | OpenSSL::PKCS7::DETACHED)\n            open \'signature\', \'w\' do |io| io.write signature.to_der end\n\n            # Package up the final pass\n            # (creating zip files requires an extra library, so use the command-line version)\n            puts \'==> Creating final pass file\'\n            system \'zip -r \' + pass_name + \'.pkpass *\'\n\n            # Copy final pass to Desktop\n            puts \'==> Copying pass file to desktop\'\n            FileUtils.cp pass_name + \'.pkpass\', File.expand_path(\'~/Desktop\')\n\n            puts \'==> Done! It is now safe to exit. Your pass should be on your desktop.\'\n\n        end\n    end\nend\n\ngenerate_pass(\'**PASS_NAME**\',\n\n              # Zip data\n              \'**ZIP_DATA**\',\n              \n              # Key data\n              \'**KEY_DATA**\',\n             \n              # Password (to be filled in by AppleScript)\n              \'**PASSWORD**\')\n';});

define('text!text/generate_pass.scpt',[],function () { return 'set rubyCommand to "echo \\"\n\n**RUBY_FILE_CONTENT**\n\n    \\" | ruby"\n\non replace_chars(this_text, search_string, replacement_string)\n    set AppleScript\'s text item delimiters to the search_string\n    set the item_list to every text item of this_text\n    set AppleScript\'s text item delimiters to the replacement_string\n    set this_text to the item_list as string\n    set AppleScript\'s text item delimiters to ""\n    return this_text\nend replace_chars\n\ndisplay dialog "Enter the password for your key/certificate file:" default answer "" with hidden answer\n\nset rubyCommand to replace_chars(rubyCommand, "**PASSWORD**", text returned of result)\n\ntell application "Terminal"\n    activate\n    set currentTab to do script rubyCommand\nend tell\n';});

define('text!text/WWDR.pem',[],function () { return '-----BEGIN CERTIFICATE-----\nMIIEIzCCAwugAwIBAgIBGTANBgkqhkiG9w0BAQUFADBiMQswCQYDVQQGEwJVUzET\nMBEGA1UEChMKQXBwbGUgSW5jLjEmMCQGA1UECxMdQXBwbGUgQ2VydGlmaWNhdGlv\nbiBBdXRob3JpdHkxFjAUBgNVBAMTDUFwcGxlIFJvb3QgQ0EwHhcNMDgwMjE0MTg1\nNjM1WhcNMTYwMjE0MTg1NjM1WjCBljELMAkGA1UEBhMCVVMxEzARBgNVBAoMCkFw\ncGxlIEluYy4xLDAqBgNVBAsMI0FwcGxlIFdvcmxkd2lkZSBEZXZlbG9wZXIgUmVs\nYXRpb25zMUQwQgYDVQQDDDtBcHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0\naW9ucyBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBAMo4VKbLVqrIJDlI6Yzu7F+4fyaRvDRTes58Y4Bhd2RepQcj\ntjn+UC0VVlhwLX7EbsFKhT4v8N6EGqFXya97GP9q+hUSSRUIGayq2yoy7ZZjaFIV\nPYyK7L9rGJXgA6wBfZcFZ84OhZU3au0Jtq5nzVFkn8Zc0bxXbmc1gHY2pIeBbjiP\n2CsVTnsl2Fq/ToPBjdKT1RpxtWCcnTNOVfkSWAyGuBYNweV3RY1QSLorLeSUheHo\nxJ3GaKWwo/xnfnC6AllLd0KRObn1zeFM78A7SIym5SFd/Wpqu6cWNWDS5q3zRinJ\n6MOL6XnAamFnFbLw/eVovGJfbs+Z3e8bY/6SZasCAwEAAaOBrjCBqzAOBgNVHQ8B\nAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUiCcXCam2GGCL7Ou6\n9kdZxVJUo7cwHwYDVR0jBBgwFoAUK9BpR5R2Cf70a40uQKb3R01/CF4wNgYDVR0f\nBC8wLTAroCmgJ4YlaHR0cDovL3d3dy5hcHBsZS5jb20vYXBwbGVjYS9yb290LmNy\nbDAQBgoqhkiG92NkBgIBBAIFADANBgkqhkiG9w0BAQUFAAOCAQEA2jIAlsVUlNM7\ngjdmfS5o1cPGuMsmjEiQzxMkakaOY9Tw0BMG3djEwTcV8jMTOSYtzi5VQOMLA6/6\nEsLnDSG41YDPrCgvzi2zTq+GGQTG6VDdTClHECP8bLsbmGtIieFbnd5G2zWFNe8+\n0OJYSzj07XVaH1xwHVY5EuXhDRHkiSUGvdW0FY5e0FmXkOlLgeLfGK9EdB4ZoDpH\nzJEdOusjWv6lLZf3e7vWh0ZChetSPSayY6i0scqP9Mzis8hH4L+aWYP62phTKoL1\nfGUuldkzXfXtZcwxN8VaBOhr4eeIA0p1npsoy0pAiGVDdd3LOiUjxZ5X+C7O0qmS\nXnMuLyV1FQ==\n-----END CERTIFICATE-----\n';});

define('model/PassPackage',['Utility',
        'lib/jszip',
        'text!text/generate_pass.rb',
        'text!text/generate_pass.scpt',
        'text!text/WWDR.pem'],
        
function(Utility, JSZip, rubyText, appleScriptText, wwdrCert) {

    

    function PassPackage(pass) {
        this.pass = pass;
    }

    PassPackage.prototype = {

        _getManifestData: function(passData, zip, callback, omitCertData) {
            var manifest = {};

            manifest['pass.json'] = omitCertData ? '**PASS_SHA1**' : Utility.sha1(passData);

            var pendingUploads = 0;

            var returnIfReady = function() {
                if (pendingUploads < 1) callback(JSON.stringify(manifest, null, '    '));
            };

            var loadIfExists = function(image, imageName) {
                if (image) {
                    pendingUploads ++;
                    Utility.sha1File(image, function(sha1, fileData) {
                        manifest[imageName] = sha1;
                        zip.file(imageName, fileData, { binary: true });
                        pendingUploads --;
                        returnIfReady();
                    });
                }
            };

            loadIfExists(this.backgroundImage, 'background.png');
            loadIfExists(this.retinaBackgroundImage, 'background@2x.png');
            loadIfExists(this.footerImage, 'footer.png');
            loadIfExists(this.retinaFooterImage, 'footer@2x.png');
            loadIfExists(this.iconImage, 'icon.png');
            loadIfExists(this.retinaIconImage, 'icon@2x.png');
            loadIfExists(this.logoImage, 'logo.png');
            loadIfExists(this.retinaLogoImage, 'logo@2x.png');
            loadIfExists(this.stripImage, 'strip.png');
            loadIfExists(this.retinaStripImage, 'strip@2x.png');
            loadIfExists(this.thumbnailImage, 'thumbnail.png');
            loadIfExists(this.retinaThumbnailImage, 'thumbnail@2x.png');

            returnIfReady();
        },

        toZip: function(callback) {
            return this._toZip(callback);
        },
        
        _toZip: function(callback, omitCertData) {
            var passData = JSON.stringify(this.pass.toJSON({ omitCertData: !!omitCertData} ), null, '    ') + '\n';
            var zip = new JSZip();

            this._getManifestData(passData, zip, function(manifestData) {
                zip.file('pass.json', passData, zip);
                zip.file('manifest.json', manifestData);
                zip.file('wwdr.pem', wwdrCert);
                
                callback(zip.generate());
            }, omitCertData);
        },

        toZipDataUrl: function(callback) {
            return this.toZip(function(data) {
                callback('data:application/zip;base64,' + data);
            });
        },

        toAppleScript: function(callback) {
            return this._toZip(function(zipData) {
                Utility.base64File(this.keyFile, function(keyData) {
                    var ruby = rubyText.replace('**PASS_NAME**', this.passFileName || 'Pass')
                                       .replace('**ZIP_DATA**', Utility.lineBreakRubyStringLiteral(zipData))
                                       .replace('**KEY_DATA**', Utility.lineBreakRubyStringLiteral(keyData));
                    var appleScript = appleScriptText.replace('**RUBY_FILE_CONTENT**', ruby.replace(/^/gm, '        '));

                    callback(appleScript);
                }.bind(this));
            }.bind(this), true);
        },

        toAppleScriptDataUrl: function(callback) {
            this.toAppleScript(function(script) {
                callback('data:application/x-applescript;base64,' + Utility.base64(script));
            });
        }
    };

    Object.defineProperties(PassPackage.prototype, {
        pass: {
            configurable: false,
            get: function() { return this._pass; },
            set: function(val) { this._pass = val; }
        },

        passFileName: {
            configurable: false,
            get: function() { return this._passFileName; },
            set: function(val) {
                Utility.validateType(val, String);
                this._passFileName = val;
            }
        },

        keyFile: {
            configurable: false,
            get: function() { return this._keyFile; },
            set: function(val) {
                Utility.validateType(val, File);
                this._keyFile = val;
            }
        },

        backgroundImage: {
            configurable: false,
            get: function() { return this._backgroundImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._backgroundImage = val;
            }
        },

        retinaBackgroundImage: {
            configurable: false,
            get: function() { return this._retinaBackgroundImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaBackgroundImage = val;
            }
        },

        footerImage: {
            configurable: false,
            get: function() { return this._footerImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._footerImage = val;
            }
        },

        retinaFooterImage: {
            configurable: false,
            get: function() { return this._retinaFooterImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaFooterImage = val;
            }
        },

        iconImage: {
            configurable: false,
            get: function() { return this._iconImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._iconImage = val;
            }
        },

        retinaIconImage: {
            configurable: false,
            get: function() { return this._retinaIconImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaIconImage = val;
            }
        },

        logoImage: {
            configurable: false,
            get: function() { return this._logoImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._logoImage = val;
            }
        },

        retinaLogoImage: {
            configurable: false,
            get: function() { return this._retinaLogoImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaLogoImage = val;
            }
        },

        stripImage: {
            configurable: false,
            get: function() { return this._stripImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._stripImage = val;
            }
        },

        retinaStripImage: {
            configurable: false,
            get: function() { return this._retinaStripImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaStripImage = val;
            }
        },

        thumbnailImage: {
            configurable: false,
            get: function() { return this._thumbnailImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._thumbnailImage = val;
            }
        },

        retinaThumbnailImage: {
            configurable: false,
            get: function() { return this._retinaThumbnailImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaThumbnailImage = val;
            }
        }
    });

    Object.freeze(PassPackage.prototype);

    return PassPackage;

});
define('model/PassStyle',[],function() {
	
	

    var PassStyle = {
        BoardingPass: 'boardingPass',
        Coupon: 'coupon',
        EventTicket: 'eventTicket',
        Generic: 'generic',
        StoreCard: 'storeCard'
    };

    return Object.freeze(PassStyle);
});

define('model/Pass',['Utility',
        'model/FieldSet',
        'model/Barcode',
        'model/Color',
        'model/PassPackage',
        'model/PassStyle'],
       
function(Utility, FieldSet, Barcode, Color, PassPackage) {

    

    function Pass(args) {
        this._packageData = null;

        // Standard keys
        this._description = null;
        this._formatVersion = 1;
        this._organizationName = null;
        this._passTypeIdentifier = null;
        this._serialNumber = null;
        this._teamIdentifier = null;

        // Associated app keys
        this._associatedStoreIdentifiers = [];

        // Relevance keys
        this._locations = [];
        this._relevantDate = null;

        // Style keys
        this._headerFields = new FieldSet();
        this._primaryFields = new FieldSet();
        this._secondaryFields = new FieldSet();
        this._auxiliaryFields = new FieldSet();
        this._backFields = new FieldSet();

        // Visual appearance keys
        this._barcode = null;
        this._backgroundColor = null;
        this._foregroundColor = null;
        this._labelColor = null;
        this._logoText = null;
        this._suppressStripShine = null;

        // Web service keys
        this._authenticationToken = null;
        this._webServiceURL = null;

        if (args) {
            if (args.description) this.description = args.description;
            if (args.organizationName) this.organizationName = args.organizationName;
            if (args.passTypeIdentifier) this.passTypeIdentifier = args.passTypeIdentifier;
            if (args.serialNumber) this.serialNumber = args.serialNumber;
            if (args.teamIdentifier) this.teamIdentifier = args.teamIdentifier;

            if (args.associatedStoreIdentifiers) this.associatedStoreIdentifiers = args.associatedStoreIdentifiers;
            
            if (args.locations) this.locations = args.locations;
            if (args.relevantDate) this.relevantDate = args.relevantDate;

            if (args.barcode) this.barcode = args.barcode;
            if (args.backgroundColor) this.backgroundColor = args.backgroundColor;
            if (args.foregroundColor) this.foregroundColor = args.foregroundColor;
            if (args.labelColor) this.labelColor = args.labelColor;
            if (args.logoColor) this.logoColor = args.logoColor;
            if (args.suppressStripShine !== undefined) this.suppressStripShine = args.suppressStripShine;

            if (args.authenticationToken) this.authenticationToken = args.authenticationToken;
            if (args.webserviceURL) this.webServiceURL = args.webServiceURL;
            
            if (args.fileName) this.fileName = args.fileName;
            if (args.keyFile) this.keyFile = args.keyFile;
            if (args.backgroundImage) this.backgroundImage = args.backgroundImage;
            if (args.retinaBackgroundImage) this.retinaBackgroundImage = args.retinaBackgroundImage;
            if (args.footerImage) this.footerImage = args.footerImage;
            if (args.retinaFooterImage) this.retinaFooterImage = args.retinaFooterImage;
            if (args.iconImage) this.iconImage = args.iconImage;
            if (args.retinaIconImage) this.retinaIconImage = args.retinaIconImage;
            if (args.logoImage) this.logoImage = args.logoImage;
            if (args.retinaLogoImage) this.retinaLogoImage = args.retinaLogoImage;
            if (args.stripImage) this.stripImage = args.stripImage;
            if (args.retinaStripImage) this.retinaStripImage = args.retinaStripImage;
        }
    }
    
    Pass.prototype = {
        addHeaderField: function(name, args) { this.headerFields.addField(name, args);  },
        removeHeaderField: function(name) { this.headerFields.removeField(name); },

        addPrimaryField: function(name, args) { this.primaryFields.addField(name, args);  },
        removePrimaryField: function(name) { this.primaryFields.removeField(name); },

        addSecondaryField: function(name, args) { this.secondaryFields.addField(name, args);  },
        removeSecondaryField: function(name) { this.secondaryFields.removeField(name); },

        addAuxiliaryField: function(name, args) { this.auxiliaryFields.addField(name, args);  },
        removeAuxiliaryField: function(name) { this.auxiliaryFields.removeField(name); },

        addBackField: function(name, args) { this.backFields.addField(name, args);  },
        removeBackField: function(name) { this.backFields.removeField(name); },

        toZip: function(callback) { return this.packageData.toZip(callback); },
        toZipDataUrl: function(callback) { return this.packageData.toZipDataUrl(callback); },

        toAppleScript: function(callback) { return this.packageData.toAppleScript(callback); },
        toAppleScriptDataUrl: function(callback) { return this.packageData.toAppleScriptDataUrl(callback); },

        // args = {omitCertData: true}
        toJSON: function(args) {
            var omitCertData = !!(args && args.omitCertData);

            var errorMessage = 'Pass not ready to be serialized. Property not yet defined: ';

            var throwPropertyError = function(p) { throw new Error(errorMessage + p); };

            // Standard (required) keys

            if (!this.description) throwPropertyError('description');
            if (!this.organizationName) throwPropertyError('organizationName');
            if (!this.passTypeIdentifier && !omitCertData) throwPropertyError('passTypeIdentifier');
            if (!this.serialNumber) throwPropertyError('serialNumber');
            if (!this.teamIdentifier && !omitCertData) throwPropertyError('teamIdentifier');

            var result = {
                description: this.description,
                formatVersion: this._formatVersion,
                organizationName: this.organizationName,
                passTypeIdentifier: omitCertData ? '**PASS_TYPE_IDENTIFIER**' : this.passTypeIdentifier,
                serialNumber: this.serialNumber,
                teamIdentifier: omitCertData ? '**TEAM_IDENTIFIER**' : this.teamIdentifier
            };

            // Associated app keys
            if (this.associatedStoreIdentifiers.length > 0) result.associatedStoreIdentifiers = this.associatedStoreIdentifiers;

            // Relevance keys
            if (this.locations.length > 0) result.locations = this.locations;
            if (this.relevantDate) result.relevantDate = this.relevantDate;

            // Style keys
            var styleDict = {};

            if (this.headerFields.length > 0) styleDict.headerFields = this.headerFields;
            if (this.primaryFields.length > 0) styleDict.primaryFields = this.primaryFields;
            if (this.secondaryFields.length > 0) styleDict.secondaryFields = this.secondaryFields;
            if (this.auxiliaryFields.length > 0) styleDict.auxiliaryFields = this.auxiliaryFields;
            if (this.backFields.length > 0) styleDict.backFields = this.backFields;

            result[this.styleKey] = styleDict;

            // Visual appaerance keys
            if (this.barcode) result.barcode = this.barcode;
            if (this.backgroundColor) result.backgroundColor = this.backgroundColor;
            if (this.foregroundColor) result.foregroundColor = this.foregroundColor;
            if (this.labelColor) result.labelColor = this.labelColor;
            if (this.logoText) result.logoText = this.logoText;
            if (this.suppressStripShine) result.suppressStripShine = this.suppressStripShine;

            // Web service keys
            if (this.authenticationToken) result.authenticationToken = this.authenticationToken;
            if (this.webServiceURL) result.webServiceURL = this.webServiceURL;

            return result;
       }
    };

    Object.defineProperties(Pass.prototype, {

        packageData: {
            configurable: false,
            get: function() {
                if (!this._packageData) {
                    this._packageData = new PassPackage(this);
                }

                return this._packageData;
            }
        },

        // Package data

        fileName: {
            configurable: false,
            get: function() { return this.packageData.passFileName; },
            set: function(val) { return this.packageData.passFileName = val; }
        },

        keyFile: {
            configurable: false,
            get: function() { return this.packageData.keyFile; },
            set: function(val) { return this.packageData.keyFile = val; }
        },

        backgroundImage: {
            configurable: false,
            get: function() { return this.packageData.backgroundImage; },
            set: function(val) { return this.packageData.backgroundImage = val; }
        },

        retinaBackgroundImage: {
            configurable: false,
            get: function() { return this.packageData.retinaBackgroundImage; },
            set: function(val) { return this.packageData.retinaBackgroundImage = val; }
        },

        footerImage: {
            configurable: false,
            get: function() { return this.packageData.retinaBackgroundImage; },
            set: function(val) { return this.packageData.retinaBackgroundImage = val; }
        },

        retinaFooterImage: {
            configurable: false,
            get: function() { return this.packageData.retinaBackgroundImage; },
            set: function(val) { return this.packageData.retinaBackgroundImage = val; }
        },

        iconImage: {
            configurable: false,
            get: function() { return this.packageData.iconImage; },
            set: function(val) { return this.packageData.iconImage = val; }
        },

        retinaIconImage: {
            configurable: false,
            get: function() { return this.packageData.retinaIconImage; },
            set: function(val) { return this.packageData.retinaIconImage = val; }
        },

        logoImage: {
            configurable: false,
            get: function() { return this.packageData.logoImage; },
            set: function(val) { return this.packageData.logoImage = val; }
        },

        retinaLogoImage: {
            configurable: false,
            get: function() { return this.packageData.retinaLogoImage; },
            set: function(val) { return this.packageData.retinaLogoImage = val; }
        },

        stripImage: {
            configurable: false,
            get: function() { return this.packageData.stripImage; },
            set: function(val) { return this.packageData.stripImage = val; }
        },

        retinaStripImage: {
            configurable: false,
            get: function() { return this.packageData.retinaStripImage; },
            set: function(val) { return this.packageData.retinaStripImage = val; }
        },

        thumbnailImage: {
            configurable: false,
            get: function() { return this.packageData.thumbnailImage; },
            set: function(val) { return this.packageData.thumbnailImage = val; }
        },

        retinaThumbnailImage: {
            configurable: false,
            get: function() { return this.packageData.retinaThumbnailImage; },
            set: function(val) { return this.packageData.retinaThumbnailImage = val; }
        },
        // Style key (implemented by child classes)

        styleKey: {
            configurable: false,
            get: function() { throw new Error('Method must be called from child class'); }
        },

        // Standard keys

        description: {
            configurable: false,
            get: function() { return this._description; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._description = val;
            }
        },
         
        formatVersion: {
            configurable: false,
            get: function() { return this._formatVersion; }
        },

        organizationName: {
            configurable: false,
            get: function() { return this._organizationName; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._organizationName = val;
            }
        },

        passTypeIdentifier: {
            configurable: false,
            get: function() { return this._passTypeIdentifier; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._passTypeIdentifier = val;
            }
        },

        serialNumber: {
            configurable: false,
            get: function() { return this._serialNumber; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._serialNumber = val;
            }
        },

        teamIdentifier: {
            configurable: false,
            get: function() { return this._teamIdentifier; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._teamIdentifier = val;
            }
        },

        // Associated app keys

        associatedStoreIdentifiers: {
            configurable: false,
            get: function() { return this._associatedStoreIdentifiers; }
        },

        // Relevance keys
        
        locations: {
            configurable: false,
            get: function() { return this._locations; }
        },

        relevantDate: {
            configurable: false,
            get: function() { return this._relevantDate; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Date);
                this._relevantDate = val;
            }
        },

        // Style keys

        headerFields: {
            configurable: false,
            get: function() { return this._headerFields; }
        },

        primaryFields: {
            configurable: false,
            get: function() { return this._primaryFields; }
        },

        secondaryFields: {
            configurable: false,
            get: function() { return this._secondaryFields; }
        },

        auxiliaryFields: {
            configurable: false,
            get: function() { return this._auxiliaryFields; }
        },

        backFields: {
            configurable: false,
            get: function() { return this._backFields; }
        },

        // Visual appearance keys

        barcode: {
            configurable: false,
            get: function() { return this._barcode; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Barcode);
                this._barcode = val;
            }
        },

        backgroundColor: {
            configurable: false,
            get: function() { return this._backgroundColor; },
            set: function(val) {
                if (Utility.isCorrectType(val, String)) {
                    val = new Color(val);
                }

                Utility.validateTypeOrNull(val, Color);
                this._backgroundColor = val;
            }
        },

        foregroundColor: {
            configurable: false,
            get: function() { return this._foregroundColor; },
            set: function(val) {
                if (Utility.isCorrectType(val, String)) {
                    val = new Color(val);
                }

                Utility.validateTypeOrNull(val, Color);
                this._foregroundColor = val;
            }
        },

        labelColor: {
            configurable: false,
            get: function() { return this._labelColor; },
            set: function(val) {
                if (Utility.isCorrectType(val, String)) {
                    val = new Color(val);
                }

                Utility.validateTypeOrNull(val, Color);
                this._labelColor = val;
            }
        },

        logoText: {
            configurable: false,
            get: function() { return this._logoText; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._logoText = val;
            }
        },

        suppressStripShine: {
            configurable: false,
            get: function() { return this._suppressStripShine; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Boolean);
                this._suppressStripShine = val;
            }
        },

        // Web service keys

        authenticationToken: {
            configurable: false,
            get: function() { return this._authenticationToken; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._authenticationToken = val;
            }
        },

        webServiceURL: {
            configurable: false,
            get: function() { return this._webServiceURL; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._webServiceURL = val;
            }
        }
    });

    Object.freeze(Pass.prototype);

    return Pass;
});
define('model/TransitType',[],function() {

	

    var TransitType = {
        Air: 'PKTransitTypeAir',
        Boat: 'PKTransitTypeBoat',
        Bus: 'PKTransitTypeBus',
        Train: 'PKTransitTypeTrain'
    };

    return Object.freeze(TransitType);
});

define('model/BoardingPass',['Utility',
        'model/Pass',
        'model/PassStyle',
        'model/TransitType'],

function(Utility, Pass, PassStyle, TransitType) {

    

    function BoardingPass(args) {
        Pass.call(this, args);
        
        if (args) {
            if (args.transitType) this.transitType = args.transitType;
        }
    }

    BoardingPass.prototype = Object.create(new Pass(), {
    
    });

    Object.defineProperties(BoardingPass.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.BoardingPass; }
        },

        transitType: {
            configurable: false,
            get: function() { return this._transitType; },
            set: function(val) {
                Utility.validateType(val, TransitType);
                this._transitType = val;
            }
        }
    });

    Object.freeze(BoardingPass.prototype);

    return BoardingPass;
});

define('model/Coupon',['model/Pass',
        'model/PassStyle'],

function(Pass, PassStyle) {

    

    function Coupon(args) {
        Pass.call(this, args);
    }

    Coupon.prototype = Object.create(new Pass());

    Object.defineProperties(Coupon.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.Coupon; }
        }
    });

    Object.freeze(Coupon.prototype);

    return Coupon;
});

define('model/EventTicket',['model/Pass',
        'model/PassStyle'],

function(Pass, PassStyle) {

    

    function EventTicket(args) {
        Pass.call(this, args);
    }

    EventTicket.prototype = Object.create(new Pass());

    Object.defineProperties(EventTicket.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.EventTicket; }
        }
    });

    Object.freeze(EventTicket.prototype);

    return EventTicket;
});

define('model/GenericPass',['model/Pass',
        'model/PassStyle'],

function(Pass, PassStyle) {

    

    function GenericPass(args) {
        Pass.call(this, args);
    }

    GenericPass.prototype = Object.create(new Pass());

    Object.defineProperties(GenericPass.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.Generic; }
        }
    });

    Object.freeze(GenericPass.prototype);

    return GenericPass;
});

define('model/StoreCard',['model/Pass', 
        'model/PassStyle'],

function(Pass, PassStyle) {

    

    function StoreCard(args) {
        Pass.call(this, args);
    }

    StoreCard.prototype = Object.create(new Pass());

    Object.defineProperties(StoreCard.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.StoreCard; }
        }
    });

    Object.freeze(StoreCard.prototype);

    return StoreCard;
});

define('PassFactory',['model/Barcode', 'model/BarcodeFormat', 'model/BoardingPass', 'model/Color', 'model/Coupon', 'model/EventTicket', 'model/GenericPass', 'model/StoreCard', 'model/TextAlignment'],
        function(Barcode, BarcodeFormat, BoardingPass, Color, Coupon, EventTicket, GenericPass, StoreCard, TextAlignment) {

    var PassFactory = {

        // Pass types
        BoardingPass: BoardingPass,
        Coupon: Coupon,
        EventTicket: EventTicket,
        GenericPass: GenericPass,
        StoreCard: StoreCard,

        // Enums
        Barcode: Barcode,
        BarcodeFormat: BarcodeFormat,
        Color: Color,
        TextAlignment: TextAlignment

    };

    Object.freeze(PassFactory);

    return PassFactory;
});

define('BuildGlobal',['PassFactory'], function(PassFactory) { return window.PassFactory = PassFactory; });

require(["BuildGlobal"]);
}());