'use strict';

var assert = require('assert');
var stub = require('sinon').stub;

var RemoteStore = require('../../src/RemoteStore');
var utils = require('../../src/utils');


describe('RemoteStore', function() {
    var mockDispatcher;

    beforeEach(function() {
        mockDispatcher = {
            register: stub()
        };
    });

    it('should create a remote store', function() {
        var data = [1, 2, 3, 4];
        var store = new RemoteStore({
            data: data,
            dispatcher: mockDispatcher,
            params: {cool: true}
        });

        assert.equal(store.id, utils.uid() - 1);
        assert.deepEqual(store.params, {cool: true});
        assert.deepEqual(store.data, [1, 2, 3, 4]);
        assert.equal(store.data, data);
    });

    it('should add and remove params', function() {
         var store = new RemoteStore({
            dispatcher: mockDispatcher
         });

         store.addParam('cool', 1);
         assert.deepEqual(store.params, {cool: 1});

         store.removeParam('cool');
         assert.deepEqual(store.params, {});
    });

    it('should set and clear params', function() {
         var store = new RemoteStore({
            dispatcher: mockDispatcher
         });
         var params = {cool: 2, cooler: 3};

         store.setParams(params);
         assert.deepEqual(store.params, {cool: 2, cooler: 3});
         assert.notEqual(store.params, params);

         store.clearParams();
         assert.deepEqual(store.params, {});
    });

    it('should set a url', function() {
        var store = new RemoteStore({
            dispatcher: mockDispatcher
        });

        assert.equal(store.url, '');
        store.setUrl('/cool/');
        assert.equal(store.url, '/cool/');
    });

    it('should load', function() {
        var store = new RemoteStore({
            dispatcher: mockDispatcher,
            params: {cool: true},
            url: '/cool/'
        });
        var open = stub();

        global.XMLHttpRequest = function() {
            var req = this;

            req.open = open;
            req.send = function() {
                req.status = 401;
                req.onload();
                req.onerror();

                req.status = 200;
                req.responseText = '---';
                req.onload();

                req.status = 200;
                req.responseText = JSON.stringify([1, 2, 3]);
                req.onload();
            };
        };

        store.load();
        assert.equal(open.calledWith('GET', '/cool/?cool=true', true), true);
        assert.deepEqual(store.data, [1, 2, 3]);
    });
});
