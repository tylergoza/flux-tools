(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var Store = require('./src/store/Store');
var Dispatcher = require('./src/dispatcher/Dispatcher');

global.window.FluxTools = {
    Store: Store,
    Dispatcher: Dispatcher
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/dispatcher/Dispatcher":3,"./src/store/Store":4}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
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
    }
};

module.exports = Dispatcher;

},{}],4:[function(require,module,exports){
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

},{"../dispatcher/Dispatcher":3,"events":2}]},{},[1])