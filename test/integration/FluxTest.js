'use strict';

var assert = require('assert');
var stub = require('sinon').stub;

var TestActions = require('./actions/TestActions');
var TestActionsOther = require('./actions/TestActionsOther');
var TestStore = require('./stores/TestStore');


describe('Flux', function() {
    it('should flux real good', function() {
        var onStoreChange = stub();

        TestStore.on('change', onStoreChange);

        TestActions.addLocal(777);
        assert.equal(TestStore.length, 1);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.values, [777]);

        TestActions.addGlobal(888, {silent: true});
        assert.equal(TestStore.length, 2);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.values, [777, 888]);

        //should not respond to targeted other
        TestActionsOther.addLocal(999);
        assert.equal(TestStore.length, 2);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.values, [777, 888]);

        //should not respond to global other
        TestActionsOther.addGlobal(111);
        assert.equal(TestStore.length, 2);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.values, [777, 888]);

        //should not respond to bad id
        TestActionsOther.addBad(111);
        assert.equal(TestStore.length, 2);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.values, [777, 888]);
    });
});
