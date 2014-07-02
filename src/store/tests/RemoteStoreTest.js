var assert = require('chai').assert;

var Dispatcher = require('../../dispatcher/Dispatcher');
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

    it('should respond to the dispatcher', function() {
        var store = new RemoteStore();
        var addCount = 0;
        var changeCount = 0;
        var addFn = function(i) {
            addCount += i;
        };
        var changeFn = function(i) {
            changeCount += i - 1;
        };

        store.on('add', addFn);
        store.on('change', changeFn);

        Dispatcher.dispatch('add', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);

        Dispatcher.dispatch('sub', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);

        store.un('add', addFn);
        Dispatcher.dispatch('add', 5);
        assert.equal(addCount, 5);
        assert.equal(changeCount, 4);
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
    });

    it('should add params', function() {
        var store = new RemoteStore({
            url: '/hello-world/'
        });

        store.addParam('name', 'Jane');
        expectedUrl = '/hello-world/?name=Jane';
        store.load();
        assert.equal(openCount, 1);
        assert.equal(sendCount, 1);

        store.removeParam('name', 'Jane');
        expectedUrl = '/hello-world/';
        store.load();
        assert.equal(openCount, 2);
        assert.equal(sendCount, 2);
    });
});

