/**
 * Aeon Flow Module
 *
 * The unified fork/race/collapse protocol primitive with a binary wire format.
 *
 * Protocol layers:
 *   Application (inference | esi | sync | ghost | speculate)
 *   Flow Layer  (fork/race/collapse, stream mux, backpressure, poison)
 *   Frame Layer (binary codec, zerocopy buffers)
 *   Transport   (WebSocket | TCP | WebRTC DataChannel | IPC)
 */

export { AeonFlowProtocol } from './AeonFlowProtocol';

export { FlowCodec, HEADER_SIZE, MAX_PAYLOAD_LENGTH } from './FlowCodec';

export {
  FORK,
  RACE,
  COLLAPSE,
  POISON,
  FIN,
  DEFAULT_FLOW_CONFIG,
} from './types';

export type {
  FlowFrame,
  FlowStream,
  FlowStreamState,
  FlowTransport,
  FlowProtocolConfig,
  FlowProtocolEvents,
} from './types';
