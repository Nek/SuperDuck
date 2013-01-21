/*global require:true */
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
        test.expect(2);
        var sd = superduck();
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
        ////////////////////////////////////////////////////////////////////////
        // sd.destructor({a:$, b: {a:[], b: $}})({a:5},function(a, b){               //
        //     test.equal(a, 5, 'a should be 5.');                            //
        //     test.equal(b, undefined, 'b should be undefined.');            //
        // });                                                                //
        // sd.destructor({a:$, b: {a:[], b: $}})({a:5, b: {b:"aaa"}},function(a, b){ //
        //     test.equal(a, 5, 'a should be 5.');                            //
        //     test.equal(b, "aaa", 'b should be "aaa".');                    //
        // });                                                                //
        ////////////////////////////////////////////////////////////////////////

        test.done();
    },
    'match' : function(test) {
        test.expect(14);

        var sd = superduck();
        var $ = sd.$;
        
        sd.match({a:1})({a:1},function(r){
            test.ok(r, "should match");
        });

        sd.match({a:1})({a:2},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.match({b:1})({b:1},function(r){
            test.ok(r, "should match");
        });

        sd.match({b:1})({b:2},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.match({a:2})({a:2},function(r){
            test.ok(r, "should match");
        });

        sd.match({a:2})({a:1},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.match({b:2})({b:2},function(r){
            test.ok(r, "should match");
        });

        sd.match({b:2})({b:1},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.match({b:2})({b:[1,2]},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.match({b:[1,2]})({b:[1,2]},function(r){
            test.ok(r, "should match");
        });
        
        sd.match({a:1, b:2})({a: 1, b:[1,2]},function(r){
            test.ok(r === false, "shouldn't match");
        });

        sd.match({a:1, b:2})({a: 1},function(r){
            test.ok(r === false, "shouldn't match");
        });
        
        sd.match({a:1, b:2})({a:1, b:2},function(r){
            test.ok(r, "should match");
        });
        
        sd.match({a:1, b:2})({a:1, b:2, c:3},function(r){
            test.ok(r === false, "shouldn't match");
        });

        test.done();
    },
    'is' : function(test) {
        test.expect(8);
        var sd = superduck();
        var is = sd.is;
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
        test.ok(is.Function(new Function("return null")), "It's a function");
        test.done();

    }
};

if (exports ) exports.superduck = this.superduck_test;
