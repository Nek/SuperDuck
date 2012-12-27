/*
 * superduck
 * https://github.com/nek/superduck
 *
 * Copyright (c) 2012 Nek
 * Licensed under the MIT license.
 */
// {a:_, b:Number, c:Object}, {b:$, c: {a: $}}, function(b, a)
// {a:_, b:Number, c:Object}, unpack(_, b)({b:$, c: {a: $}}))(function(b, a) //{} )

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

    this.$ = function() {};
    this.destruct = function(ptt) {
        var accs = [];
        var makeAcc = function(key, fs) {
            if (fs === undefined)
                return function(obj) {
                    return obj[key];
                };
            fs = fs.slice(0);
            return function(obj) {
                var cur = obj;
                var i,l;
                for (i = 0, l = fs.length; i < l; i++) {
                    cur = cur[fs[i]];
                }
                if (cur !== undefined) return cur[key];
            };
        };
        var self = this;
        var fillAccs = function(ptt, accs, fs) {
            var keys = Object.keys(ptt);
            var i,l;
            for (i = 0, l = keys.length; i < l; i++) {
                var m = ptt[keys[i]];
                if (m === self.$) {
                    accs.push(makeAcc(keys[i], fs));
                } else if ( m !== null && typeof(m) === 'object' ) {
                    if (fs === undefined || fs.length === 0) fs = [keys[i]];
                    else fs.push(keys[i]);
                    fillAccs(m, accs, fs);
                }
            }
            if (fs !== undefined) fs.pop();
        };
        fillAccs(ptt, accs);
        var destruct = function(o) {
            var res = [];
            var i,l;
            for (i = 0, l = accs.length; i < l; i ++) {
                res.push(accs[i](o));
            }
            return res;
        };
        return function(o, f) {
            f.apply(o, destruct(o));
        };
    };
    this.match = function(ptt) {
        var keys = Object.keys(ptt);
        //var i,l;
        //for (i = 0, l = keys.length; i < l; i ++) {  
        //}

        // true &&
        
        var matcher = function(o) {
            var oKeys = Object.keys(o);
            if (!superEquals(keys, oKeys)) return false;
            return superEquals([o[keys[0]], ptt[keys[0]]]) && superEquals([o[keys[1]], ptt[keys[1]]]);
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
