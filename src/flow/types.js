/**
 * Aeon Flow Protocol — Type Definitions
 *
 * The Aeon Flow Protocol extracts the fork/race/fold primitive that
 * appears independently across the entire stack (inference, ESI, sync,
 * shell, frontend) into a unified, protocol-level abstraction with a
 * pure binary wire format.
 *
 * @see docs/ebooks/145-log-rolling-pipelined-prefill/ch14-aeon-flow-protocol.md
 */
// ═══════════════════════════════════════════════════════════════════════════════
// Frame Flags
// ═══════════════════════════════════════════════════════════════════════════════
/** Fork: opens child streams from a parent */
export const FORK = 0x01;
/** Race: marks streams as racing — first to complete wins */
export const RACE = 0x02;
/** Fold: merge results from multiple streams into one */
export const FOLD = 0x04;
/** Vent: NaN propagation, error, or cancellation */
export const VENT = 0x08;
/** Fin: stream is complete, no more frames will be sent */
export const FIN = 0x10;
/** Poison: stream is terminated due to error or cancellation */
export const POISON = 0x20;
/**
 * Default protocol configuration.
 */
export const DEFAULT_FLOW_CONFIG = {
    highWaterMark: 64,
    role: 'client',
    maxConcurrentStreams: 256,
};
