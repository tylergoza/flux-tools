'use strict';

var TestStore = require('../stores/TestStore');


var genericActions = {
    addLocal: function(id, dispatcher, item, options) {
        dispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options},
            id: id
        });
    },
    addGlobal: function(id, dispatcher, item, options) {
        dispatcher.dispatch({
            action: 'addTest',
            data: {item: item, options: options}
        });
    }
};

module.exports = TestStore.registerActions(genericActions);
