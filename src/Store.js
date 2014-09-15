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
                return _data.slice();
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
