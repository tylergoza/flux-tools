(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var Dispatcher = require('./src/Dispatcher');
var RemoteStore = require('./src/RemoteStore');
var Store = require('./src/Store');


global.FluxTools = {
    Dispatcher: Dispatcher,
    RemoteStore: RemoteStore,
    Store: Store
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/Dispatcher":2,"./src/RemoteStore":4,"./src/Store":5}],2:[function(require,module,exports){
'use strict';

var utils = require('./utils');


function Dispatcher() {
    var self = this;
    var _callbacks = {};
    var _pending = {};
    var _handled = {};
    var _name = null;
    var _data = null;
    var _dispatching = false;

    function _call(id) {
        _pending[id] = true;
        _callbacks[id](_name, _data);
        _handled[id] = true;
    }

    function _preDispatch(name, data) {
        _dispatching = true;

        Object.keys(_callbacks).forEach(function(id) {
            _pending[id] = false;
            _handled[id] = false;
        });

        _name = name;
        _data = data;
    }

    function _dispatch() {
        Object.keys(_callbacks).forEach(function(id) {
            if (_pending[id]) {
                return;
            }
            _call(id);
        });
    }

    function _postDispatch() {
        _data = null;
        _name = null;
        _dispatching = false;
    }

    self.dispatch = function(name, data) {
        if (_dispatching) {
            throw new Error('Dispatcher.dispatch: called while dispatching');
        }

        _preDispatch(name, data);
        _dispatch();
        _postDispatch();
    };

    self.register = function(cb, id) {
        if (typeof cb !== 'function') {
            throw new Error('Dispatcher.register: callback is not a function');
        }

        id = id || utils.uid();
        _callbacks[id] = cb;

        return id;
    };

    self.unregister = function(id) {
        delete _callbacks[id];
    };

    self.wait = function(ids) {
        ids.forEach(function(id) {
            if (!_dispatching) {
                throw new Error('Dispatcher.wait: called while not dispatching');
            }

            if (!_callbacks[id]) {
                throw new Error('Dispatcher.wait: called with missing id');
            }

            if (_pending[id]) {

                if (!_handled[id]) {
                    throw new Error('Dispatcher.wait: detected cycle');
                }

                return;
            }

            _call(id);
        });
    };

    Object.defineProperties(self, {
        length: {
            enumerable: true,
            get: function() {
                return Object.keys(_callbacks).length;
            }
        }
    });
}

module.exports = Dispatcher;

},{"./utils":6}],3:[function(require,module,exports){
'use strict';

function Emitter() {
    var self = this;
    var _listeners = {};

    self.addListener = function(name, callback) {
        if (typeof callback !== 'function' || self.hasListener(name, callback)) {
            return false;
        }

        _listeners[name] = _listeners[name] || [];
        _listeners[name].push(callback);

        return true;
    };

    self.emit = function(name, data) {
        if (!_listeners[name]) {
            return false;
        }

        _listeners[name].forEach(function(callback) {
            callback(data);
        });

        return true;
    };

    self.hasListener = function(name, callback) {
        var callbacks = _listeners[name];

        if (!callbacks || callbacks.indexOf(callback) === -1) {
            return false;
        }

        return true;
    };

    self.removeListener = function(name, callback) {
        if (!self.hasListener(name, callback)) {
            return false;
        }

        _listeners[name] = _listeners[name].filter(function(cb) {
            return cb !== callback;
        });

        if (!_listeners[name].length) {
            delete _listeners[name];
        }

        return true;
    };
}

module.exports = Emitter;

},{}],4:[function(require,module,exports){
'use strict';

var Store = require('./Store');
var utils = require('./utils');


function RemoteStore(cfg) {
    var self = this;
    var _cfg, _params, _parse, _url;

    _cfg = utils.config({
        params: {},
        parse: utils.parse,
        url: ''
    }, cfg, 'RemoteStore');
    _params = _cfg.params;
    _parse = _cfg.parse;
    _url = _cfg.url;

    self.addParam = function(k, v) {
        _params[k] = v;

        return self;
    };

    self.clearParams = function() {
        _params = {};
    };

    self.removeParam = function(k) {
        delete _params[k];

        return self;
    };

    self.setParams = function(p) {
        _params = utils.merge(p);

        return self;
    };

    self.setUrl = function(url) {
        _url = url;
    };

    self.load = function(opts) {
        utils.request(utils.url(_url, _params), function(err, req) {
            self.set(_parse(req), opts);
        });
    };

    Object.defineProperties(self, {
        params: {
            enumerable: true,
            get: function() {
                return utils.merge(_params);
            }
        },
        url: {
            enumerable: true,
            get: function() {
                return _url;
            }
        }
    });

    Store.prototype.constructor.call(self, cfg);
}

module.exports = RemoteStore;

},{"./Store":5,"./utils":6}],5:[function(require,module,exports){
'use strict';

var Emitter = require('./Emitter');
var utils = require('./utils');

function Store(cfg) {
    var self = this;
    var _cfg, _data, _dispatcher, _emitter, _id, _handlers;

    _cfg = utils.config({
        data: []
    }, cfg, 'Store');
    _data = _cfg.data;
    _dispatcher = _cfg.dispatcher;
    _emitter = new Emitter();
    _id = utils.uid();
    _handlers = {
        _global: {}
    };

    self.off = function(name, callback) {
        return _emitter.removeListener(name, callback);
    };

    self.on = function(name, callback) {
        return _emitter.addListener(name, callback);
    };

    self.emit = function(name, data) {
        return _emitter.emit(name, data);
    };

    self.add = function(v, o) {
        var i;

        o = new Object(o);
        i = o.at > -1 ? o.at : _data.length;
        _data.splice(i, 0, v);
        utils.change(self, o);

        return self;
    };

    self.remove = function(o) {
       var i;

        o = new Object(o);
        i = o.at > -1 ? o.at : _data.length - 1;
        _data.splice(i, 1);
        utils.change(self, o);

        return self;
    };

    self.clear = function(o) {
        o = new Object(o);

        while (_data.length) {
            _data.pop();
        }

        utils.change(self, o);

        return self;
    };

    self.set = function(data, o) {
        o = new Object(o);

        _data = Array.isArray(data) ? data.map(function(v) {
            return v;
        }) : [data];

        utils.change(self, o);

        return self;
    };

    self.registerHandlers = function(handlers, id) {
        if (id) {
            _handlers[id] = handlers;
        } else {
            _handlers._global = handlers;
        }
    };

    self.unregisterHandlers = function(id) {
        if (id) {
            delete _handlers[id];
        } else {
            _handlers._global = {};
        }
    };

    self.registerActions = function(actions) {
        var _actions = {};

        Object.keys(actions).forEach(function(key) {
            _actions[key] = actions[key].bind(self, _id, _dispatcher);
        });

        return _actions;
    };

    Object.defineProperties(self, {
        id: {
            enumerable: true,
            get: function() {
                return _id;
            }
        },
        length: {
            enumerable: true,
            get: function() {
                return _data.length;
            }
        },
        handlers: {
            enumerable: true,
            get: function() {
                return utils.merge(_handlers);
            }
        },
        values: {
            enumerable: true,
            get: function() {
                return _data;
            }
        }
    });

    _dispatcher.register(function(payload) {
        var cbs = payload.id ? _handlers[payload.id] : _handlers._global;
        var cb = cbs ? cbs[payload.action] : null;

        if (typeof cb === 'function') {
            cb.call(self, payload.data);
        }
    }, _id);
}

module.exports = Store;

},{"./Emitter":3,"./utils":6}],6:[function(require,module,exports){
'use strict';

var _uid = 1;
var utils;

utils = {
    change: function(store, opts) {
        if (!opts.silent) {
            store.emit('change', store);
        }
    },
    config: function(defaults, config, name) {
        if (!config || !config.dispatcher) {
            throw new Error(name + ' requires a Dispatcher');
        }

        return utils.merge(defaults, config);
    },
    merge: function() {
        var objs = Array.prototype.slice.call(arguments);
        var result = {};

        objs.forEach(function(obj) {
            Object.keys(obj).forEach(function(key) {
                result[key] = obj[key];
            });
        });

        return result;
    },
    parse: function(req) {
        var result;

        try {
            result = JSON.parse(req.responseText);
        } catch(e) {
            result = [];
        }

        return result;
    },
    request: function(url, cb) {
        var req = new XMLHttpRequest();

        req.onload = function() {
            if (req.status >= 200 && req.status < 400) {
                cb(undefined, req);
            } else {
                cb(new Error('Store: There was a status error.'), req);
            }
        };

        req.onerror = function() {
            cb(new Error('Store: There was a network error.'), req);
        };

        req.open('GET', url, true);
        req.send();
    },
    uid: function() {
        return _uid++;
    },
    url: function(v, params) {
         var result = v + '?';

        Object.keys(params).forEach(function(key) {
            result +=
                encodeURIComponent(key) + '=' +
                encodeURIComponent(params[key]) + '&';
        });

        return result.slice(0, -1);
    }
};

module.exports = utils;

},{}]},{},[1]);
