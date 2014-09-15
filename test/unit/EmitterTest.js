'use strict';

var assert = require('assert');
var stub = require('sinon').stub;

var Emitter = require('../../src/Emitter');


describe('Emitter', function() {
    var cb1, cb2, cb3;

    beforeEach(function() {
        cb1 = stub();
        cb2 = stub();
        cb3 = stub();
    });

    it('should add listeners', function() {
        var emitter = new Emitter();

        assert.equal(emitter.addListener('edit', cb1), true);
        assert.equal(emitter.addListener('edit', cb1), false);

        emitter.addListener('edit', cb2);
        emitter.addListener('update', cb3);

        assert.equal(emitter.hasListener('edit', cb1), true);
        assert.equal(emitter.hasListener('edit', cb2), true);
        assert.equal(emitter.hasListener('update', cb3), true);
        assert.equal(emitter.hasListener('edit', cb3), false);
        assert.equal(emitter.hasListener('empty', cb1), false);
    });

    it('should not add bad methods', function() {
        var emitter = new Emitter();

        assert.equal(emitter.addListener('edit', null), false);
    });

    it('should call methods when emitted', function() {
        var emitter = new Emitter();
        var data = {value: 1};

        emitter.addListener('edit', cb1);
        emitter.addListener('edit', cb2);
        emitter.addListener('update', cb3);

        emitter.emit('edit', data);
        assert.equal(cb1.callCount, 1);
        assert.equal(cb2.callCount, 1);
        assert.equal(cb3.callCount, 0);
        assert.equal(cb1.calledWith(data), true);
        assert.equal(cb2.calledWith(data), true);

        emitter.emit('empty');
        assert.equal(cb1.callCount, 1);
        assert.equal(cb2.callCount, 1);
        assert.equal(cb3.callCount, 0);
    });

    it('should remove listeners', function() {
        var emitter = new Emitter();

        emitter.addListener('edit', cb1);
        emitter.addListener('edit', cb2);
        emitter.removeListener('edit', cb1);
        emitter.removeListener('edit', cb2);

        assert.equal(emitter.hasListener('edit', cb1), false);
        assert.equal(emitter.removeListener('edit', cb1), false);
    });
});
