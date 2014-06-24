'use strict';

var Dispatcher = require('../dispatcher/Dispatcher');
var EventEmitter = require('events').EventEmitter;

/**
 * @constructor
 * Creates a new store.
 */
var Store = function() {
    this._emitter = new EventEmitter(); /** @private */
    this._data = []; /** @private */
    this.initActions();

    //register the store with the dispatcher
    Dispatcher.register(function(action, data) {
        if (this._emitter.listeners(action).length) {
            this._emitter.emit(action, data);

            if (action !== 'change') { //emit change for other listeners
                this._emitter.emit('change', data);
            }
        }
    }.bind(this));
};

Store.prototype = {
    /**
     * @method initActions
     * Initializes the actions for this store.
     * Should be overridden by sub-classes.
     * Should contain several calls to the 'on' method.
     */
    initActions: function() {
        return;
    },

    /**
     * @method on
     * Adds an event listener.
     * The event 'change' is a special listener. It is called by all other listeners.
     * @param {String} name - The name of the subscription.
     * @param {Function} callback - The function to call when {@link name} is emitted.
     * @returns {Object} - A handler for removing the listener.
     */
     on: function(name, callback) {
        this._emitter.addListener(name, callback); //add the listener
    },

    /**
     * @method un
     * Removes an event listener.
     * @param {String} name - The name of the subscription to cancel.
     */
    un: function(name, callback) {
        this._emitter.removeListener(name, callback);
    },

    /**
     * @method add
     * Adds a datum to the store.
     * @param {Object} record - The record to add.
     * @param {*} record.data - The data to store.
     * @param {Number|String} record.id[record.id=Date.now()] - A unique id for the data.
     * @param {Number} index[index=this.length] - The position to insert the data.
     * @returns {Object|undefined} - The record or undefined.
     */
    add: function(record, index) {
        var id = record.id !== undefined ? record.id : Date.now();

        if (record.data !== undefined) {
            this._data.splice(index !== undefined ? index : this.length, 0, {
                data: record.data, id: id
            });

            return record;
        }

        return;
    },

    /**
     * @method load
     * Loads in a set of records. Clears the store by default.
     * @param {[Object]} records - An array of records to add to the store.
     * @params {Boolean} append[append=false] - True to append the records instead of replacing records.
     * @returns {Number} - The number of records successfully added.
     */
    load: function(records, append) {
        var added = 0;
        append = append !== undefined ? append : false;

        if (!append) {
            this.removeAll();
        }

        for (var i = 0, len = records.length; i < len; i++) {
            if (this.add(records[i])) {
                added++;
            }
        }

        return added;
    },

    /**
     * @method findOne
     * Finds and returns all data using the given predicate.
     * @param {Function} fn - The fn used to find an item.
     * @returns {Object} - An array of matched data.
     */
    find: function(fn) {
        var records = [];

        for (var i = 0, len = this.length; i < len; i++) {
            if (fn(this._data[i])) {
                records.push(this._data[i]);
            }
        }

        return records;
    },

    /**
     * @method findById
     * Finds and returns a datum by the given id.
     * @param {Number|String} id - The id to find.
     */
    findById: function(id) {
        return this.findOne(function(record) {
            return record.id === id;
        });
    },

    /**
     * @method findOne
     * Finds and returns a datum using the given function.
     * @param {Function} fn - The fn used to find an item.
     * @returns {Object} - The first datum matched.
     */
    findOne: function(fn) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (fn(this._data[i])) {
                return this._data[i];
            }
        }
    },

    /**
     * @method remove
     * Removes data from the store using the given function.
     * Removes all data that matches the predicate.
     * @param {Function} fn - The fn used to remove an item.
     */
    remove: function(fn) {
        var removed = 0;

        while (this.removeOne(fn)) {
            removed++;
        }

        return removed;
    },

    /**
     * @removeById
     * Removes a datum from the store by id.
     * @param {Number|String} id - The id to remove.
     */
    removeById: function(id) {
        return this.removeOne(function(record) {
            return record.id === id;
        });
    },

    /**
     * @method removeOne
     * Removes a single datum from the store using the given function.
     * Removes the first datum that matches the predicate.
     * @param {Function} fn - The fn used to remove an item.
     */
    removeOne: function(fn) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (fn(this._data[i])) {
                this._data.splice(i, 1);
                return true;
            }
        }

        return false;
    },

    /**
     * @method removeAll
     * Removes all data from the store.
     */
    removeAll: function() {
        this._data = [];
    },

    /**
     * @type {Number} length
     * The number of data items in the store.
     */
    get length() {
        return this._data.length;
    }
};

module.exports = Store;
