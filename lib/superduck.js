/*
 * superduck
 * https://github.com/nek/superduck
 *
 * Copyright (c) 2012 Nek
 * Licensed under the MIT license.
 */
// {a:_, b:Number, c:Object}, {b:$, c: {a: $}}, function(b, a)
// {a:_, b:Number, c:Object}, unpack(_, b)({b:$, c: {a: $}}))(function(b, a) //{} )

var assert = console.assert;

var is = {
    toClass: {}.toString,
    Array: function(a) {
        return is.toClass.call(a) === "[object Array]";
    },
    Number: function(n) {
        return typeof n === "number";
    },
    Function: function(f) {
        return typeof f === "function";
    }
};

var accessor = function(path) {
    return new Function("o", "return o['" + path.join("']['") + "']");
};

assert(accessor(["a"])({a:5}) === 5, "should be 5");
assert(accessor(["b"])({}) === undefined, "should be undefined");
assert(accessor(["a","b"])({a:{b:7}}) === 7, "should be 7");
assert(accessor(["5","9"])({"5":{'9':7}}) === 7, "should be 7");

var match = function(path, check) {
    var acc = accessor(path);
    return function(o){
        return check(acc(o));
    };
};

assert(match(["a"], function(v){return v === 5;})({a:5}) === true, "should match");
assert(match(["a"], is.Array)({a:[1]}) === true, "should match");

// TODO: what is the difference between {a:$,b:$} and {b:$,a:$}


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

var makeDestruct = function(accs) {
    return function(o, f) {
        var data = accs.map(accessor).map(function(acc) { return acc(o); });
        f.apply(o, data);
    };
};

var destructor = function(p) {
    return makeDestruct(parsePath(p));
};

var t = makeDestruct([["a"]]);
var obj = {a:5};
var test = function(a) {
    assert(a === 5, "should be 5");
};
t(obj, test);

var t = makeDestruct([["a"],["b"]]);
var obj = {a:5, b:6};
var test = function(a, b) {
    assert(a === 5, "should be 5");
    assert(b === 6, "should be 6");
};
t(obj, test);

var $ = function(){};

var parsePath = function(p) {
    var parsePath = function(p) {
        if (is.Array(p)) return [];
        var keys = [];
        try {
            keys = Object.keys(p);
        } catch(e) {
        }
        if (keys.length === 0) return [];
        return keys.map(function(e) {
            if (p[e] === $) return [e];
            var res = parsePath(p[e]);
            if (res.length === 0) return res;
            return res[0].map(function(r){
                return [e].concat(r);
            });
        }).filter(function(e) {return e.length > 0;});
    };
    return parsePath(p).map(function(e) {return is.Array(e[0]) ? e[0] : e;});
};
var res = parsePath({a:$});
assert(JSON.stringify(res) === '[["a"]]', 'should be [["a"]]');
var res = parsePath({a:{b:$}});
assert(JSON.stringify(res) === '[["a","b"]]', 'should be [["a","b"]]');
var res = parsePath({a:{b:$},b:1, c:$});
assert(JSON.stringify(res) === '[["a","b"],["c"]]', 'should be [["a","b"],["c"]]');
var res = parsePath({a:{b:1}, b: $});
assert(res.join() === "b", "should be 'b'");

var res = parsePath({a:{b:{c:$}},b:1, c:$});
assert(JSON.stringify(res) === '[["a","b","c"],["c"]]', 'should be [["a","b","c"],["c"]]');
var res = parsePath({a:{b:{c:{d:$}}},b:1, c:$});
assert(JSON.stringify(res) === '[["a","b","c","d"],["c"]]', 'should be [["a","b","c","d"],["c"]]');

var res = parsePath({c:$, a:{b:{c:{d:$}}},b:1});
assert(JSON.stringify(res) === '[["c"],["a","b","c","d"]]', 'should be [["c"],["a","b","c","d"]]');

var res = parsePath({c:$, a:{b:{c:{d:$}}},b:{c:{d:$}}});
assert(JSON.stringify(res) === '[["c"],["a","b","c","d"],["b","c","d"]]', 'should be [["c"],["a","b","c","d"],["b","c","d"]]');

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

var normalEquals = function(array) {
    return array.every(function(x){return x==array[0];});
};
var zip = function(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i];});
    });
};
var type = function(x) {
    return Object.prototype.toString.call(x);
};
var allTrue = function(array) {
    return array.reduce(function(a,b){return a&&b;},true);
};
var superEquals = function(things) {
    if( type(things[0])==type([]) && normalEquals(things.map(type)) && normalEquals(things.map(function(x){return x.length;})))
        return allTrue(zip(things).map(superEquals));
    else
        return normalEquals(things);
};

var superduck = function() {
    if(!(this instanceof superduck)) 
    {
        return new superduck();
    }

    this.$ = $;
    this.is = is;
    this.destructor = destructor;
    this.match = function(ptt) {
        var keys = Object.keys(ptt);
        var matcher = function(o) {
            var oKeys = Object.keys(o);
            return superEquals([o[keys[0]], ptt[keys[0]]]) && superEquals([o[keys[1]], ptt[keys[1]]]) && oKeys.length === keys.length;
        }; 

        return function(o, meth) {
            if (matcher(o)) meth(true);
            else meth(false);
        };
    };
};

(function(root) {
    'use strict';
    if(typeof exports != 'undefined') {
        /*jshint node: true*/
        exports = module.exports = superduck;
    } else {
        root.superduck = superduck;
    }
})(this);
