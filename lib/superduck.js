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
    function(v) {
        return is.Array(v) ? v : [v];
    },
    _p(parseNode, [])
);

function chooseCheck(vv) {
    if (vv === Boolean) return is.Boolean;
    if (vv === Number) return is.Number;
    if (vv === Object) return is.Object;
    if (vv === String) return is.String;
    if (vv === Array || is.Array(vv)) return is.Array;
    if (is.classes.indexOf(vv) !== -1) return is.instOf(vv);
    if (vv === null ) return function(v) {return v === null;};
    if (is.Function(vv)) return vv;
    return function(v) { return v === vv;};
}

var makeChecks = _c(
    _p(map, function(pv) {return _c(chooseCheck(pv.value), accessor(pv.path));}),
    _p(parseNode, [])
);

var foldChecks = function(actions) {
    return function(o) {
        return actions.map(function(a){return a(o);} ).reduce(function(prev, curr) {
            return prev && curr;
        }, true);
    };
}

var matcher = function(ptt) {
    var m = match(ptt);
    return function(o, f) {
        f(m(o));
    }
};

var match = _c(
    foldChecks,
    makeChecks
);

/*
TODO: multimethods
мультиметоды это такая функция которая берет обьект, список туплов (матчер, метод) и применяет
 */

var methods = function() {
    var mtds = [];
    for (var i = 0; i < arguments.length; i ++) {
        var _case = match(arguments[i][0]);
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

var superduck = function() {
    if(!(this instanceof superduck))
    {
        return new superduck();
    }

    this.$ = $;
    this.is = is;
    this.destructor = destructor;
    this.matcher = matcher;
    this.methods = methods;
};

(function(root) {
    if(typeof exports !== 'undefined') {
        exports = module.exports = superduck;
    } else {
        root.superduck = superduck;
    }
})(this);
