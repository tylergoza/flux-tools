'use strict';

var assert = require('assert');
var stub = require('sinon').stub;

var Store = require('../../src/Store');
var utils = require('../../src/utils');


describe('Store', function() {
    var mockDispatcher;

    beforeEach(function() {
        mockDispatcher = {
            register: stub()
        };
    });

    it('should create a store', function() {
        var data = [1, 2, 3, 4];
        var store = new Store({
            data: data,
            dispatcher: mockDispatcher
        });

        assert.equal(mockDispatcher.register.callCount, 1);
        assert.equal(store.id, utils.uid() - 1);
        assert.equal(store.length, 4);
        assert.deepEqual(store.values, [1, 2, 3, 4]);
        assert.equal(store.values, data);
    });

    it('show throw an error without a Dispatcher', function() {
        assert.throws(function() {
            new Store();
        }, Error);
    });

    it('should add items', function() {
        var store = new Store({
            data: [1, 3, 5],
            dispatcher: mockDispatcher
        });
        var cb = stub();

        store.on('change', cb);

        store.add(7);
        assert.equal(cb.callCount, 1);
        assert.equal(store.length, 4);
        assert.deepEqual(store.values, [1, 3, 5, 7]);

        store.add(3.1, {at: 2});
        assert.equal(cb.callCount, 2);
        assert.equal(store.length, 5);
        assert.deepEqual(store.values, [1, 3, 3.1, 5, 7]);

        store.add(9, {silent: true});
        assert.equal(cb.callCount, 2);
        assert.equal(store.length, 6);
        assert.deepEqual(store.values, [1, 3, 3.1, 5, 7, 9]);
    });

    it('should remove items', function() {
        var store = new Store({
            data: [1, 2, 3, 4],
            dispatcher: mockDispatcher
        });
        var cb = stub();

        store.on('change', cb);

        store.remove();
        assert.equal(cb.callCount, 1);
        assert.equal(store.length, 3);
        assert.deepEqual(store.values, [1, 2, 3]);

        store.remove({at: 1});
        assert.equal(cb.callCount, 2);
        assert.equal(store.length, 2);
        assert.deepEqual(store.values, [1, 3]);

        store.remove({silent: true});
        assert.equal(cb.callCount, 2);
        assert.equal(store.length, 1);
        assert.deepEqual(store.values, [1]);
    });

    it('should clear items', function() {
        var store = new Store({
            data: [1, 2, 3, 4],
            dispatcher: mockDispatcher
        });
        var cb = stub();

        store.on('change', cb);

        assert.deepEqual(store.clear().values, []);
        assert.equal(cb.callCount, 1);
    });

    it('should set the store', function() {
        var store = new Store({
            dispatcher: mockDispatcher
        });
        var cb = stub();

        store.on('change', cb);

        store.set([1, 2]);
        assert.equal(cb.callCount, 1);
        assert.equal(store.length, 2);
        assert.deepEqual(store.values, [1, 2]);

        store.set(5);
        assert.equal(cb.callCount, 2);
        assert.equal(store.length, 1);
        assert.deepEqual(store.values, [5]);

        store.set([1, 2, 3], {silent: true});
        assert.equal(cb.callCount, 2);
        assert.equal(store.length, 3);
        assert.deepEqual(store.values, [1, 2, 3]);
    });

    it('should handle listeners', function() {
        var store = new Store({
            dispatcher: mockDispatcher
        });
        var cb = stub();

        assert.equal(store.on('change', cb), true);
        assert.equal(store.emit('change', 77), true);
        assert.equal(cb.callCount, 1);
        assert.equal(cb.calledWith(77), true);

        assert.equal(store.off('change', cb), true);
        assert.equal(store.emit('change', 88), false);
        assert.equal(cb.callCount, 1);
    });

    it('should add and remove action handlers', function() {
        var add = stub();
        var remove = stub();
        var store;
        var handlers = {
            _global: {}
        };

        store = new Store({
            dispatcher: mockDispatcher
        });

        //register local
        store.registerHandlers({
            add: add,
            remove: remove
        }, store.id);
        handlers[store.id] = {add: add, remove: remove};
        assert.deepEqual(store.handlers, handlers);

        //register global
        store.registerHandlers({
            remove: remove
        });
        handlers._global = {remove: remove};
        assert.deepEqual(store.handlers, handlers);

        //unregister local
        store.unregisterHandlers(store.id);
        delete handlers[store.id];
        assert.deepEqual(store.handlers, handlers);

        //unregister global
        store.unregisterHandlers();
        handlers._global = {};
        assert.deepEqual(store.handlers, handlers);
    });
});
