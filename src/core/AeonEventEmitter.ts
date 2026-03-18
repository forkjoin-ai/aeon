/**
 * Aeon Event Emitter
 *
 * Aeon's control-plane events are low-volume observation surfaces, not
 * throughput-critical data planes. This implementation favors a small, typed,
 * dependency-free API with deterministic snapshot delivery over micro-optimized
 * special cases.
 */

type EventListener = (...args: any[]) => void;

export type AeonEventMap = Record<PropertyKey, EventListener>;

type EventShape = Record<string, EventListener>;
type EventKey<Events extends object> = keyof Events;
type ListenerRecord<Fn extends EventListener> = {
  fn: Fn;
  context: unknown;
  once: boolean;
};

export class AeonEventEmitter<
  Events extends { [K in keyof Events]: EventListener } = EventShape
> {
  private readonly listenerMap = new Map<
    EventKey<Events>,
    Array<ListenerRecord<Events[EventKey<Events>]>>
  >();

  on<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): this {
    return this.registerListener(event, fn, context, false);
  }

  addListener<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): this {
    return this.registerListener(event, fn, context, false);
  }

  once<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): this {
    return this.registerListener(event, fn, context, true);
  }

  off<K extends EventKey<Events>>(
    event: K,
    fn?: Events[K],
    context?: unknown,
    once?: boolean
  ): this {
    return this.removeListener(event, fn, context, once);
  }

  removeListener<K extends EventKey<Events>>(
    event: K,
    fn?: Events[K],
    context?: unknown,
    once?: boolean
  ): this {
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

    this.listenerMap.set(
      event,
      retained as Array<ListenerRecord<Events[EventKey<Events>]>>
    );

    return this;
  }

  removeAllListeners<K extends EventKey<Events>>(event?: K): this {
    if (event === undefined) {
      this.listenerMap.clear();
      return this;
    }

    this.listenerMap.delete(event);
    return this;
  }

  emit<K extends EventKey<Events>>(
    event: K,
    ...args: Parameters<Events[K]>
  ): boolean {
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

  eventNames(): Array<EventKey<Events>> {
    return Array.from(this.listenerMap.keys());
  }

  listeners<K extends EventKey<Events>>(event: K): Events[K][] {
    return (
      this.listenerMap.get(event)?.map((listener) => listener.fn as Events[K]) ??
      []
    );
  }

  listenerCount<K extends EventKey<Events>>(event: K): number {
    return this.listenerMap.get(event)?.length ?? 0;
  }

  subscribe<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): () => void {
    this.on(event, fn, context);

    return () => {
      this.off(event, fn, context);
    };
  }

  private registerListener<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context: unknown,
    once: boolean
  ): this {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    const listeners =
      this.listenerMap.get(event) ??
      ([] as Array<ListenerRecord<Events[EventKey<Events>]>>);

    listeners.push({
      fn,
      context: context || this,
      once,
    });

    this.listenerMap.set(event, listeners);

    return this;
  }
}
