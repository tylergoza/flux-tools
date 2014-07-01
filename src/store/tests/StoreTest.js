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

    it('should create data', function() {
        var store = new Store();

        store.create('mock data 1');
        assert.equal(store.count(), 1);
        assert.equal(store.all()[0], 'mock data 1');

        store.create('mock data 2');
        assert.equal(store.count(), 2);
        assert.equal(store.all()[0], 'mock data 1');
        assert.equal(store.all()[1], 'mock data 2');

        store.create('mock data 3', 0);
        assert.equal(store.count(), 3);
        assert.equal(store.all()[0], 'mock data 3');
        assert.equal(store.all()[1], 'mock data 1');
        assert.equal(store.all()[2], 'mock data 2');
    });

    it('should filter data', function() {
        var records;
        var store = new Store([
            'mock data 1',
            'mock data 2',
            'mock data 3'
        ]);

        records = store.filter(function(data) {
            return data === 'mock data 2';
        });

        assert.equal(records.length, 1);
        assert.equal(records[0], 'mock data 2');
    });

    it('should get at a given index', function() {
        var store = new Store([
            'mock data 1',
            'mock data 2',
            'mock data 3'
        ]);

        assert.equal(store.at(1), 'mock data 2');
        assert.equal(store.at(2), 'mock data 3');
        assert.equal(store.at(0), 'mock data 1');
        assert.isUndefined(store.at(3));
    });

    it('should sort data', function() {
        var store = new Store([{
            age: 1
        }, {
            age: 55
        }, {
            age: 11
        }]);

        store.sort(function(a, b) {
            return b.age - a.age;
        });

        assert.deepEqual(store.at(0), {age: 55});
        assert.deepEqual(store.at(1), {age: 11});
        assert.deepEqual(store.at(2), {age: 1});
    });

    it('should remove data', function() {
        var store = new Store([
            'mock data 1',
            'mock data 2',
            'mock data 1',
            'mock data 3'
        ]);

        assert.equal(store.count(), 4);
        store.destroy(function(data) {
            return data === 'mock data 1';
        });
        assert.equal(store.count(), 2);
    });

    it('should empty data', function() {
        var store = new Store(['mock data 1']);

        assert.equal(store.count(), 1);
        store.empty();
        assert.equal(store.count(), 0);
    });
});

