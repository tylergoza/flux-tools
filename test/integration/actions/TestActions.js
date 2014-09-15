'use strict';

var TestDispatcher = require('../dispatchers/TestDispatcher');
var TestStore = require('../stores/TestStore');


var genericActions = {
    addLocal: function(id, item, options) {
        TestDispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options},
            id: id
        });
    },
    addGlobal: function(id, item, options) {
        TestDispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options}
        });
    }
};

module.exports = TestStore.registerActions(genericActions);
