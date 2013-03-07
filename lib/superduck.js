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
(function(root) {
    var is = {
        classes: [],
        //TODO: undefined
        register: function(clazz) {
            if (is.classes.indexOf(clazz) === 0-1) is.classes.push(clazz);
        },
        instOf: function(clazz) {
            return function(o) {
                return o instanceof clazz;
            };
        },
        Array: function(a) {
            return Array.isArray(a);
        },
        Number: function(n) {
            return typeof n === "number";
        },
        String: function(s) {
            return typeof s === 'string' || s instanceof String;
        },
        Function: function(f) {
            return typeof f === "function";
        },
        Object: function(value) {
            return value !== null && value.constructor === Object;
        },
        Boolean: function(tf) {
            return tf === true || tf === false;
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
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 1);
        return function() {
            return fn.apply(this, args.concat(slice.call(arguments, 0)));
        };
    }

    function identity(v) {return v;}

    function map(f, a) {
        return Array.prototype.map.apply(a, [f]);
    }

    function accessor(path) {
        /*jshint evil: true */
        if (path.length === 0) return function(o) {return o};
        return new Function("o", "var res; try {res = o['" + path.join("']['") + "']} catch(e){} return res");
    }

    var $ = identity;

    function flatten(arr) {
        return arr.reduce(function(prev, curr) {
            if (is.Array(curr)) return prev.concat(flatten(curr));
            else return prev.concat(curr);
        }, []);
    }

    function parseNode ( path, o ) {
        if (is.Object(o)) {
            var keys = Object.keys(o);
            if (keys.length > 0) {
                var r = keys
                    .map(
                    function(k) {
                        var v = path.slice();
                        v[v.length] = k;
                        return parseNode( v, o[k] );
                    });
                return flatten(r);
            }
        }
        return {path:path, value:o};
    }

    var destructor = _c(
        function(actions) {
            return function(o, f) {
                f.apply(o, actions.map(function(a){return a(o);}));
            };
        },
        _p(map, function(pv) {return _c(accessor(pv.path), pv.value);}),
        function(v) {
            return is.Array(v) ? v : [v];
        },
        _p(parseNode, [])
    );

    function chooseCheck(vv) {
        if (vv === Boolean) return is.Boolean;
        if (vv === Number) return is.Number;
        if (vv === Object || is.Object(vv)) return is.Object;
        if (vv === String) return is.String;
        if (vv === Array || is.Array(vv)) return is.Array;
        if (is.classes.indexOf(vv) !== -1) return is.instOf(vv);
        if (vv === null ) return function(v) {return v === null;};
        if (is.Function(vv)) return vv;
        return function(v) { return v === vv;};
    }

    var makeChecks = _c(
        _p(map, function(pv) {
            return _c(chooseCheck(pv.value), accessor(pv.path));}),
        function(v) {
            return is.Array(v) ? v : [v];
        },
        _p(parseNode, [])
    );

    var foldChecks = function(actions) {
        return function(o) {
            return actions.map(function(a){return a(o);} ).reduce(function(prev, curr) {
                return prev && curr;
            }, true);
        };
    }

    var checker = function(ptt) {
        var m = check(ptt);
        return function(o, f) {
            f(m(o));
        }
    };

    var check = _c(
        foldChecks,
        makeChecks
    );

    var match = function() {
        var mtds = [];
        for (var i = 0; i < arguments.length; i ++) {
            var _case = check(arguments[i][0]);
            var method = arguments[i][1];
            mtds.push([_case, method]);
        }
        return function(o) {
            for (var i = 0; i < mtds.length; i ++) {
                if (mtds[i][0](o)) return mtds[i][1](o);
            }
            throw new Error("Argument doesn't match any pattern.");
        };
    };

    var superduck = {
        $: $,
        is: is,
        destructor: destructor,
        checker: checker,
        check: check,
        match: match
    };

    if(typeof exports !== 'undefined') {
        exports = module.exports = superduck;
    } else {
        root.superduck = superduck;
    }
})(this);
