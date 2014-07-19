'use strict';

var Dispatcher = require('../dispatcher/Dispatcher');
var Emitter = require('../emitter/Emitter');
var utils = require('./utils');

/**
 * @constructor
 * Creates a new store.
 * @param {*[]} initialData - An array of initial data.
 */
var Store = function(cfg) {
    cfg = utils.config({
        actions: {},
        data: []
    }, cfg);

    this._emitter = new Emitter(); /** @private */
    this._actions = cfg.actions; /** @private */
    this._data = cfg.data; /** @private */

    this.initActions();
    Dispatcher.register(this._emitter.emit.bind(this._emitter));
};

/**
 * @method initActions
 * Initializes the actions for this store.
 * Can be overridden by sub-classes.
 * Should contain several calls to the 'on' method.
 */
Store.prototype.initActions = function() {
    Object.getOwnPropertyNames(this._actions).forEach(function(action) {
        this.on(action, this._actions[action]);
    }, this);
};

/**
 * @method on
 * Adds an event listener.
 * The event 'change' is a special listener. It is called by all other listeners.
 * @param {String} name - The name of the subscription.
 * @param {Function} callback - The function to call when {@link name} is emitted.
 */
Store.prototype.on = function(name, callback) {
    this._emitter.addListener(name, function(data) {
        callback.call(this, data);
    }.bind(this));
};

/**
 * @method un
 * Removes an event listener.
 * @param {String} name - The name of the listener to cancel.
 */
Store.prototype.un = function(name) {
    this._emitter.removeListener(name);
};

/**
 * @method create
 * Adds a record to the store.
 * @param {Object} data - The data to add.
 * @param {Number} index[index=this.count()] - The position to insert the data.
 */
Store.prototype.create = function(data, index) {
    this._data.splice(isNaN(index) ? this.count() : index, 0, data);
    this._emitter.emit('change', this.all());
};

/**
 * @method filter
 * Finds data using the given function.
 * Finds all data that matches the predicate.
 * @param {Function} fn - The predicate used to find items.
 * @returns {*[]} - An array of matched data.
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
    this._emitter.emit('change', this.all());
};

/**
 * @method destroyAt
 * Removes data at the given index.
 * @param {Number} index - The index at which to remove data.
 */
Store.prototype.destroyAt = function(i) {
    this._data.splice(i, 1);
    this._emitter.emit('change', this.all());
};

/**
 * @method sort
 * Sorts the store's data given the sort method.
 * @returns {*[]} - The sorted data.
 */
Store.prototype.sort = function(sortFn) {
    this._data.sort(sortFn);
    this._emitter.emit('change', this.all());

    return this._data;
};

/**
 * @method reverse
 * Reverses the store's data.
 * @returns {*[]} - The reversed data.
 */
Store.prototype.reverse = function() {
    this._data.reverse();
    this._emitter.emit('change', this.all());

    return this._data;
};

/**
 * @method at
 * Gets the item at the given index.
 * @param {Number} index - The index to get.
 */
 Store.prototype.at = function(index) {
    return this.all()[index];
 };

/**
 * @method all
 * Gets an array of all data from the store.
 * @returns {*[]} - All the store's data.
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
    this._emitter.emit('change', this.all());
};

/**
 * @method count
 * Gets the number of data items in the store.
 * @returns {Number} - The number of data items in the store.
 */
Store.prototype.count = function() {
    return this._data.length;
};

module.exports = Store;
