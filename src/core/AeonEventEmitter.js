/**
 * Aeon Event Emitter
 *
 * Aeon's control-plane events are low-volume observation surfaces, not
 * throughput-critical data planes. This implementation favors a small, typed,
 * dependency-free API with deterministic snapshot delivery over micro-optimized
 * special cases.
 */
export class AeonEventEmitter {
  listenerMap = new Map();
  on(event, fn, context) {
    return this.registerListener(event, fn, context, false);
  }
  addListener(event, fn, context) {
    return this.registerListener(event, fn, context, false);
  }
  once(event, fn, context) {
    return this.registerListener(event, fn, context, true);
  }
  off(event, fn, context, once) {
    return this.removeListener(event, fn, context, once);
  }
  removeListener(event, fn, context, once) {
    const listeners = this.listenerMap.get(event);
    if (!listeners) {
      return this;
    }
    if (!fn) {
      this.listenerMap.delete(event);
      return this;
    }
    const retained = listeners.filter(
      (listener) =>
        listener.fn !== fn ||
        (once === true && listener.once !== true) ||
        (context !== undefined && listener.context !== context)
    );
    if (retained.length === 0) {
      this.listenerMap.delete(event);
      return this;
    }
    this.listenerMap.set(event, retained);
    return this;
  }
  removeAllListeners(event) {
    if (event === undefined) {
      this.listenerMap.clear();
      return this;
    }
    this.listenerMap.delete(event);
    return this;
  }
  emit(event, ...args) {
    const listeners = this.listenerMap.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    // Emit against a point-in-time snapshot so registration churn during
    // delivery affects only future folds.
    for (const listener of [...listeners]) {
      if (listener.once) {
        this.removeListener(event, listener.fn, listener.context, true);
      }
      listener.fn.apply(listener.context, args);
    }
    return true;
  }
  eventNames() {
    return Array.from(this.listenerMap.keys());
  }
  listeners(event) {
    return this.listenerMap.get(event)?.map((listener) => listener.fn) ?? [];
  }
  listenerCount(event) {
    return this.listenerMap.get(event)?.length ?? 0;
  }
  subscribe(event, fn, context) {
    this.on(event, fn, context);
    return () => {
      this.off(event, fn, context);
    };
  }
  registerListener(event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }
    const listeners = this.listenerMap.get(event) ?? [];
    listeners.push({
      fn,
      context: context || this,
      once,
    });
    this.listenerMap.set(event, listeners);
    return this;
  }
}
