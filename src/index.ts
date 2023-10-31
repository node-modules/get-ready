export type CallbackFunction = (err?: Error, resolvedData?: any) => void;
export type ReadyFunctionArg = boolean | Error | CallbackFunction | undefined;

export class Ready {
  #isReady: boolean;
  #readyCallbacks: CallbackFunction[];
  #readyArg?: Error = undefined;
  #resolved?: any = undefined;

  constructor() {
    this.#isReady = false;
    this.#readyCallbacks = [];
  }

  ready(flagOrFunction?: ReadyFunctionArg, resolved?: unknown) {
    // register a callback
    if (flagOrFunction === undefined || typeof flagOrFunction === 'function') {
      return this.#register(flagOrFunction);
    }
    // emit callbacks
    this.#emit(flagOrFunction, resolved);
  }

  /**
   * Register a callback to the callback stack, it will be called when emit.
   * It will return promise when no argument passing.
   */
  #register(func?: CallbackFunction) {
    // support `this.ready().then(onready);` and `await this.ready()`;
    if (!func) {
      return new Promise<void>((resolve, reject) => {
        function func(err?: Error, data?: any) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
        if (this.#isReady) {
          return func(this.#readyArg, this.#resolved);
        }
        this.#readyCallbacks.push(func);
      });
    }

    // this.ready(fn)
    if (this.#isReady) {
      func(this.#readyArg, this.#resolved);
    } else {
      this.#readyCallbacks.push(func);
    }
  }

  /**
   * Call the callbacks that has been registerd, and clean the callback stack.
   * If the flag is not false, it will be marked as ready. Then the callbacks will be called immediatly when register.
   * @param {Boolean|Error} flag - Set a flag whether it had been ready. If the flag is an error, it's also ready, but the callback will be called with argument `error`
   */
  #emit(flag: boolean | Error, resolved?: unknown) {
    // this.ready(true);
    // this.ready(false);
    // this.ready(err);
    this.#isReady = flag !== false;
    this.#readyArg = flag instanceof Error ? flag : undefined;
    // this.ready(true)
    if (this.#isReady) {
      this.#readyCallbacks
        .splice(0, Infinity)
        .forEach(callback => process.nextTick(() => callback(this.#readyArg, resolved)));
    }
  }

  /**
   * @param {Object} obj - an object that be mixed
   */
  static mixin(obj?: any) {
    if (!obj) return;
    const ready = new Ready();
    // delegate method
    obj.ready = (flagOrFunction: any, resolved?: unknown) => ready.ready(flagOrFunction, resolved);
  }
}

export default Ready;
