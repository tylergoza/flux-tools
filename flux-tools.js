(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var Dispatcher = require('./src/dispatcher/Dispatcher');
var RemoteStore = require('./src/store/RemoteStore');
var Store = require('./src/store/Store');

global.window.FluxTools = {
    Dispatcher: Dispatcher,
    RemoteStore: RemoteStore,
    Store: Store
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/dispatcher/Dispatcher":2,"./src/store/RemoteStore":4,"./src/store/Store":5}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

var Dispatcher = require('../dispatcher/Dispatcher');
var Emitter = require('../emitter/Emitter');
var Store = require('./Store');
var utils = require('./utils');

/**
 * @constructor
 * Creates a new remote store.
 * @param {*[]} initialData - An array of initial data.
 */
var RemoteStore = function(cfg) {
    cfg = utils.config({
        actions: {},
        autoLoad: false,
        url: '',
        filterParam: 'filters',
        filters: [],
        metaParam: 'meta',
        params: {},
        rootParam: 'objects',
        sorterParam: 'sorters',
        sorters: [],
        data: [],
        meta: {}
    }, cfg);

    this._emitter = new Emitter(); /** @private */
    this._actions = cfg.actions; /** @private */
    this._data = cfg.data; /** @private */
    this._meta = cfg.meta; /** @private */
    this._url = cfg.url; /** @private */
    this._filterParam = cfg.filterParam; /** @private */
    this._filters = cfg.filters; /** @private */
    this._params = cfg.params; /** @private */
    this._sorterParam = cfg.sorterParam;
    this._sorters = cfg.sorters; /** @private */
    this._rootParam = cfg.rootParam; /** @private */
    this._metaParam = cfg.metaParam; /** @private */

    this.initActions();
    Dispatcher.register(this._emitter.emit.bind(this._emitter));

    if (cfg.autoLoad) {
        this.load();
    }
};

/**
 * @extends Store
 */
Object.getOwnPropertyNames(Store.prototype).forEach(function(prop) {
    if (prop !== 'constructor') {
        RemoteStore.prototype[prop] = Store.prototype[prop];
    }
});

/**
 * @method load
 * Loads remote data into the store.
 * Makes a get request to the store's url.
 * Adds filters and sorters as GET parameters.
 * @param {Boolean} silent - True to skip emitting the change event.
 */
RemoteStore.prototype.load = function(silent) {
    var url = utils.buildUrl(this);

    utils.get(url, function(err, request) {
        var data;

        if (err) {
            return;
        }

        data = JSON.parse(request.responseText);
        this._meta = data[this._metaParam] || {};
        this._data = data[this._rootParam] || [];
        this._emitChange(silent);
    }.bind(this));
};

/**
 * @method setUrl
 * Sets the store's url.
 * @param {String} url - The new url.
 */
RemoteStore.prototype.setUrl = function(url) {
    this._url = url;
};

/**
 * @method getUrl
 * Gets the store's url.
 * @returns {String} - The store's url.
 */
RemoteStore.prototype.getUrl = function() {
    return this._url;
};

/**
 * @method addFilter
 * Adds a filter to the store.
 * @param {String} property - The property to filter on.
 * @param {String} value - The value to filter on.
 */
RemoteStore.prototype.addFilter = function(property, value) {
    this._filters.push({
        property: property,
        value: value
    });
};

/**
 * @method removeFilter
 * Removes all filters that have the given property and value.
 * @param {String} property - The property to filter on.
 * @param {String} value - The value to filter on.
 */
RemoteStore.prototype.removeFilter = function(property, value) {
    this._filters = this._filters.filter(function(filter) {
        return !(filter.property === property && filter.value === value);
    });
};

/**
 * @method clearFilters
 * Removes all filters.
 */
RemoteStore.prototype.clearFilters = function() {
    this._filters = [];
};

/**
 * @method addSorter
 * Adds a sorter to the store.
 * @param {String} property - The property to sort on.
 * @param {String} direction - The direction to sort.
 */
RemoteStore.prototype.addSorter = function(property, direction) {
    this._sorters.push({
        direction: direction,
        property: property
    });
};

/**
 * @method removeSorter
 * Removes all sorters that have the given property and direction.
 * @param {String} property - The property to sort on.
 * @param {String} direction - The direction to sort.
 */
RemoteStore.prototype.removeSorter = function(property, direction) {
    this._sorters = this._sorters.filter(function(filter) {
        return !(filter.property === property && filter.direction === direction);
    });
};

/**
 * @method clearSorters
 * Removes all sorters.
 */
RemoteStore.prototype.clearSorters = function() {
    this._sorters = [];
};

/**
 * @method addParam
 * Adds a param to the store.
 * @param {String} param - The name of the param.
 * @param {String} value - The param value.
 */
RemoteStore.prototype.addParam = function(param, value) {
    this._params[param] = value;
};

/**
 * @method removeParam
 * Removes a param from the store.
 * @param {String} param - The name of the param.
 */
RemoteStore.prototype.removeParam = function(param) {
    delete this._params[param];
};

/**
 * @method clearParams
 * Removes all params.
 */
RemoteStore.prototype.clearParams = function() {
    this._params = {};
};

/**
 * @method meta
 * Gets the store's meta data.
 * @returns {Object} - The store's meta data.
 */
 RemoteStore.prototype.meta = function() {
    return this._meta;
 };

/**
 * @method count
 * Gets the number of data items in the store.
 * @returns {Number} - The number of data items in the store.
 */
RemoteStore.prototype.count = function() {
    return this._data.length;
};

module.exports = RemoteStore;

},{"../dispatcher/Dispatcher":2,"../emitter/Emitter":3,"./Store":5,"./utils":6}],5:[function(require,module,exports){
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
 * @param {Boolean} silent - True to skip emitting the change event.
 */
Store.prototype.create = function(data, index, silent) {
    this._data.splice(isNaN(index) ? this.count() : index, 0, data);
    this._emitChange(silent);
};

/**
 * @method loadData
 * Loads data into the store. Replaces store data by default. Can append data with flag.
 * @param {*[]} data - An array of data to add to or replace the store's data.
 * @param {Boolean} silent - True to skip emitting the change event.
 */
Store.prototype.loadData = function(data, append, silent) {
    if (Array.isArray(data)) {
        this._data = append ? this._data.concat(data) : data;
        this._emitChange(silent);
    }
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
 * @param {Boolean} silent - True to skip emitting the change event.
 */
Store.prototype.destroy = function(fn, silent) {
    this._data = this._data.filter(function(value, i, arr) {
        return !fn(value, i, arr);
    });
    this._emitChange(silent);
};

/**
 * @method destroyAt
 * Removes data at the given index.
 * @param {Boolean} silent - True to skip emitting the change event.
 * @param {Number} index - The index at which to remove data.
 */
Store.prototype.destroyAt = function(i, silent) {
    this._data.splice(i, 1);
    this._emitChange(silent);
};

/**
 * @method sort
 * Sorts the store's data given the sort method.
 * @param {Boolean} silent - True to skip emitting the change event.
 * @returns {*[]} - The sorted data.
 */
Store.prototype.sort = function(sortFn, silent) {
    this._data.sort(sortFn);
    this._emitChange(silent);

    return this._data;
};

/**
 * @method reverse
 * Reverses the store's data.
 * @param {Boolean} silent - True to skip emitting the change event.
 * @returns {*[]} - The reversed data.
 */
Store.prototype.reverse = function(silent) {
    this._data.reverse();
    this._emitChange(silent);

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
 * @param {Boolean} silent - True to skip emitting the change event.
 */
Store.prototype.empty = function(silent) {
    this._data = [];
    this._emitChange(silent);
};

/**
 * @method count
 * Gets the number of data items in the store.
 * @returns {Number} - The number of data items in the store.
 */
Store.prototype.count = function() {
    return this._data.length;
};

/**
 * @method _emitChange
 * @private
 * Emits the change event unless silent is true.
 * @param {Boolean} silent - True to skip emitting the change event.
 */
Store.prototype._emitChange = function(silent) {
    if (!silent) {
        this._emitter.emit('change', this.all());
    }
};

module.exports = Store;

},{"../dispatcher/Dispatcher":2,"../emitter/Emitter":3,"./utils":6}],6:[function(require,module,exports){
/**
 * @method buildUrl
 * Builds a url for a given remote store.
 * @param {Object} store - The remote store for which to build a url.
 * @returns {String} - The built url.
 */
function buildUrl(store) {
    var url = store._url + '?';

    //add extra params
    Object.getOwnPropertyNames(store._params).forEach(function(param) {
        url +=
            encodeURIComponent(param) + '=' +
            encodeURIComponent(store._params[param]) + '&';
    }, store);

    //add filters
    if (store._filters.length) {
        url +=
            encodeURIComponent(store._filterParam) + '=' +
            encodeURIComponent(JSON.stringify(store._filters)) + '&';
    }

    //add sorters
    if (store._sorters.length) {
        url +=
            encodeURIComponent(store._sorterParam) + '=' +
            encodeURIComponent(JSON.stringify(store._sorters)) + '&';
    }

    return url.slice(0, -1);
}

/**
 * @method get
 * Makes a GET request to the given url, then calls the callback.
 * @param {String} url - The url for the request.
 * @param {Function} callback - The method to call when the request is finished.
 */
function get(url, callback) {
    var request = new XMLHttpRequest();

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            callback(undefined, request);
        } else {
            callback(new Error('RemoteStore: StatusError'), request);
        }
    };

    request.onerror = function() {
        callback(new Error('RemoteStore: Network Error'), request);
    };

    request.open('GET', url, true);
    request.send();
}

/**
 * @method config
 * Merges the given configs.
 */
function config(cfgDefaults, cfg) {
    cfgDefaults = cfgDefaults || {};
    cfg = cfg || {};

    Object.getOwnPropertyNames(cfgDefaults).forEach(function(prop) {
        if (!cfg[prop]) {
            cfg[prop] = cfgDefaults[prop];
        }
    });

    return cfg;
}

module.exports = {
    buildUrl: buildUrl,
    get: get,
    config: config
};

},{}]},{},[1])