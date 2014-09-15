'use strict';

var assert = require('assert');
var stub = require('sinon').stub;

var Dispatcher = require('../../src/Dispatcher');


describe('Dispatcher', function() {
    it('should register and unregister callbacks', function() {
        var dispatcher = new Dispatcher();
        var cb = stub();
        var id;

        id = dispatcher.register(cb);
        assert.equal(dispatcher.length, 1);

        assert.throws(function() {
            dispatcher.register(null);
        }, Error);

        dispatcher.unregister(id);
        assert.equal(dispatcher.length, 0);
    });

    it('should dispatch', function() {
        var dispatcher = new Dispatcher();
        var cb1 = stub();
        var cb2 = stub();
        var data = {};

        dispatcher.register(cb1);
        dispatcher.register(cb2);

        dispatcher.dispatch('cool', data);
        assert.equal(cb1.callCount, 1);
        assert.equal(cb2.callCount, 1);
        assert.equal(cb1.calledWith('cool', data), true);
        assert.equal(cb2.calledWith('cool', data), true);
    });

    it('should wait', function() {
        var emptyFn = function() {};
        var dispatcher = new Dispatcher();
        var data = {};
        var runs = [false, false, false];
        var mock = {
            cb1: emptyFn,
            cb2: emptyFn,
            cb3: emptyFn
        };
        var id1, id2, id3;

        stub(mock, 'cb1', function() {
            dispatcher.wait([id3, id2]);

            runs[0] = true;
            assert.equal(runs[1], true);
            assert.equal(runs[2], true);
        });
        stub(mock, 'cb2', function() {
            runs[1] = true;
            assert.equal(runs[0], false);
            assert.equal(runs[2], true);
        });
        stub(mock, 'cb3', function() {
            runs[2] = true;
            assert.equal(runs[0], false);
            assert.equal(runs[1], false);
        });

        id1 = dispatcher.register(mock.cb1);
        id2 = dispatcher.register(mock.cb2);
        id3 = dispatcher.register(mock.cb3);
        dispatcher.dispatch('cool', data);

        assert.equal(mock.cb1.callCount, 1);
        assert.equal(mock.cb2.callCount, 1);
        assert.equal(mock.cb3.callCount, 1);
        assert.equal(mock.cb1.calledWith('cool', data), true);
        assert.equal(mock.cb2.calledWith('cool', data), true);
        assert.equal(mock.cb3.calledWith('cool', data), true);
    });

    it('should wait on pending', function() {
        var emptyFn = function() {};
        var dispatcher = new Dispatcher();
        var data = {};
        var runs = [false, false, false];
        var mock = {
            cb1: emptyFn,
            cb2: emptyFn,
            cb3: emptyFn
        };
        var id1, id2, id3;

        stub(mock, 'cb1', function() {
            dispatcher.wait([id3]);

            runs[0] = true;
            assert.equal(runs[1], false);
            assert.equal(runs[2], true);
        });
        stub(mock, 'cb2', function() {
            dispatcher.wait([id1]);

            runs[1] = true;
            assert.equal(runs[0], true);
            assert.equal(runs[2], true);
        });
        stub(mock, 'cb3', function() {
            runs[2] = true;
            assert.equal(runs[0], false);
            assert.equal(runs[1], false);
        });

        id1 = dispatcher.register(mock.cb1);
        id2 = dispatcher.register(mock.cb2);
        id3 = dispatcher.register(mock.cb3);
        dispatcher.dispatch('cool', data);

        assert.equal(mock.cb1.callCount, 1);
        assert.equal(mock.cb2.callCount, 1);
        assert.equal(mock.cb3.callCount, 1);
        assert.equal(mock.cb1.calledWith('cool', data), true);
        assert.equal(mock.cb2.calledWith('cool', data), true);
        assert.equal(mock.cb3.calledWith('cool', data), true);
    });

    it('should handle wait while not dispatching', function() {
        var dispatcher = new Dispatcher();
        var cb = stub();
        var id = dispatcher.register(cb);

        assert.throws(function() {
            dispatcher.wait([id]);
        }, Error);
    });

    it('should handle wait cycle', function() {
        var dispatcher = new Dispatcher();
        var data = {};
        var cb1, cb2, id1, id2;

        cb1 = function() {
            dispatcher.wait([id2]);
        };
        cb2 = function() {
            dispatcher.wait([id1]);
        };
        id1 = dispatcher.register(cb1);
        id2 = dispatcher.register(cb2);

        assert.throws(function() {
            dispatcher.dispatch('cool', data);
        }, Error);
    });

    it('should handle wait missing id', function() {
        var dispatcher = new Dispatcher();
        var data = {};
        var cb;

        cb = function() {
            dispatcher.wait([null]);
        };
        dispatcher.register(cb);

        assert.throws(function() {
            dispatcher.dispatch('cool', data);
        }, Error);
    });

     it('should handle dispatch while dispatching', function() {
        var dispatcher = new Dispatcher();
        var data = {};
        var cb;

        cb = function() {
            dispatcher.dispatch('cool', data);
        };
        dispatcher.register(cb);

        assert.throws(function() {
            dispatcher.dispatch('cool', data);
        }, Error);
    });
});
