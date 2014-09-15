'use strict';

var TestDispatcher = require('../dispatchers/TestDispatcher');
var TestStore = require('../stores/TestStore');


var TestActions = {
    addLocal: function(item, options) {
        TestDispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options},
            id: TestStore.id
        });
    },
    addGlobal: function(item, options) {
        TestDispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options}
        });
    }
};

module.exports = TestActions;
