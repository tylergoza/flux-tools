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

        //should respond to local
        TestActions.addLocal(777);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 777);

        //should respond to global
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
        TestStore.dispatcher.unregister(TestStore.id);
        TestActions.addLocal(222);
        assert.equal(onStoreChange.callCount, 1);
        assert.deepEqual(TestStore.data, 888);
    });
});
