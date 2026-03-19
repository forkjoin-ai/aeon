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
/** Fork: opens child streams from a parent */
export declare const FORK = 1;
/** Race: marks streams as racing — first to complete wins */
export declare const RACE = 2;
/** Fold: merge results from multiple streams into one */
export declare const FOLD = 4;
/** Vent: NaN propagation, error, or cancellation */
export declare const VENT = 8;
/** Fin: stream is complete, no more frames will be sent */
export declare const FIN = 16;
/** Poison: stream is terminated due to error or cancellation */
export declare const POISON = 32;
/**
 * A single frame on the wire.
 *
 * FlowFrame {
 *   stream_id: u16      // multiplexed stream identifier
 *   sequence:  u32      // position within stream
 *   flags:     u8       // FORK | RACE | FOLD | VENT | FIN
 *   length:    u24      // payload length (up to 16MB)
 *   payload:   [u8]     // raw bytes
 * }
 *
 * Total header: 10 bytes.
 */
export interface FlowFrame {
    /** Multiplexed stream identifier (u16, 0–65535) */
    streamId: number;
    /** Sequence number within the stream (u32) */
    sequence: number;
    /** Bitfield of frame flags (FORK, RACE, FOLD, VENT, FIN) */
    flags: number;
    /** Raw payload bytes */
    payload: Uint8Array;
}
/** Stream lifecycle states */
export type FlowStreamState = 'open' | 'racing' | 'folding' | 'closed' | 'vented';
/**
 * A logical stream within the protocol.
 *
 * Streams form a tree: fork() creates children, race()/fold()
 * operate on sibling streams, vent() propagates down the tree.
 */
export interface FlowStream {
    /** Stream identifier (even = client-initiated, odd = server-initiated) */
    id: number;
    /** Current lifecycle state */
    state: FlowStreamState;
    /** Parent stream that forked this one (undefined for root streams) */
    parent?: number;
    /** Child streams forked from this one */
    children: number[];
    /** Next sequence number to assign */
    nextSequence: number;
    /** Number of frames buffered (for backpressure) */
    bufferedFrames: number;
    /** Accumulated result frames (for race/fold) */
    results: Uint8Array[];
}
/**
 * Transport-agnostic interface for sending/receiving binary data.
 *
 * Implementations exist for WebSocket, TCP, WebRTC DataChannel, IPC,
 * and in-memory (for testing).
 */
export interface FlowTransport {
    /** Send binary data over the transport */
    send(data: Uint8Array): void;
    /** Register a handler for incoming data */
    onReceive(handler: (data: Uint8Array) => void): void;
    /** Close the transport */
    close(): void;
}
/**
 * Configuration for the Aeon Flow Protocol.
 */
export interface FlowProtocolConfig {
    /**
     * Per-stream high-water mark for backpressure.
     * When a stream has this many unacknowledged frames buffered,
     * sends are paused until the remote drains.
     * @default 64
     */
    highWaterMark: number;
    /**
     * Whether this side initiates even-numbered streams (client)
     * or odd-numbered streams (server). Like HTTP/2.
     * @default 'client'
     */
    role: 'client' | 'server';
    /**
     * Maximum number of concurrent open streams.
     * @default 256
     */
    maxConcurrentStreams: number;
    /**
     * Optional FlowCodec WASM mode for background protocol upgrades.
     * Service workers can force JS-only mode to avoid repeated WASM fetches.
     * @default 'auto'
     */
    codecWasmMode?: 'auto' | 'off' | 'force';
}
/**
 * Default protocol configuration.
 */
export declare const DEFAULT_FLOW_CONFIG: FlowProtocolConfig;
/**
 * Events emitted by the protocol.
 */
export interface FlowProtocolEvents {
    /** A new frame arrived on a stream */
    frame: {
        streamId: number;
        frame: FlowFrame;
    };
    /** A stream reached the FIN state */
    streamEnd: {
        streamId: number;
    };
    /** A stream was vented */
    streamVented: {
        streamId: number;
    };
    /** A stream was poisoned */
    streamPoisoned: {
        streamId: number;
    };
    /** Backpressure: stream is paused */
    streamPaused: {
        streamId: number;
    };
    /** Backpressure: stream is resumed */
    streamResumed: {
        streamId: number;
    };
}
