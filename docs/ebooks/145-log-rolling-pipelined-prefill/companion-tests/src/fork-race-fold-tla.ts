// Canonical checker implementation now lives in @affectively/aeon-logic.
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
} from '@affectively/aeon-logic';

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
} from '@affectively/aeon-logic';
