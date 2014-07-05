'use strict';

var Dispatcher = require('./src/dispatcher/Dispatcher');
var RemoteStore = require('./src/store/RemoteStore');
var Store = require('./src/store/Store');

global.window.FluxTools = {
    Dispatcher: Dispatcher,
    RemoteStore: RemoteStore,
    Store: Store
};
