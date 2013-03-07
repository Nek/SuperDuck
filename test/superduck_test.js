/*global require:true */
"use strict";
if (typeof window === 'undefined') var superduck = require('../lib/superduck.js');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

this.superduck_test = {
    'destructor': function(test) {
        test.expect(14);
        var sd = superduck;
        var $ = sd.$;
        sd.destructor({a:$})
        ({a:5}, function(a) {
            test.equal(a, 5, "should be 5");
        });
        sd.destructor({a:{b:$}})
        ({a:{ b:6}},
         function(b) {
             test.equal(b, 6, "should be 6");
         });
        sd.destructor({a:$})({},function(v) {
            test.equal(v, undefined, "should be undefined");
        });
        sd.destructor({a:$,b:$})({a:1,b:2},function(a,b) {
            test.equal(a, 1, "should be 1");
            test.equal(b, 2, "should be 2");
        });
        sd.destructor({a:$,b:$})({a:1},function(a,b) {
            test.equal(a, 1, "should be 1");
            test.equal(b, undefined, "should be undefined");
        });
        sd.destructor({a:$,b:$})({b:2},function(a,b) {
            test.equal(a, undefined, "should be undefined");
            test.equal(b, 2, "should be 2");
        });

        sd.destructor({a:$, b: {b: $}})({a:5},function(a, b){
             test.equal(a, 5, 'a should be 5.');                            
             test.equal(b, undefined, 'b should be undefined.');            
        });                                                                
        sd.destructor({a:$, b: {b: $}})({a:5, b: {b:"aaa"}},function(a, b) {
            test.equal(a, 5, 'a should be 5.');                            
            test.equal(b, "aaa", 'b should be "aaa".');                    
        });

        sd.destructor($)( 5,function(v) {
            test.equal(v, 5, 'a should be 5.');
        });

        test.done();
    },
    'check': function(test) {
        test.expect(12);

        var sd = superduck;

        test.ok(sd.check(Object)({}), "should match");
        test.ok(sd.check(Object)({a:1}), "should match");
        test.ok(sd.check(Object)([]) === false, "should NOT match");

        test.ok(sd.check({})({}), "should match");
        test.ok(sd.check({})({a:1}), "should match");
        test.ok(sd.check({})([]) === false, "should NOT match");

        test.ok(sd.check([])({}) === false, "should NOT match");
        test.ok(sd.check([])({a:1}) === false, "should NOT match");
        test.ok(sd.check([])([]), "should match");

        test.ok(sd.check(Array)({}) === false, "should NOT match");
        test.ok(sd.check(Array)({a:1}) === false, "should NOT match");
        test.ok(sd.check(Array)([]), "should match");

        test.done();
    },
    'checker' : function(test) {
        test.expect(26);

        var sd = superduck;
        var is = superduck.is;

        sd.checker({a:1})({a:1},function(r){
            test.ok(r, "should match");
        });

        sd.checker({a:1})({a:2},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({b:1})({b:1},function(r){
            test.ok(r, "should match");
        });

        sd.checker({b:1})({b:2},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({a:2})({a:2},function(r){
            test.ok(r, "should match");
        });

        sd.checker({a:2})({a:1},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({b:2})({b:2},function(r){
            test.ok(r, "should match");
        });

        sd.checker({b:2})({b:1},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({b:2})({b:[1,2]},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({b:[1,2]})({b:[1,2]},function(r){
            test.ok(r, "should match");
        });
        
        sd.checker({a:1, b:2})({a: 1, b:[1,2]},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({a:1, b:2})({a: 1},function(r){
            test.ok(r === false, "shouldn't match");
        });
        
        sd.checker({a:1, b:2})({a:1, b:2},function(r){
            test.ok(r, "should match");
        });
        
        sd.checker({a:1, b:2})({a:1, b:2, c:3},function(r){
            test.ok(r === true, "should match");
        });

        sd.checker({a:1, b:is.Number})({a:1, b:2, c:3},function(r){
            test.ok(r === true, "should match");
        });

        sd.checker({a:1, b:{c:is.Number}})({a:1, b:2, c:3},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({a:1, b:{c:is.Number}})({a:1, b:{c:1}},function(r){
            test.ok(r === true, "should match");
        });

        sd.checker({b:Number})({b:1},function(r){
            test.ok(r === true, "should match");
        });

        sd.checker({b:String})({b:1},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({b:String})({b:"!!!"},function(r){
            test.ok(r === true, "should match");
        });

        function Apple() {

        }

        is.register(Apple);


        sd.checker({b:Apple})({b:Apple},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.checker({b:Apple})({b:new Apple()},function(r){
            test.ok(r === true, "should match");
        });

        sd.checker({b:Boolean})({b:true},function(r){
            test.ok(r === true, "should match");
        });

        sd.checker([])([],function(r){
            test.ok(r === true, "should match");
        });
        sd.checker(String)("",function(r){
            test.ok(r === true, "should match");
        });
        sd.checker(Apple)(new Apple(),function(r){
            test.ok(r === true, "should match");
        });

        test.done();
    },
    'is' : function(test) {
        test.expect(18);
        var sd = superduck;
        var is = superduck.is;
        test.ok(is.Array([]), "It's an Array");
        test.ok(is.Array({}) === false, "It's NOT an Array");
        test.ok(is.Array(6) === false, "It's NOT an Array");
        function Apple() {
            this.seeds = 8;
        }
        test.ok(is.Array(new Apple()) === false, "It's NOT an Array");
        function xxx(){}
        test.ok(is.Function(xxx), "It's a function");
        var a = function(){};
        test.ok(is.Function(a), "It's a function");
        test.ok(is.Function(1) === false, "It's NOT a function");
        test.ok(is.Function({}) === false, "It's NOT a function");
        test.ok(is.Function(new Function("return null")), "It's a function");
        test.ok(is.Boolean(true) === true, "true is Boolean");
        test.ok(is.Boolean(false) === true, "false is Boolean");
        test.ok(is.Boolean("true") !== true, "String is not Boolean");


        test.ok(is.Object(true) !== true, "Boolean is not Object");
        test.ok(is.Object(false) !== true, "Boolean is not Object");
        test.ok(is.Object("aaa") !== true, "String is not Object");
        test.ok(is.Object([]) !== true, "Array is not Object");
        test.ok(is.Object({}) === true, "Object literal is Object");
        test.ok(is.Object(new Object()) === true, "Object is Object");


        test.done();

    },
    'match': function(test) {
        test.expect(16);

        var sd = superduck;
        var $ = superduck.$;
        var fib;
        fib = sd.match(
            [{val: 1}, function() {return 1;}],
            [{val: 2}, function() {return 1;}],
            [{val: $}, function(v) {return fib({val:v.val-1}) + fib({val:v.val-2});}]
        );

        test.equal(fib({val:1}), 1);
        test.equal(fib({val:2}), 1);
        test.equal(fib({val:3}), 2);
        test.equal(fib({val:4}), 3);
        test.equal(fib({val:5}), 5);
        test.equal(fib({val:6}), 8);
        test.equal(fib({val:7}), 13);

        var foo;
        foo = sd.match(
            [{val: true}, function() {return 1;}],
            [{val: false}, function() {return 2;}],
            [{val: $}, function() {return 3;}],
            [{val: null}, function() {return 4;}],
            [{}, function() {return "always good";}]
        );

        test.equal(foo({val: true}), 1);
        test.equal(foo({val: false}), 2);
        test.equal(foo({val: "whatever"}), 3);
        test.equal(foo({val: null}), 4);
        test.equal(foo({val: undefined}), "always good");

        var sd = superduck;
        var $ = superduck.$;
        var arrOrObj;
        arrOrObj = sd.match(
            [{}, function() {return "object"}],
            [[], function() {return "array"}]
        );

        test.equal(arrOrObj([]), "array");
        test.equal(arrOrObj({}), "object");

        var sd = superduck;
        var $ = superduck.$;
        var arrOrObj;
        arrOrObj = sd.match(
            [Object, function() {return "object"}],
            [Array, function() {return "array"}]
        );

        test.equal(arrOrObj([]), "array");
        test.equal(arrOrObj({}), "object");

        test.done();
    }
};

if (typeof exports !== "undefined") exports.superduck_test = this.superduck_test;
