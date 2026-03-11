------------------------------ MODULE QuantumDeficit ------------------------------
EXTENDS Naturals

CONSTANTS N, RootN

VARIABLE phase

Init == phase = "steady"
Next == phase' = phase
Spec == Init /\ [][Next]_phase

ClassicalBeta1 == 0
QuantumBeta1 == RootN - 1

ClassicalDeficit == QuantumBeta1 - ClassicalBeta1

SequentialRounds == N
QuantumRounds == N \div RootN
Speedup == SequentialRounds \div QuantumRounds

InvPerfectSquare ==
  /\ phase = phase
  /\ RootN > 0
  /\ RootN * RootN = N

InvClassicalDeficit ==
  /\ phase = phase
  /\ ClassicalDeficit = RootN - 1

InvSpeedupIdentity ==
  /\ phase = phase
  /\ Speedup = ClassicalDeficit + 1

=============================================================================
