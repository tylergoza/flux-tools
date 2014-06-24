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
     * @param {Object} item - The config item.
     * @param {*} item.data - The data to store.
     * @param {Number} item.index[item.index=this.data.length] - The position to insert the data.
     * @param {Number|String} item.id[item.id=Date.now()] - A unique id for the data.
     */
    add: function(item) {
        var id = item.id !== undefined ? item.id : Date.now();
        var index = item.index !== undefined ? item.index : this._data.length;

        this._data.splice(index, 0, {
            id: id,
            data: item.data
        });
    },

    /**
     * @method remove
     * Removes a datum from the store.
     * @param {Number|String} id - The id to remove.
     */
    remove: function(id) {
        for (var i = 0, len = this._data.length; i < len; i++) {
            if (this._data[i].id === id) {
                this._data.splice(i, 1);
                break;
            }
        }
    },

    /**
     * @type {Number} count
     * The number of data items in the store.
     */
    get length() {
        return this._data.length;
    }
};

module.exports = Store;
