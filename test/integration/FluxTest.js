'use strict';

var assert = require('assert');
var stub = require('sinon').stub;

var TestActions = require('./actions/TestActions');
var TestActionsOther = require('./actions/TestActionsOther');
var TestDispatcher = require('./dispatchers/TestDispatcher');
var TestStore = require('./stores/TestStore');


describe('Flux', function() {
    it('should flux real good', function() {
        var onStoreChange = stub();

        TestStore.on('change', onStoreChange);

        TestActions.addLocal(777);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 777);

        TestActions.addGlobal(888, {silent: true});
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 888);

        //should not respond to targeted other
        TestActionsOther.addLocal(999);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 888);

        //should not respond to global other
        TestActionsOther.addGlobal(111);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 888);

        //should not respond to bad id
        TestActionsOther.addBad(111);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 888);

        //should not respond after unregister
        TestDispatcher.unregister(TestStore.id);
        TestActions.addLocal(222);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 888);
    });
});
