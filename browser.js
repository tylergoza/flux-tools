'use strict';

var Dispatcher = require('./src/Dispatcher');
var RemoteStore = require('./src/RemoteStore');
var Store = require('./src/Store');


global.FluxTools = {
    Dispatcher: Dispatcher,
    RemoteStore: RemoteStore,
    Store: Store
};
