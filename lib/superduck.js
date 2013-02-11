/*
 * superduck
 * https://github.com/nek/superduck
 *
 * Copyright (c) 2012 Nek
 * Licensed under the MIT license.
 */
// {a:_, b:Number, c:Object}, {b:$, c: {a: $}}, function(b, a)
// {a:_, b:Number, c:Object}, unpack(_, b)({b:$, c: {a: $}}))(function(b, a) //{} )

/*jshint globalstrict: true */
"use strict";

var assert = function() {};
if (typeof console !== "undefined") assert = function(v,m) {console.assert(v,m);};

/*
functional Arrays
 */
function first(a) {return a[0];}
function last(a) {return a[a.length-1];}
function size(collection) {
    var length = collection ? collection.length : 0;
    return typeof length === 'number' ? length : keys(collection).length;
}

var objectTypes = {
    'boolean': false,
    'function': false,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
};

function _if(c,t,f) {
    return function(v) {
        if (c.apply(this, arguments)) return t.apply(this, arguments); else return f.apply(this, arguments);
    };
}

var toClass = {}.toString;

var is = {
    Array: function(a) {
        return toClass.call(a) === "[object Array]";
    },
    Number: function(n) {
        return typeof n === "number";
    },
    Function: function(f) {
        return typeof f === "function";
    },
    Object: function(value) {
        // check if the value is the ECMAScript language type of Object
        // http://es5.github.com/#x8
        // and avoid a V8 bug
        // http://code.google.com/p/v8/issues/detail?id=2291

        return value ? objectTypes[typeof value] : false;
    }
};

function _c() {
    var funcs = arguments;
    return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
            args = [funcs[length].apply(this, args)];
        }
        return args[0];
    };
}
/*
/*
 */
function _p(fn /*, args...*/) {
    // A reference to the Array#slice method.
    var slice = Array.prototype.slice;
    // Convert arguments object to an array, removing the first argument.
    var args = slice.call(arguments, 1);

    return function() {
        // Invoke the originally-specified function, passing in all originally-
        // specified arguments, followed by any just-specified arguments.
        return fn.apply(this, args.concat(slice.call(arguments, 0)));
    };
}

function identity(v) {return v;}

function map(f, a) {
    return Array.prototype.map.apply(a, [f]);
}

function accessor(path) {
    /*jshint evil: true */
    return new Function("o", "var res; try {res = o['" + path.join("']['") + "']} catch(e){} return res");
}

assert(accessor(["a"])({a:5}) === 5, "should be 5");
assert(accessor(["b"])({}) === undefined, "should be undefined");
assert(accessor(["a","b"])({a:{b:7}}) === 7, "should be 7");
assert(accessor(["5","9"])({"5":{'9':7}}) === 7, "should be 7");

/*
 * 1. match 1st
 * 2. match 2nd
 *
 * {a:$}
 * {b:$}
 * {a:1, b:2} -> ???
 * 1. throws error. not good because unpredictable at definition time but can fire unknown time later
 * 2. matchers shall match exactly. not good because kills flexibility of duck typed system
 * 3. runs the method which was defined first. looks like a good compromise
 */

var $ = identity;

function flatten(arr) {
    return arr.reduce(function(prev, curr) {
        if (is.Array(curr)) return prev.concat(flatten(curr));
        else return prev.concat(curr);
    }, []);
}

function parseNode ( path, o ) {
    if (is.Object(o)) {
        var r = Object.keys(o)
            .map(
            function(k) {
                var v = path.slice();
                v[v.length] = k;
                return parseNode( v, o[k] );
            });
        return flatten(r);
    }
    else return {path:path, value:o};
}

var destructor = _c(
    function(actions) {
        return function(o, f) {
            f.apply(o, actions.map(function(a){return a(o);}));
        };
    },
    _p(map, function(pv) {return _c(accessor(pv.path), pv.value);}),
    _p(parseNode, [])
);

var matcher = _c(
    function(actions) {
        return function(o, f) {
            f ( actions.map(function(a){return a(o);} ).reduce(function(prev, curr) {
                return prev && curr;
            }, true) );
        };
    },
    _p(map, function(pv) {var vv = pv.value; return _c(is.Function(vv) ? vv : function(v) { return v === vv;}, accessor(pv.path));}),
    _p(parseNode, [])
);

destructor({a:$})( {a:5}, function(a) {
    assert(a === 5, "should be 5");
});

destructor({a:{b:$}})({a:{ b:6}},
                      function(b) {
                          assert(b === 6, "should be 6");
                      });

destructor({a:$})( {a:5}, function(a) {
    assert(a === 5, "should be 5");
});

destructor({a:{b:$}})({a:{ b:6}},
                      function(b) {
                          assert(b === 6, "should be 6");
                      });

/*
функция берет обьект и генерирует функций, которые что-то там делают
1. деструктурирование сводится к функции identity или чему-то поинтереснее (первый эл. списка)
2. матчинг сводится к функциям, которые проверяют значение каким-то образом

в результате что-бы получить значения из обьекта можно просто замэпить список с каким то обьектом и передать полученный
список на вход функции-методу

для матчинга нужно полученный список заредьюсить для проверки что всё сплошное true

мультиметоды это такая функция которая берет обьект, список туплов (матчер, метод) и применяет


как отпарсить узел

 */


var superduck = function() {
    if(!(this instanceof superduck))
    {
        return new superduck();
    }

    this.$ = $;
    this.is = is;
    this.destructor = destructor;
    this.matcher = matcher;
};

(function(root) {
    if(typeof exports !== 'undefined') {
        exports = module.exports = superduck;
    } else {
        root.superduck = superduck;
    }
})(this);
