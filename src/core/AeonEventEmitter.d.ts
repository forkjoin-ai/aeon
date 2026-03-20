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
export declare class AeonEventEmitter<
  Events extends {
    [K in keyof Events]: EventListener;
  } = EventShape
> {
  private readonly listenerMap;
  on<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): this;
  addListener<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): this;
  once<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): this;
  off<K extends EventKey<Events>>(
    event: K,
    fn?: Events[K],
    context?: unknown,
    once?: boolean
  ): this;
  removeListener<K extends EventKey<Events>>(
    event: K,
    fn?: Events[K],
    context?: unknown,
    once?: boolean
  ): this;
  removeAllListeners<K extends EventKey<Events>>(event?: K): this;
  emit<K extends EventKey<Events>>(
    event: K,
    ...args: Parameters<Events[K]>
  ): boolean;
  eventNames(): Array<EventKey<Events>>;
  listeners<K extends EventKey<Events>>(event: K): Events[K][];
  listenerCount<K extends EventKey<Events>>(event: K): number;
  subscribe<K extends EventKey<Events>>(
    event: K,
    fn: Events[K],
    context?: unknown
  ): () => void;
  private registerListener;
}
export {};
