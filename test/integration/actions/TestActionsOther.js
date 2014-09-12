'use strict';

var TestDispatcher = require('../dispatchers/TestDispatcher');
var TestStore = require('../stores/TestStore');


var TestActionsOther = {
    addLocal: function(item, options) {
        TestDispatcher.dispatch({
            action: 'addOther',
            data: {item: item, options: options},
            id: TestStore.id
        });
    },
    addGlobal: function(item, options) {
        TestDispatcher.dispatch({
            action: 'addOther',
            data: {item: item, options: options}
        });
    },
    addBad: function(item, options) {
        TestDispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options},
            id: TestStore.id + 1
        });
    }
};

module.exports = TestActionsOther;
