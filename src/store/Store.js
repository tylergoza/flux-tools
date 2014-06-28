'use strict';

var Dispatcher = require('../dispatcher/Dispatcher');
var EventEmitter = require('events').EventEmitter;

/**
 * @constructor
 * Creates a new store.
 * @param {[*]} initialData - An array of initial data.
 */
var Store = function(initialData) {
    this._emitter = new EventEmitter(); /** @private */
    this._data = Array.isArray(initialData) ? initialData : []; /** @private */

    this.initActions();
    registerStore(this);
};

/**
 * @method initActions
 * Initializes the actions for this store.
 * Should be overridden by sub-classes.
 * Should contain several calls to the 'on' method.
 */
Store.prototype.initActions = function() {
    return;
};

/**
 * @method on
 * Adds an event listener.
 * The event 'change' is a special listener. It is called by all other listeners.
 * @param {String} name - The name of the subscription.
 * @param {Function} callback - The function to call when {@link name} is emitted.
 */
Store.prototype.on = function(name, callback) {
    this.un(name);
    this._emitter.addListener(name, callback.bind(this));
};

/**
 * @method un
 * Removes an event listener.
 * @param {String} name - The name of the listener to cancel.
 */
Store.prototype.un = function(name) {
    this._emitter.removeAllListeners(name);
};

/**
 * @method create
 * Adds a record to the store.
 * @param {Object} data - The data to add.
 * @param {Number} index[index=this.count()] - The position to insert the data.
 */
Store.prototype.create = function(data, index) {
    this._data.splice(isNaN(index) ? this.count() : index, 0, data);
};

/**
 * @method filter
 * Finds data using the given function.
 * Finds all data that matches the predicate
 * @param {Function} fn - The predicate used to find items.
 * @returns {[*]} - An array of matched data.
 */
Store.prototype.filter = function(fn) {
    return this._data.filter(fn);
};

/**
 * @method destroy
 * Removes data using the given function.
 * Removes all data that matches the predicate.
 * @param {Function} fn - The predicate used to remove an item.
 */
Store.prototype.destroy = function(fn) {
    this._data = this._data.filter(function(value, i, arr) {
        return !fn(value, i, arr);
    });
};

/**
 * @method all
 * Gets an array of all data from the store.
 * @returns [*] - All the store's data.
 */
Store.prototype.all = function() {
    return this._data.slice();
};

/**
 * @method empty
 * Removes all data from the store.
 */
Store.prototype.empty = function() {
    this._data = [];
};

/**
 * @method count
 * Gets the number of data items in the store.
 * @returns {Number}
 */
Store.prototype.count = function() {
    return this._data.length;
};

/**
 * @private
 * @method registerStore
 * Registers the store with the Dispatcher.
 */
function registerStore(store) {
    Dispatcher.register(function(action, data) {
        if (store._emitter.listeners(action).length) {
            store._emitter.emit(action, data);

            if (action !== 'change') { //emit change for other listeners
                store._emitter.emit('change', data);
            }
        }
    }.bind(store));
}

module.exports = Store;
