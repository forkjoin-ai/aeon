import { describe, expect, it, vi } from 'vitest';
import { AeonEventEmitter } from '../../core/AeonEventEmitter';

interface TestEvents {
  alpha: (value: string) => void;
  beta: () => void;
}

describe('AeonEventEmitter', () => {
  it('delivers a stable snapshot in registration order', () => {
    const emitter = new AeonEventEmitter<TestEvents>();
    const calls: string[] = [];

    const second = vi.fn((value: string) => {
      calls.push(`second:${value}`);
    });

    emitter.on('alpha', (value) => {
      calls.push(`first:${value}`);
      emitter.off('alpha', second);
      emitter.on('alpha', (nextValue) => {
        calls.push(`late:${nextValue}`);
      });
    });
    emitter.on('alpha', second);

    emitter.emit('alpha', 'x');
    emitter.emit('alpha', 'y');

    expect(calls).toEqual(['first:x', 'second:x', 'first:y', 'late:y']);
  });

  it('supports once listeners with an explicit context', () => {
    const emitter = new AeonEventEmitter<TestEvents>();
    const context = { values: [] as string[] };

    function handler(this: typeof context, value: string): void {
      this.values.push(value);
    }

    emitter.once('alpha', handler, context);

    emitter.emit('alpha', 'one');
    emitter.emit('alpha', 'two');

    expect(context.values).toEqual(['one']);
    expect(emitter.listenerCount('alpha')).toBe(0);
  });

  it('removes once listeners by their original function reference', () => {
    const emitter = new AeonEventEmitter<TestEvents>();
    const handler = vi.fn();

    emitter.once('beta', handler);
    emitter.off('beta', handler);
    emitter.emit('beta');

    expect(handler).not.toHaveBeenCalled();
  });

  it('reports listener metadata and supports global teardown', () => {
    const emitter = new AeonEventEmitter<TestEvents>();
    const alpha = vi.fn();
    const beta = vi.fn();

    emitter.on('alpha', alpha);
    emitter.on('beta', beta);

    expect(emitter.eventNames()).toEqual(['alpha', 'beta']);
    expect(emitter.listeners('alpha')).toEqual([alpha]);
    expect(emitter.listenerCount('beta')).toBe(1);

    emitter.removeAllListeners();

    expect(emitter.eventNames()).toEqual([]);
    expect(emitter.listenerCount('alpha')).toBe(0);
  });
});
