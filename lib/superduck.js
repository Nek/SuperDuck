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
if (typeof console !== "undefined") assert = console.assert;

var _ = require('lodash');

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

var _c = _.compose;
var keys = _.keys;
var pairKeys = function(a) {
    return keys(a).map(function(el){return [a, el];});
};
var _p = _.partial;
var map = function(f, a) {
    return Array.prototype.map.apply(a, [f]);
};
var filter = function(f, a) {
    return Array.prototype.filter.apply(a, [f]);
};

var accessor = function(path) {
    /*jshint evil: true */
    return new Function("o", "var res; try {res = o['" + path.join("']['") + "']} catch(e){} return res");
};

assert(accessor(["a"])({a:5}) === 5, "should be 5");
assert(accessor(["b"])({}) === undefined, "should be undefined");
assert(accessor(["a","b"])({a:{b:7}}) === 7, "should be 7");
assert(accessor(["5","9"])({"5":{'9':7}}) === 7, "should be 7");

var match = function(path, check) {
    return _c(check, accessor(path));
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
        f.apply(o, _c(_p(map, function(acc){return acc(o);}), _p(map, accessor))(accs));
    };
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

var concat = function(a, r) {
    return Array.prototype.concat.apply(a, [r]);
};

var identity = _.identity;

var cond = function(c,t,f) {
    if (c) return t; else return f;
};

var _if = function(c,t,f) {
    return function(v) {
        if (c.apply(this, arguments)) return t.apply(this, arguments); else return f.apply(this, arguments);
    };
};

var eq = function(a,b) {
    return a === b;
};

var gt = function(a,b) {
    return a > b;
};

var lt = function(a,b) {
    return a < b;
};

var item = function(ai) {
    return ai[0][ai[1]];
};

var sizeEqZero = _c(_p(eq, 0), _.size);

var eqWildcard = _p(eq, $);

var array = function(el) {
    return [el];
};

var emptyArray = function() {
    return [];
};

var nestedParse, recParsePath;
function nestedParse(pe) {
    var e = _.last(pe);
    return _c(_if(eqWildcard, 
                  _p(array, e),
                  _c(
                      _if( 
                          sizeEqZero,
                          identity, 
                          _c(
                              _p(
                                  map,
                                  _p(concat, array(e))
                              ),
                              _.first
                          )
                      ), 
                      recParsePath
                  )), item)(pe);}

var recParsePath = _if(is.Array, 
               emptyArray, 
               _c(
                   _if(
                       sizeEqZero, 
                       emptyArray, 
                       _c( 
                           _p(filter,
                              _c(_p(lt,0), _c(_.size,_.last))
                             ), 
                           _p(map, nestedParse))
                   ), 
                   pairKeys
               ));


var parsePath = _c(_p(map, _if(_c(is.Array, _.first), _.first, identity)), recParsePath);


var destructor = _c(makeDestruct, parsePath);

var res = parsePath({a:$});
console.log(JSON.stringify(res));
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


    //.1 var 
    //   path = [], 
    //   accessors = [], 
    //   checkers = [],
    //   keys = Object.keys(ptt);
    // checkers = Object.keys(ptt).map(function(key) {
    // if (is.Function(ptt[key])) return compose(ptt[key], accessor(path.concat(key));
    // if (is.Number(ptt[key]) || is.String(ptt[key])) return compose(function(v){return v === ptt[key]}, accessor(path.concat(key)));
    // });
    //.2 взять key и value
    //.3 if (is.Function(value)) { accessors.push(path.concat(key)); checkers.push(value) } go to 2
    //.4 если это число, строка, список сгенерировать точное сравнение
    //.5 если это обьект, то path.push(key)
    //.6 parse
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
