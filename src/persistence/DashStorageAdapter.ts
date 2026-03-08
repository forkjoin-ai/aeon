import type { StorageAdapter } from './types';

export interface DashStorageBackend {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string): Promise<void> | void;
  delete(key: string): Promise<void> | void;
}

export interface DashStorageChange {
  key: string;
  operation: 'set' | 'delete';
  value?: string;
  timestamp: number;
}

export interface DashSyncClient {
  syncChanges(changes: DashStorageChange[]): Promise<void>;
}

export type DashSyncUrgency = 'realtime' | 'deferred' | 'lazy';

export interface DashSyncRule {
  /** How quickly to sync changes for keys matching this rule/prefix */
  urgency: DashSyncUrgency;
  /** Debounce/Interval for deferred/lazy sync (e.g. '1s', '1m', '1h') */
  debounce?: string | number;
  /** Maximum number of pending changes before forcing a sync */
  maxBufferSize?: number;
  /** Whether to return pending values from memory (default: true) */
  readThrough?: boolean;
}

export interface DashSyncRules {
  default?: DashSyncRule;
  /** Key prefix mapping to sync rules */
  prefixes?: Record<string, DashSyncRule>;
}

export interface DashStorageAdapterHooks {
  onSync?: (changes: DashStorageChange[]) => void;
  onSyncError?: (error: Error, changes: DashStorageChange[]) => void;
  onBufferOverflow?: (prefix: string, size: number, max: number) => void;
  onFlush?: (count: number) => void;
}

export interface DashStorageAdapterOptions {
  syncClient?: DashSyncClient;
  rules?: DashSyncRules;
  hooks?: DashStorageAdapterHooks;
  /** @deprecated Use rules.default.debounce */
  syncDebounceMs?: number;
  /** @deprecated Use rules.default.maxBufferSize */
  maxPendingChanges?: number;
  /** @deprecated Use hooks.onSyncError */
  onSyncError?: (error: Error, changes: DashStorageChange[]) => void;
}

const DEFAULT_RULE: DashSyncRule = {
  urgency: 'deferred',
  debounce: 50,
  maxBufferSize: 5000,
  readThrough: true,
};

/**
 * Storage adapter boundary for dash-backed persistence.
 *
 * Provides a "Write Pool" layer that buffers local-first writes and flushes
 * them to D1/R2 via a sync client based on declarative rules.
 */
export class DashStorageAdapter implements StorageAdapter {
  private readonly backend: DashStorageBackend;
  private readonly syncClient: DashSyncClient | null;
  private readonly rules: DashSyncRules;
  private readonly hooks: DashStorageAdapterHooks;
  private readonly pendingChanges = new Map<string, DashStorageChange>();
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private syncInFlight = false;
  private syncPending = false;

  constructor(
    backend: DashStorageBackend,
    options: DashStorageAdapterOptions = {}
  ) {
    this.backend = backend;
    this.syncClient = options.syncClient ?? null;
    this.hooks = options.hooks ?? {};

    // Migration/Fallback for deprecated options
    const defaultRule: DashSyncRule = {
      ...DEFAULT_RULE,
      ...(options.rules?.default ?? {}),
    };
    if (options.syncDebounceMs !== undefined)
      defaultRule.debounce = options.syncDebounceMs;
    if (options.maxPendingChanges !== undefined)
      defaultRule.maxBufferSize = options.maxPendingChanges;
    if (options.onSyncError && !this.hooks.onSyncError)
      this.hooks.onSyncError = options.onSyncError;

    this.rules = {
      default: defaultRule,
      prefixes: options.rules?.prefixes ?? {},
    };
  }

  /**
   * Get an item, checking the write pool (pending changes) first for consistency.
   */
  async getItem(key: string): Promise<string | null> {
    const rule = this.getRuleForKey(key);

    // Read-through: check memory first if enabled
    if (rule.readThrough !== false) {
      const pending = this.pendingChanges.get(key);
      if (pending) {
        return pending.operation === 'delete' ? null : pending.value ?? null;
      }
    }

    return await this.backend.get(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.backend.set(key, value);
    this.trackChange({
      key,
      operation: 'set',
      value,
      timestamp: Date.now(),
    });
  }

  async removeItem(key: string): Promise<void> {
    await this.backend.delete(key);
    this.trackChange({
      key,
      operation: 'delete',
      timestamp: Date.now(),
    });
  }

  getPendingSyncCount(): number {
    return this.pendingChanges.size;
  }

  async flushSync(): Promise<void> {
    if (!this.syncClient || this.pendingChanges.size === 0) {
      return;
    }
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    await this.performSync();
  }

  private trackChange(change: DashStorageChange): void {
    this.pendingChanges.set(change.key, change);

    const rule = this.getRuleForKey(change.key);

    // Immediate flush for realtime
    if (rule.urgency === 'realtime') {
      void this.performSync();
      return;
    }

    // Check for buffer overflow
    const maxSize = rule.maxBufferSize ?? 5000;
    if (this.pendingChanges.size >= maxSize) {
      this.hooks.onBufferOverflow?.(
        this.getPrefixMatch(change.key) || 'default',
        this.pendingChanges.size,
        maxSize
      );
      void this.performSync();
      return;
    }

    this.scheduleSync(rule);
  }

  private getRuleForKey(key: string): DashSyncRule {
    const prefix = this.getPrefixMatch(key);
    return (
      (prefix ? this.rules.prefixes?.[prefix] : this.rules.default) ??
      this.rules.default!
    );
  }

  private getPrefixMatch(key: string): string | null {
    if (!this.rules.prefixes) {
      return null;
    }
    // Match longest prefix first
    const prefixes = Object.keys(this.rules.prefixes).sort(
      (a, b) => b.length - a.length
    );
    return prefixes.find((p) => key.startsWith(p)) ?? null;
  }

  private scheduleSync(rule: DashSyncRule): void {
    if (!this.syncClient || this.syncTimer) {
      return;
    }

    const debounceMs =
      typeof rule.debounce === 'string'
        ? this.parseInterval(rule.debounce)
        : rule.debounce ?? 50;

    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      void this.performSync();
    }, debounceMs);
  }

  private async performSync(): Promise<void> {
    if (!this.syncClient) {
      return;
    }

    if (this.syncInFlight) {
      this.syncPending = true;
      return;
    }

    const changes = Array.from(this.pendingChanges.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
    if (changes.length === 0) {
      return;
    }

    this.pendingChanges.clear();
    this.syncInFlight = true;
    try {
      await this.syncClient.syncChanges(changes);
      this.hooks.onSync?.(changes);
      this.hooks.onFlush?.(changes.length);
    } catch (error) {
      // Re-queue changes if they haven't been overwritten by newer local writes
      for (const change of changes) {
        const current = this.pendingChanges.get(change.key);
        if (!current || change.timestamp > current.timestamp) {
          this.pendingChanges.set(change.key, change);
        }
      }

      if (this.hooks.onSyncError) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        this.hooks.onSyncError(normalizedError, changes);
      }
    } finally {
      this.syncInFlight = false;
      const rerun = this.syncPending || this.pendingChanges.size > 0;
      this.syncPending = false;
      if (rerun) {
        // Use default rule for re-run or wait for next trackChange
        this.scheduleSync(this.rules.default!);
      }
    }
  }

  private parseInterval(input: string): number {
    const match = input.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!match) return 50;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 'ms':
        return value;
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 50;
    }
  }
}
