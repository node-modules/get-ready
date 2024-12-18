import { strict as assert } from 'node:assert';
import Ready, { ReadyFunctionArg, Ready as ReadyBase, ReadyEventEmitter } from '../src/index.js';

class SomeClass {
  property: string;
  #readyObject: Ready;

  constructor() {
    this.property = 'value';
    this.#readyObject = new Ready();
  }

  ready(): Promise<void>;
  ready(arg: ReadyFunctionArg): void;
  ready(arg?: ReadyFunctionArg) {
    if (arg === undefined) {
      return this.#readyObject.ready();
    }
    this.#readyObject.ready(arg);
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

class ReadyEventClass extends ReadyEventEmitter {
  property: string;

  constructor() {
    super();
    this.property = 'value';
    this.ready(() => {
      this.emit('ready-event');
    });
  }

  method() {
    return 'method';
  }
}

describe('Ready.mixin', () => {
  it('should exports mixin', async () => {
    assert(Ready.mixin);
    const someObject: any = {};
    Ready.mixin(someObject);
    someObject.ready(true);
    await someObject.ready();
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

  it('should immediately call callback when already ready', done => {
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

describe('new ReadyEventClass()', () => {
  it('should have Ready properties', async () => {
    const someClass = new ReadyEventClass();
    assert('ready' in someClass);
    let gotReadyEvent = false;
    someClass.on('ready-event', () => {
      gotReadyEvent = true;
    });
    someClass.ready(true);
    await someClass.ready();
    assert.equal(gotReadyEvent, true);

    assert.equal(someClass.isReady, true);
    assert.equal(someClass.readyError, undefined);

    // ready with error
    someClass.ready(new Error('mock error'));
    await assert.rejects(async () => {
      await someClass.ready();
    }, /mock error/);
    assert.equal(someClass.isReady, true);
    assert.equal(someClass.readyError!.message, 'mock error');
  });
});

describe('promise', () => {
  it('should resolve after ready', done => {
    const someClass = new SomeClass();
    someClass.ready().then(() => {
      someClass.ready().then(done);
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
    someClass.ready().catch(err => {
      assert(err);
      assert.equal(err.message, 'error');
      done();
    });
    someClass.ready(new Error('error'));
  });

  it('should get error after ready in callback', done => {
    const someClass = new SomeClass();
    someClass.ready(new Error('error'));
    someClass.ready(err => {
      assert(err);
      assert.equal(err.message, 'error');
      done();
    });
  });

  it('should get error after ready in promise', done => {
    const someClass = new SomeClass();
    someClass.ready(new Error('error'));
    someClass.ready().catch(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
  });

  it('should await ready error', async () => {
    const someClass = new ReadySubClass();
    someClass.ready(new Error('mock async before error'));
    await assert.rejects(async () => {
      await someClass.ready();
    }, /mock async before error/);

    // again should throw error too
    await assert.rejects(async () => {
      await someClass.ready();
    }, /mock async before error/);
    assert(someClass.readyError instanceof Error);
    assert.equal(someClass.isReady, true);

    // set to false then ready again
    someClass.ready(false);
    assert.equal(someClass.isReady, false);
    assert.equal(someClass.readyError, undefined);

    setTimeout(() => {
      someClass.ready(true);
    }, 10);
    await someClass.ready();
    assert.equal(someClass.readyError, undefined);
    assert.equal(someClass.isReady, true);
  });

  it('should await ready error', async () => {
    const someClass = new SomeClass();
    setTimeout(() => {
      someClass.ready(new Error('mock async after error'));
    }, 10);
    await assert.rejects(async () => {
      await someClass.ready();
    }, /mock async after error/);
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
