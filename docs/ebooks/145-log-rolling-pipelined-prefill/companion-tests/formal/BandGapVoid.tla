------------------------------ MODULE BandGapVoid ------------------------------
EXTENDS Naturals, FiniteSets

CONSTANTS MaxEnergy, AllowedEnergies

VARIABLE hold

Init == hold = 0
Next == hold' = hold
Spec == Init /\ [][Next]_hold

AllEnergies == 0..MaxEnergy
ForbiddenEnergies == AllEnergies \ AllowedEnergies
BandGapExists == Cardinality(ForbiddenEnergies) > 0
Beta2 == IF BandGapExists THEN 1 ELSE 0

InvAllowedSubset ==
  /\ hold = hold
  /\ AllowedEnergies \subseteq AllEnergies

InvBandGapExists ==
  /\ hold = hold
  /\ BandGapExists
  /\ \E e \in 1..(MaxEnergy - 1): e \in ForbiddenEnergies

InvVoidIsPositive ==
  /\ hold = hold
  /\ BandGapExists => Beta2 > 0

=============================================================================
