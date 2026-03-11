------------------------------ MODULE Section7Formulas ------------------------------
EXTENDS Naturals

CONSTANTS C, N, S, AlphaP, AlphaQ, K

VARIABLE gate

RECURSIVE Pow(_, _)
Pow(base, exp) ==
  IF exp = 0 THEN 1 ELSE base * Pow(base, exp - 1)

Init == gate = 0
Next == gate' = gate
Spec == Init /\ [][Next]_gate

WorthingtonNum == S - 1
WorthingtonDen == 2 * S

SpeculativeTreeNum == Pow(AlphaQ, K) - Pow(AlphaP, K)
SpeculativeTreeDen == (AlphaQ - AlphaP) * Pow(AlphaQ, K - 1)

TurbulentIdleNum == N * (N - 1)
TurbulentIdleDen == (C + N - 1) * N

InvWellFormed ==
  /\ gate = gate
  /\ C > 0
  /\ N > 0
  /\ S > 0
  /\ K > 0
  /\ AlphaQ > AlphaP

InvWorthingtonFormulaSample ==
  /\ gate = gate
  /\ S = 8
  /\ WorthingtonNum = 7
  /\ WorthingtonDen = 16

InvSpeculativeTreeFormulaSample ==
  /\ gate = gate
  /\ AlphaP = 4
  /\ AlphaQ = 5
  /\ K = 4
  /\ SpeculativeTreeNum = 369
  /\ SpeculativeTreeDen = 125

InvTurbulentIdleFractionSample ==
  /\ gate = gate
  /\ C = 4
  /\ N = 4
  /\ 7 * TurbulentIdleNum = 3 * TurbulentIdleDen

=============================================================================
