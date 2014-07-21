var assert = require('chai').assert;

var RemoteStore = require('../RemoteStore');

describe('RemoteStore', function() {
    var openCount;
    var sendCount;
    var expectedUrl;

    beforeEach(function() {
        openCount = 0;
        sendCount = 0;
        expectedUrl = '';

        global.XMLHttpRequest = function() {
            return {
                open: function(method, url, async) {
                    openCount++;
                    assert.equal(method, 'GET');
                    assert.equal(url, expectedUrl);
                    assert.equal(async, true);
                },
                send: function() {
                    sendCount++;

                    //send ok
                    this.status = 200;
                    this.responseText = JSON.stringify({
                        meta: {count: 2},
                        objects: [{
                            name: 'John Smith'
                        }, {
                            name: 'Jane Doe'
                        }]
                    });
                    this.onload();

                    //send not found
                    this.status = 404;
                    this.onload();

                    //send error
                    this.onerror();
                }
            };
        };
    });

    afterEach(function() {
        global.XMLHttpRequest = function() {};
    });

    it('should load remote data', function() {
        var store = new RemoteStore({
            url: '/hello-world/'
        });

        expectedUrl = '/hello-world/';
        store.load();
        assert.equal(openCount, 1);
        assert.equal(sendCount, 1);

        assert.deepEqual(store.all(), [{
            name: 'John Smith'
        }, {
            name: 'Jane Doe'
        }]);
        assert.deepEqual(store.meta(), {
            count: 2
        });
        assert.equal(store.count(), 2);
    });

    it('should auto load remote data', function() {
        var store;

        expectedUrl = '/hello-world/';
        store = new RemoteStore({
            url: '/hello-world/',
            autoLoad: true
        });
        assert.equal(openCount, 1);
        assert.equal(sendCount, 1);

        assert.deepEqual(store.all(), [{
            name: 'John Smith'
        }, {
            name: 'Jane Doe'
        }]);
        assert.deepEqual(store.meta(), {
            count: 2
        });
        assert.equal(store.count(), 2);
    });

    it('should change the url', function() {
        var store = new RemoteStore({
            url: '/hello-world/'
        });

        store.setUrl('/new-url/');
        assert.equal(store.getUrl(), '/new-url/');
        expectedUrl = '/new-url/';
        store.load();
        assert.equal(openCount, 1);
        assert.equal(sendCount, 1);
    });

    it('should filter remote data', function() {
        var store = new RemoteStore({
            url: '/hello-world/'
        });

        store.addFilter('name', 'John');
        expectedUrl = '/hello-world/?filters=%5B%7B%22property%22%3A%22name%22%2C%22value%22%3A%22John%22%7D%5D';
        store.load();
        assert.equal(openCount, 1);
        assert.equal(sendCount, 1);

        store.removeFilter('name', 'John');
        expectedUrl = '/hello-world/';
        store.load();
        assert.equal(openCount, 2);
        assert.equal(sendCount, 2);

        store.clearFilters();
        assert.deepEqual(store._filters, []);
    });

    it('should sort remote data', function() {
        var store = new RemoteStore({
            url: '/hello-world/'
        });

        store.addSorter('name', 'desc');
        expectedUrl = '/hello-world/?sorters=%5B%7B%22direction%22%3A%22desc%22%2C%22property%22%3A%22name%22%7D%5D';
        store.load();
        assert.equal(openCount, 1);
        assert.equal(sendCount, 1);

        store.removeSorter('name', 'desc');
        expectedUrl = '/hello-world/';
        store.load();
        assert.equal(openCount, 2);
        assert.equal(sendCount, 2);

        store.clearSorters();
        assert.deepEqual(store._sorters, []);
    });

    it('should add, get, remove, and clear params', function() {
        var store = new RemoteStore({
            url: '/hello-world/'
        });

        store.addParam('name', 'Jane');
        expectedUrl = '/hello-world/?name=Jane';
        store.load();
        assert.equal(openCount, 1);
        assert.equal(sendCount, 1);

        assert.equal(store.getParam('name'), 'Jane');

        store.removeParam('name', 'Jane');
        expectedUrl = '/hello-world/';
        store.load();
        assert.equal(openCount, 2);
        assert.equal(sendCount, 2);

        store.clearParams();
        assert.deepEqual(store._params, {});
    });
});

