var assert = require('chai').assert;
var Dispatcher = require('../../dispatcher/Dispatcher');
var Store = require('../Store');

describe('Store', function() {
    it('should respond to the dispatcher', function() {
        var handler;
        var store = new Store();
        var addCount = 0;
        var changeCount = 0;
        var addFn = function(i) {
            addCount += i;
        };
        var changeFn = function(i) {
            changeCount += i - 1;
        };

        handler = store.on('add', addFn);
        store.on('change', changeFn);

        Dispatcher.dispatch('add', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);

        Dispatcher.dispatch('sub', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);

        store.un(handler);
        Dispatcher.dispatch('add', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);
    });

    it('should add and remove data', function() {
        var store = new Store();

        store.add({
            data: 'mock data 1'
        });
        assert.equal(store.length, 1);

        store.add({
            data: 'mock data 2',
            id: 1
        });
        assert.equal(store.length, 2);

        store.add({
            data: 'mock data 3',
            index: 0
        });
        assert.equal(store.length, 3);

        store.remove(1);
        assert.equal(store.length, 2);
    });
});

