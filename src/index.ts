import { EventEmitter } from 'node:events';

export type CallbackFunction = (err: Error | undefined) => void;
export type ReadyFunctionArg = boolean | Error | CallbackFunction;

export class Ready {
  #isReady: boolean;
  #readyCallbacks: CallbackFunction[];
  #readyError?: Error;

  constructor() {
    this.#isReady = false;
    this.#readyCallbacks = [];
  }

  ready(): Promise<void>;
  ready(flagOrFunction: ReadyFunctionArg): void;
  ready(flagOrFunction?: ReadyFunctionArg) {
    // register a callback
    if (flagOrFunction === undefined || typeof flagOrFunction === 'function') {
      return this.#register(flagOrFunction);
    }
    // get ready and emit callbacks
    this.#emit(flagOrFunction);
  }

  get isReady(): boolean {
    return this.#isReady;
  }

  get readyError() {
    return this.#readyError;
  }

  get hasReadyCallbacks() {
    return this.#readyCallbacks.length > 0;
  }

  /**
   * Register a callback to the callback stack, it will be called when emit.
   * It will return promise when no argument passing.
   */
  #register(func?: CallbackFunction) {
    // support `this.ready().then(onReady)` and `await this.ready()`
    if (!func) {
      return new Promise<void>((resolve, reject) => {
        function func(err?: Error) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
        if (this.#isReady) {
          return func(this.#readyError);
        }
        this.#readyCallbacks.push(func);
      });
    }

    // this.ready(fn)
    if (this.#isReady) {
      func(this.#readyError);
    } else {
      this.#readyCallbacks.push(func);
    }
  }

  /**
   * Call the callbacks that has been registered, and clean the callback stack.
   * If the flag is not false, it will be marked as ready. Then the callbacks will be called immediately when register.
   * @param {Boolean|Error} flag - Set a flag whether it had been ready. If the flag is an error, it's also ready, but the callback will be called with argument `error`
   */
  #emit(flag: boolean | Error) {
    // this.ready(true)
    // this.ready(err)
    // this.ready(false)
    this.#isReady = flag !== false;
    this.#readyError = flag instanceof Error ? flag : undefined;
    // this.ready(true) or this.ready(err)
    if (this.#isReady) {
      this.#readyCallbacks
        .splice(0, Infinity)
        .forEach(callback => process.nextTick(() => callback(this.#readyError)));
    }
  }

  /**
   * @param {Object} obj - an object that be mixed
   */
  static mixin(obj?: any) {
    if (!obj) return;
    const readyObject = new Ready();
    // delegate method
    obj.ready = (flagOrFunction: any) => {
      return readyObject.ready(flagOrFunction);
    };
  }
}

export default Ready;

/**
 * EventEmitter Ready Wrapper
 */
export class ReadyEventEmitter extends EventEmitter {
  #readyObj = new Ready();

  ready(): Promise<void>;
  ready(flagOrFunction: ReadyFunctionArg): void;
  ready(flagOrFunction?: ReadyFunctionArg) {
    if (flagOrFunction === undefined) {
      return this.#readyObj.ready();
    }
    this.#readyObj.ready(flagOrFunction);
  }

  get isReady(): boolean {
    return this.#readyObj.isReady;
  }

  get readyError() {
    return this.#readyObj.readyError;
  }

  get hasReadyCallbacks() {
    return this.#readyObj.hasReadyCallbacks;
  }
}
