var Emitter = function() {
    this._listeners = {}; /** @private */
};

/**
 * @addListener
 * Adds a listener to the emitter.
 * @param {String} name - The name of the listener to add.
 * @param {Function) fn - The method to call when emitted.
 */
Emitter.prototype.addListener = function(name, fn) {
    this._listeners[name] = fn;
};

/**
 * @removeListener
 * Removes a listener from the emitter.
 * @param {String} name - The name of the listener to remove.
 */
Emitter.prototype.removeListener = function(name) {
    delete this._listeners[name];
};

/**
 * @hasListener
 * Checks for a callable listener at the given name.
 * @param {String} name - The name of the listener to test.
 * @returns {Boolean} - True if the listener is callable.
 */
Emitter.prototype.hasListener = function(name) {
    return typeof this._listeners[name] === 'function';
};

/**
 * @emit
 * Calls the listener at the given name with the given data.
 * @param {String} name - The name of the listener to call.
 * @param {*} data - The data payload.
 */
Emitter.prototype.emit = function(name, data) {
    if (this.hasListener(name)) {
        this._listeners[name](data);
    }
};

module.exports = Emitter;
