import Mathlib
import ForkRaceFoldTheorems.FailureController
import ForkRaceFoldTheorems.WarmupController

namespace ForkRaceFoldTheorems

/-!
# Controller Tie Breaking

The existing controller theorems prove strict optimality and score minimality.
This module closes the exact-equality boundary induced by the branch order in
`chooseFailureAction` and `chooseWarmupAction`.

The new surface is intentionally explicit:

- any failure-controller tie involving `keepMultiplicity` resolves to `keepMultiplicity`
- a failure-controller `payVent`/`payRepair` tie resolves to `payVent`
- an underfilled warm-up state at the exact redline resolves to `expand`
- an overfilled warm-up state at the exact redline resolves to `constrain`

The anti-theorems record the corresponding non-selections.
-/

theorem choose_keep_on_keep_vent_tie
    {alphaWeight betaWeight ventWeight repairWeight : Nat}
    (hKeepVent :
      keepCoefficient alphaWeight betaWeight = ventCoefficient ventWeight)
    (hKeepRepair :
      keepCoefficient alphaWeight betaWeight <= repairCoefficient betaWeight repairWeight) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
      .keepMultiplicity := by
  apply choose_keep_when_keep_coefficient_min
  · exact le_of_eq hKeepVent
  · exact hKeepRepair

theorem choose_keep_on_keep_repair_tie
    {alphaWeight betaWeight ventWeight repairWeight : Nat}
    (hKeepVent :
      keepCoefficient alphaWeight betaWeight <= ventCoefficient ventWeight)
    (hKeepRepair :
      keepCoefficient alphaWeight betaWeight = repairCoefficient betaWeight repairWeight) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
      .keepMultiplicity := by
  apply choose_keep_when_keep_coefficient_min
  · exact hKeepVent
  · exact le_of_eq hKeepRepair

theorem choose_keep_on_total_tie
    {alphaWeight betaWeight ventWeight repairWeight : Nat}
    (hKeepVent :
      keepCoefficient alphaWeight betaWeight = ventCoefficient ventWeight)
    (hVentRepair :
      ventCoefficient ventWeight = repairCoefficient betaWeight repairWeight) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
      .keepMultiplicity := by
  apply choose_keep_when_keep_coefficient_min
  · exact le_of_eq hKeepVent
  · omega

theorem total_tie_not_pay_vent
    {alphaWeight betaWeight ventWeight repairWeight : Nat}
    (hKeepVent :
      keepCoefficient alphaWeight betaWeight = ventCoefficient ventWeight)
    (hVentRepair :
      ventCoefficient ventWeight = repairCoefficient betaWeight repairWeight) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight ≠
      .payVent := by
  rw [choose_keep_on_total_tie hKeepVent hVentRepair]
  decide

theorem total_tie_not_pay_repair
    {alphaWeight betaWeight ventWeight repairWeight : Nat}
    (hKeepVent :
      keepCoefficient alphaWeight betaWeight = ventCoefficient ventWeight)
    (hVentRepair :
      ventCoefficient ventWeight = repairCoefficient betaWeight repairWeight) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight ≠
      .payRepair := by
  rw [choose_keep_on_total_tie hKeepVent hVentRepair]
  decide

theorem choose_vent_on_vent_repair_tie
    {alphaWeight betaWeight ventWeight repairWeight : Nat}
    (hVentRepair :
      ventCoefficient ventWeight = repairCoefficient betaWeight repairWeight)
    (hVentKeep :
      ventCoefficient ventWeight < keepCoefficient alphaWeight betaWeight) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
      .payVent := by
  apply choose_vent_when_vent_coefficient_min
  · exact le_of_eq hVentRepair
  · exact hVentKeep

theorem vent_repair_tie_not_pay_repair
    {alphaWeight betaWeight ventWeight repairWeight : Nat}
    (hVentRepair :
      ventCoefficient ventWeight = repairCoefficient betaWeight repairWeight)
    (hVentKeep :
      ventCoefficient ventWeight < keepCoefficient alphaWeight betaWeight) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight ≠
      .payRepair := by
  rw [choose_vent_on_vent_repair_tie hVentRepair hVentKeep]
  decide

theorem choose_expand_on_under_exact_redline
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : 0 < underDeficit)
    (hOver : overDeficit = 0)
    (hDeficitWeight : 0 < deficitWeight)
    (hExact :
      controllerBurden sequentialCapacity recoveredOverlap buleyRise =
        repairRedline deficitWeight shedPenalty) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty =
      .expand := by
  have hExpandLeConstrain :
      expandScore sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight <=
        constrainScore sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight :=
    Nat.le_of_lt (expand_lt_constrain_when_under hUnder hOver hDeficitWeight)
  have hExpandEqShed :
      expandScore sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight =
        shedScore underDeficit overDeficit deficitWeight shedPenalty := by
    rw [expandScore_under_form hUnder hOver, shedScore_under_form hUnder hOver, hExact]
  simp [chooseWarmupAction, hExpandLeConstrain, hExpandEqShed.le]

theorem under_exact_redline_not_shed
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : 0 < underDeficit)
    (hOver : overDeficit = 0)
    (hDeficitWeight : 0 < deficitWeight)
    (hExact :
      controllerBurden sequentialCapacity recoveredOverlap buleyRise =
        repairRedline deficitWeight shedPenalty) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty ≠
      .shedLoad := by
  rw [choose_expand_on_under_exact_redline hUnder hOver hDeficitWeight hExact]
  decide

theorem choose_constrain_on_over_exact_redline
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : underDeficit = 0)
    (hOver : 0 < overDeficit)
    (hDeficitWeight : 0 < deficitWeight)
    (hExact :
      controllerBurden sequentialCapacity recoveredOverlap buleyRise =
        repairRedline deficitWeight shedPenalty) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty =
      .constrain := by
  have hExpandNotLeConstrain :
      ¬ expandScore sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight <=
        constrainScore sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight :=
    Nat.not_le_of_gt (constrain_lt_expand_when_over hUnder hOver hDeficitWeight)
  have hConstrainEqShed :
      constrainScore sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight =
        shedScore underDeficit overDeficit deficitWeight shedPenalty := by
    rw [constrainScore_over_form hUnder hOver, shedScore_over_form hUnder hOver, hExact]
  simp [chooseWarmupAction, hExpandNotLeConstrain, hConstrainEqShed.le]

theorem over_exact_redline_not_shed
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : underDeficit = 0)
    (hOver : 0 < overDeficit)
    (hDeficitWeight : 0 < deficitWeight)
    (hExact :
      controllerBurden sequentialCapacity recoveredOverlap buleyRise =
        repairRedline deficitWeight shedPenalty) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty ≠
      .shedLoad := by
  rw [choose_constrain_on_over_exact_redline hUnder hOver hDeficitWeight hExact]
  decide

end ForkRaceFoldTheorems
