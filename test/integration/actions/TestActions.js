'use strict';

var TestDispatcher = require('../dispatchers/TestDispatcher');
var TestStore = require('../stores/TestStore');


var genericActions = {
    addLocal: function(item, options) {
        TestDispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options},
            id: this.id
        });
    },
    addGlobal: function(item, options) {
        TestDispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options}
        });
    }
};

module.exports = TestStore.createActions(genericActions);
