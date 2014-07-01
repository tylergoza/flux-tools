'use strict';

var Dispatcher = {

    _callbacks: [],

    /**
     * @method register
     * Stores the given callback.
     * The callback can then be called by calling {@link dispatch} with the name.
     * @param {Function} callback - The function to call when dispatched.
     */
    register: function(callback) {
        this._callbacks.push(callback);
    },

    /**
     * @method dispatch
     * Calls each registered function with given data.
     * @param {String} name - The name of the subscription.
     * @param {*} data - The data to publish.
     */
    dispatch: function(name, data) {
        this._callbacks.forEach(function(callback) {
            callback(name, data);
        });
    },

    /**
     * @method empty
     * Clears all of the callbacks.
     */
    empty: function() {
        this._callbacks = [];
    }
};

module.exports = Dispatcher;
