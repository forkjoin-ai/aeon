// Canonical checker implementation now lives in @a0n/aeon-logic.
// This file remains as a compatibility shim for companion imports.
export {
  ForkRaceFoldModelChecker,
  checkerTraceToTlcJson,
  checkerTraceToTlcText,
  parseTlcConfig,
  parseTlcTextTrace,
  parseTlaModule,
  renderTlaModule,
  serializeTlcConfig,
  toTlaValue,
} from '@a0n/aeon-logic';

export type {
  CheckerOptions,
  CheckerResult,
  CheckerStats,
  NamedPredicate,
  TemporalAction,
  TemporalModel,
  TraceStep,
  Violation,
  WeakFairnessRule,
} from '@a0n/aeon-logic';
