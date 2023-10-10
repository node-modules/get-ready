import { strict as assert } from 'node:assert';
import Ready, { ReadyFunctionArg, Ready as ReadyBase } from '../src/index.js';

class SomeClass {
  property: string;
  #readyObject: Ready;

  constructor() {
    this.property = 'value';
    this.#readyObject = new Ready();
  }

  ready(arg?: ReadyFunctionArg) {
    return this.#readyObject.ready(arg);
  }

  method() {
    return 'method';
  }
}

class ReadySubClass extends ReadyBase {
  property: string;

  constructor() {
    super();
    this.property = 'value';
  }

  method() {
    return 'method';
  }
}

describe('Ready.mixin', () => {
  it('should exports mixin', () => {
    assert(Ready.mixin);
  });

  it('should exports Ready', () => {
    assert(Ready);
  });

  it('should not throw when mixin undefined', () => {
    Ready.mixin();
  });
});

describe('new Ready()', () => {
  it('should have Ready properties', () => {
    const someClass = new SomeClass();
    assert('ready' in someClass);
  });

  it('should be separate from other instances', async () => {
    const someClass = new SomeClass();
    const anotherClass = new SomeClass();
    let someCallCount = 0;
    let anotherCallCount = 0;
    anotherClass.ready(() => { anotherCallCount++; });
    someClass.ready(() => { someCallCount++; });
    someClass.ready(() => { someCallCount++; });
    someClass.ready(true);
    anotherClass.ready(true);
    await nextTick();
    assert(someCallCount === 2);
    assert(anotherCallCount === 1);
  });

  it('should ready(obj) directly work', () => {
    const foo = {};
    assert(!('ready' in foo));
    Ready.mixin(foo);
    assert('ready' in foo && typeof foo.ready === 'function');
  });

  it('should execute and dequeue callbacks', async () => {
    const someClass = new SomeClass();
    const arr: number[] = [];
    someClass.ready(() => arr.push(1));
    someClass.ready(() => arr.push(2));
    someClass.ready(true);
    await nextTick();
    assert.deepEqual(arr, [ 1, 2 ]);

    someClass.ready(true);
    await nextTick();
    assert.deepEqual(arr, [ 1, 2 ]);
  });

  it('should immediatly call callback when already ready', done => {
    const someClass = new SomeClass();
    someClass.ready(true);
    someClass.ready(done);
  });

  it('should not call when ready set to false', done => {
    const someClass = new SomeClass();
    someClass.ready(true);
    someClass.ready(false);
    someClass.ready(() => {
      done(new Error('should not execute because it is not ready'));
    });
    setTimeout(() => {
      done();
    }, 10);
  });

  it('should ready when using other type', done => {
    const someClass = new SomeClass();
    someClass.ready(done);
    someClass.ready(0 as any);
  });
});

describe('promise', () => {
  it('should resolve after ready', done => {
    const someClass = new SomeClass();
    someClass.ready()!.then(() => {
      someClass.ready()!.then(done);
    });
    someClass.ready(true);
  });

  it('should await work', async () => {
    const someClass = new SomeClass();
    setTimeout(() => {
      someClass.ready(true);
    }, 100);
    await someClass.ready();
  });
});

describe('error', () => {
  it('should get error in callback', done => {
    const someClass = new SomeClass();
    someClass.ready(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
    someClass.ready(new Error('error'));
  });

  it('should get error in promise', done => {
    const someClass = new SomeClass();
    someClass.ready()!.catch(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
    someClass.ready(new Error('error'));
  });

  it('should get error after ready in callback', done => {
    const someClass = new SomeClass();
    someClass.ready(new Error('error'));
    someClass.ready(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
  });

  it('should get error after ready in promise', done => {
    const someClass = new SomeClass();
    someClass.ready(new Error('error'));
    someClass.ready()!.catch(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
  });
});

describe('work on Ready SubClass', () => {
  it('should have Ready properties', () => {
    const someClass = new ReadySubClass();
    assert('ready' in someClass);
    assert.equal(typeof someClass.ready, 'function');
  });

  it('should be separate from other instances', async () => {
    const someClass = new ReadySubClass();
    const anotherClass = new ReadySubClass();
    let someCallCount = 0;
    let anotherCallCount = 0;
    anotherClass.ready(() => { anotherCallCount++; });
    someClass.ready(() => { someCallCount++; });
    someClass.ready(() => { someCallCount++; });
    someClass.ready(true);
    anotherClass.ready(true);
    await nextTick();
    assert(someCallCount === 2);
    assert(anotherCallCount === 1);
  });
});

function nextTick() {
  return new Promise<void>(resolve => {
    process.nextTick(resolve);
  });
}
