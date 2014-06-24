var assert = require('chai').assert;
var Dispatcher = require('../Dispatcher');

describe('Dispatcher', function() {
    it('should register and dispatch callbacks', function() {
        var counts = {test1: 0, test2: 0};

        Dispatcher.register(function(name, i) {
            counts[name] += i;
        });

        Dispatcher.dispatch('test1', 1)
        assert.equal(counts.test1, 1);
        assert.equal(counts.test2, 0);

        Dispatcher.dispatch('test1', 2)
        assert.equal(counts.test1, 3);
        assert.equal(counts.test2, 0);

        Dispatcher.dispatch('test2', 5)
        assert.equal(counts.test1, 3);
        assert.equal(counts.test2, 5);

        //clean up
        Dispatcher._callbacks = [];
    });
});
