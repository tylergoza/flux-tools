'use strict';

var Emitter = require('../emitter/Emitter');
var Store = require('./Store');
var utils = require('./utils');

/**
 * @constructor
 * Creates a new remote store.
 * @param {*[]} initialData - An array of initial data.
 */
var RemoteStore = function(cfg) {
    var cfgDefaults = {
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
    };
    cfg = cfg || {};

    Object.getOwnPropertyNames(cfgDefaults).forEach(function(prop) {
        if (!cfg[prop]) {
            cfg[prop] = cfgDefaults[prop];
        }
    });

    this._emitter = new Emitter(); /** @private */
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
    utils.registerStore(this);
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
 */
RemoteStore.prototype.load = function() {
    var url = utils.buildUrl(this);

    utils.get(url, function(err, request) {
        var data;

        if (err) {
            return;
        }

        data = JSON.parse(request.responseText);
        this._meta = data[this._metaParam] || {};
        this._data = data[this._rootParam] || [];
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
