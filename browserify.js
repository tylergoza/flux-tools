'use strict';

var Store = require('./src/store/Store');
var Dispatcher = require('./src/dispatcher/Dispatcher');

global.window.FluxTools = {
    Store: Store,
    Dispatcher: Dispatcher
};
