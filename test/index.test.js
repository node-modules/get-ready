'use strict';

const should = require('should');
const ready = require('../');

function SomeClass() {
  this.property = 'value';
}
ready.mixin(SomeClass.prototype);

SomeClass.prototype.method = function() {
  return 'method';
};

describe('inherits', function() {
  const someClass = new SomeClass();
  const anotherClass = new SomeClass();

  it('should have Ready properties', function() {
    someClass.should.have.property('ready');
  });

  it('should be separate from other instances', function() {
    anotherClass.ready(function() {});
    someClass.ready(function() {});
    someClass.ready(function() {});
    anotherClass.should.have.property('_readyCallbacks').with.length(1);
    someClass.should.have.property('_readyCallbacks').with.length(2);
  });

  it('should ready(obj) directly work', function () {
    const foo = {};
    should.not.exist(foo.ready);
    ready(foo);
    foo.ready.should.be.a.Function;
  });
});

describe('ready', function() {
  const someClass = new SomeClass();

  it('should queue callbacks', function() {
    someClass.ready(function() {});
    someClass.should.have.property('_readyCallbacks').with.length(1);
    someClass.ready(function() {});
    someClass.should.have.property('_readyCallbacks').with.length(2);
  });

  it('should execute and dequeue callbacks', function(done) {
    someClass.should.have.property('_readyCallbacks').with.length(2);
    someClass.ready(function() {
      someClass.should.have.property('_readyCallbacks').with.length(0);
      done();
    });
    someClass.ready(true);
  });

  it('should immediatly call callback when already ready', function(done) {
    someClass.ready(function() {
      done();
    });
  });

  it('should not call when ready set to false', function(done) {
    someClass.ready(false);
    someClass.ready(function(done) {
      done('should not execute because it is not ready');
    });
    setTimeout(function() {
      done();
    }, 10);
  });
});

describe('promise', function () {
  it('should resolve after ready', function (done) {
    const someClass = new SomeClass();
    someClass.ready().then(function () {
      someClass.ready().then(done);
    });
    someClass.ready(true);
  });
});

describe('generator', function () {
  it('should work with co', function* () {
    const someClass = new SomeClass();
    setTimeout(function () {
      someClass.ready(true);
    }, 100);
    yield someClass.ready();
  });
});
