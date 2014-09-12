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
        }
    });

    Store.prototype.constructor.call(self, cfg);
}

module.exports = RemoteStore;
