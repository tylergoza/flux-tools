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
