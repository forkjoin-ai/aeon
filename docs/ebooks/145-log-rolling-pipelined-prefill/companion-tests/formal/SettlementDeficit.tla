------------------------------ MODULE SettlementDeficit ------------------------------
EXTENDS Naturals

VARIABLE epoch

Init == epoch = 0
Next == epoch' = epoch
Spec == Init /\ [][Next]_epoch

IntrinsicBeta1 == 2
SequentialBeta1 == 0
ParallelBeta1 == 2

SequentialDeficit == IntrinsicBeta1 - SequentialBeta1
ParallelDeficit == IntrinsicBeta1 - ParallelBeta1

InvSequentialDeficitIsTwo ==
  /\ epoch = epoch
  /\ SequentialDeficit = 2

InvParallelDeficitIsZero ==
  /\ epoch = epoch
  /\ ParallelDeficit = 0

=============================================================================
