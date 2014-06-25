var assert = require('chai').assert;
var Dispatcher = require('../../dispatcher/Dispatcher');
var Store = require('../Store');

describe('Store', function() {
    it('should respond to the dispatcher', function() {
        var store = new Store();
        var addCount = 0;
        var changeCount = 0;
        var addFn = function(i) {
            addCount += i;
        };
        var changeFn = function(i) {
            changeCount += i - 1;
        };

        store.on('add', addFn);
        store.on('change', changeFn);

        Dispatcher.dispatch('add', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);

        Dispatcher.dispatch('sub', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);

        store.un('add', addFn);
        Dispatcher.dispatch('add', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);
    });

    it('should add data', function() {
        var store = new Store();

        store.add({
            data: 'mock data 1'
        });
        assert.equal(store.getCount(), 1);

        store.add({
            data: 'mock data 2',
            id: 1
        });
        assert.equal(store.getCount(), 2);

        store.add({
            data: 'mock data 3'
        }, 0);
        assert.equal(store.getCount(), 3);
    });

    it('should load data', function() {
        var store = new Store();

        store.add({
            data: '1'
        });
        assert.equal(store.getCount(), 1);

        store.load([{
            id: 1234,
            data: '2'
        }, {
            id: 5678,
            data: '3'
        }, {
            badData: '5'
        }]);
        assert.equal(store.getCount(), 2);
        assert.deepEqual(store._data[0], {data: '2', id: 1234});
        assert.deepEqual(store._data[1], {data: '3', id: 5678});

        store.load([{id: 9012, data: '4'}], true);
        assert.equal(store.getCount(), 3);
        assert.deepEqual(store._data[2], {data: '4', id: 9012});
    });

    it('should remove data', function() {
        var store = new Store();

        store.load([{
            data: 'mock data 1'
        }, {
            data: 'mock data 2',
            id: 1
        }, {
            data: 'mock data 3',
            id: 1
        }, {
            data: 'mock data 4'
        }, {
            data: 'mock data 4'
        }, {
            data: 'mock data 4'
        }]);

        store.removeById(1);
        assert.equal(store.getCount(), 5);

        store.removeOne(function(record) {
            return record.data === 'mock data 4';
        });
        assert.equal(store.getCount(), 4);

        store.remove(function(record) {
            return record.data === 'mock data 4';
        });
        assert.equal(store.getCount(), 2);

        store.removeAll();
        assert.equal(store.getCount(), 0);
    });

    it('should find items', function() {
        var store = new Store();
        var result;

        store.load([{
            data: 'mock data 1'
        }, {
            data: 'mock data 2',
            id: 1
        }, {
            data: 'mock data 3'
        }, {
            data: 'mock data 4',
            id: 5
        }, {
            data: 'mock data 4',
            id: 6
        }, {
            data: 'mock data 4',
            id: 7
        }]);

        result = store.findById(1);
        assert.deepEqual(result, {data: 'mock data 2', id: 1});

        result = store.findById(10);
        assert.isUndefined(result);

        result = store.find(function(record) {
            return record.data === 'mock data 4';
        });
        assert.deepEqual(result, [{
            data: 'mock data 4',
            id: 5
        }, {
            data: 'mock data 4',
            id: 6
        }, {
            data: 'mock data 4',
            id: 7
        }]);
    });
});

