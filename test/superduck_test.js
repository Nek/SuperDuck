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
    'destruct': function(test) {
        test.expect(5);
        // tests here
        var sd = superduck();
        var $ = sd.$;
       
        sd.destruct({a:$})({a:5},function(a){
            test.equal(a, 5, 'a should be 5.');
        });
        sd.destruct({a:$, b: {a:[], b: $}})({a:5},function(a, b){
            test.equal(a, 5, 'a should be 5.');
            test.equal(b, undefined, 'b should be undefined.');
        });
        sd.destruct({a:$, b: {a:[], b: $}})({a:5, b: {b:"aaa"}},function(a, b){
            test.equal(a, 5, 'a should be 5.');
            test.equal(b, "aaa", 'b should be "aaa".');
        });
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
    }
};

if (exports ) exports.superduck = this.superduck_test;
