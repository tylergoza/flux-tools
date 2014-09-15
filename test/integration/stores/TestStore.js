'use strict';

var Store = require('../../../src/Store');
var TestDispatcher = require('../dispatchers/TestDispatcher');


var TestStore = new Store({
    dispatcher: TestDispatcher
});

//local
TestStore.registerHandlers({
    addTest: function(payload) {
        this.add(payload.item, payload.options);
    }
}, TestStore.id);

//global
TestStore.registerHandlers({
    addTest: function(payload) {
        this.add(payload.item, payload.options);
    }
});

module.exports = TestStore;
