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

theorem choose_keep_iff_keep_coefficient_minimal
    (alphaWeight betaWeight ventWeight repairWeight : Nat) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
        .keepMultiplicity ↔
      keepCoefficient alphaWeight betaWeight <= ventCoefficient ventWeight ∧
        keepCoefficient alphaWeight betaWeight <=
          repairCoefficient betaWeight repairWeight := by
  constructor
  · intro hChoose
    simpa [hChoose] using
      chosen_failure_action_coefficient_minimal
        alphaWeight betaWeight ventWeight repairWeight
  · rintro ⟨hKeepVent, hKeepRepair⟩
    exact choose_keep_when_keep_coefficient_min hKeepVent hKeepRepair

theorem choose_vent_iff_vent_coefficient_minimal_after_keep
    (alphaWeight betaWeight ventWeight repairWeight : Nat) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
        .payVent ↔
      ventCoefficient ventWeight <= repairCoefficient betaWeight repairWeight ∧
        ventCoefficient ventWeight < keepCoefficient alphaWeight betaWeight := by
  constructor
  · intro hChoose
    have hMinimal :
        ventCoefficient ventWeight <= keepCoefficient alphaWeight betaWeight ∧
          ventCoefficient ventWeight <= repairCoefficient betaWeight repairWeight := by
      simpa [hChoose] using
        chosen_failure_action_coefficient_minimal
          alphaWeight betaWeight ventWeight repairWeight
    rcases hMinimal with ⟨hVentKeepLe, hVentRepair⟩
    constructor
    · exact hVentRepair
    · by_contra hNot
      have hKeepVentEq :
          keepCoefficient alphaWeight betaWeight = ventCoefficient ventWeight := by
        exact le_antisymm (Nat.le_of_not_gt hNot) hVentKeepLe
      have hKeepRepair :
          keepCoefficient alphaWeight betaWeight <=
            repairCoefficient betaWeight repairWeight := by
        rw [hKeepVentEq]
        exact hVentRepair
      have hKeepChoice :
          chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
            .keepMultiplicity :=
        choose_keep_on_keep_vent_tie hKeepVentEq hKeepRepair
      rw [hChoose] at hKeepChoice
      cases hKeepChoice
  · rintro ⟨hVentRepair, hVentKeep⟩
    exact choose_vent_when_vent_coefficient_min hVentRepair hVentKeep

theorem choose_repair_iff_repair_coefficient_strictly_minimal
    (alphaWeight betaWeight ventWeight repairWeight : Nat) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
        .payRepair ↔
      repairCoefficient betaWeight repairWeight <
          keepCoefficient alphaWeight betaWeight ∧
        repairCoefficient betaWeight repairWeight <
          ventCoefficient ventWeight := by
  constructor
  · intro hChoose
    have hMinimal :
        repairCoefficient betaWeight repairWeight <=
            keepCoefficient alphaWeight betaWeight ∧
          repairCoefficient betaWeight repairWeight <= ventCoefficient ventWeight := by
      simpa [hChoose] using
        chosen_failure_action_coefficient_minimal
          alphaWeight betaWeight ventWeight repairWeight
    rcases hMinimal with ⟨hRepairKeepLe, hRepairVentLe⟩
    have hRepairKeepLt :
        repairCoefficient betaWeight repairWeight <
          keepCoefficient alphaWeight betaWeight := by
      by_contra hNot
      have hKeepRepairEq :
          keepCoefficient alphaWeight betaWeight =
            repairCoefficient betaWeight repairWeight := by
        exact le_antisymm (Nat.le_of_not_gt hNot) hRepairKeepLe
      have hKeepVent :
          keepCoefficient alphaWeight betaWeight <=
            ventCoefficient ventWeight := by
        rw [hKeepRepairEq]
        exact hRepairVentLe
      have hKeepChoice :
          chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
            .keepMultiplicity :=
        choose_keep_on_keep_repair_tie hKeepVent hKeepRepairEq
      rw [hChoose] at hKeepChoice
      cases hKeepChoice
    constructor
    · exact hRepairKeepLt
    · by_contra hNot
      have hVentRepairEq :
          ventCoefficient ventWeight =
            repairCoefficient betaWeight repairWeight := by
        exact le_antisymm (Nat.le_of_not_gt hNot) hRepairVentLe
      have hVentKeep :
          ventCoefficient ventWeight <
            keepCoefficient alphaWeight betaWeight := by
        rw [hVentRepairEq]
        exact hRepairKeepLt
      have hVentChoice :
          chooseFailureAction alphaWeight betaWeight ventWeight repairWeight =
            .payVent :=
        choose_vent_on_vent_repair_tie hVentRepairEq hVentKeep
      rw [hChoose] at hVentChoice
      cases hVentChoice
  · rintro ⟨hRepairKeep, hRepairVent⟩
    exact choose_repair_when_repair_coefficient_min hRepairKeep hRepairVent

theorem choose_not_keep_iff_keep_coefficient_not_minimal
    (alphaWeight betaWeight ventWeight repairWeight : Nat) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight ≠
        .keepMultiplicity ↔
      ventCoefficient ventWeight < keepCoefficient alphaWeight betaWeight ∨
        repairCoefficient betaWeight repairWeight <
          keepCoefficient alphaWeight betaWeight := by
  constructor
  · intro hNotKeep
    by_contra hNot
    have hKeepVent :
        keepCoefficient alphaWeight betaWeight <= ventCoefficient ventWeight := by
      apply Nat.le_of_not_gt
      intro hGt
      exact hNot (Or.inl hGt)
    have hKeepRepair :
        keepCoefficient alphaWeight betaWeight <=
          repairCoefficient betaWeight repairWeight := by
      apply Nat.le_of_not_gt
      intro hGt
      exact hNot (Or.inr hGt)
    exact hNotKeep
      (choose_keep_when_keep_coefficient_min hKeepVent hKeepRepair)
  · intro hNotMinimal
    intro hKeep
    rcases
      (choose_keep_iff_keep_coefficient_minimal
        alphaWeight betaWeight ventWeight repairWeight).1 hKeep with
      ⟨hKeepVent, hKeepRepair⟩
    cases hNotMinimal with
    | inl hVent =>
        exact (Nat.not_lt_of_ge hKeepVent hVent).elim
    | inr hRepair =>
        exact (Nat.not_lt_of_ge hKeepRepair hRepair).elim

theorem choose_not_pay_repair_iff_repair_not_strictly_minimal
    (alphaWeight betaWeight ventWeight repairWeight : Nat) :
    chooseFailureAction alphaWeight betaWeight ventWeight repairWeight ≠
        .payRepair ↔
      keepCoefficient alphaWeight betaWeight <=
          repairCoefficient betaWeight repairWeight ∨
        ventCoefficient ventWeight <=
          repairCoefficient betaWeight repairWeight := by
  constructor
  · intro hNotRepair
    by_contra hNot
    have hRepairKeep :
        repairCoefficient betaWeight repairWeight <
          keepCoefficient alphaWeight betaWeight := by
      apply Nat.lt_of_not_ge
      intro hGe
      exact hNot (Or.inl hGe)
    have hRepairVent :
        repairCoefficient betaWeight repairWeight <
          ventCoefficient ventWeight := by
      apply Nat.lt_of_not_ge
      intro hGe
      exact hNot (Or.inr hGe)
    exact hNotRepair
      (choose_repair_when_repair_coefficient_min hRepairKeep hRepairVent)
  · intro hNotMinimal
    intro hRepair
    rcases
      (choose_repair_iff_repair_coefficient_strictly_minimal
        alphaWeight betaWeight ventWeight repairWeight).1 hRepair with
      ⟨hRepairKeep, hRepairVent⟩
    cases hNotMinimal with
    | inl hKeep =>
        exact (Nat.not_lt_of_ge hKeep hRepairKeep).elim
    | inr hVent =>
        exact (Nat.not_lt_of_ge hVent hRepairVent).elim

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

theorem choose_expand_iff_under_at_or_below_redline
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : 0 < underDeficit)
    (hOver : overDeficit = 0)
    (hDeficitWeight : 0 < deficitWeight) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty =
        .expand ↔
      controllerBurden sequentialCapacity recoveredOverlap buleyRise <=
        repairRedline deficitWeight shedPenalty := by
  constructor
  · intro hChoose
    by_contra hNotLe
    have hAbove :
        repairRedline deficitWeight shedPenalty <
          controllerBurden sequentialCapacity recoveredOverlap buleyRise :=
      Nat.lt_of_not_ge hNotLe
    have hShed :=
      choose_shed_load_when_under_above_redline
        hUnder hOver hDeficitWeight hAbove
    rw [hChoose] at hShed
    cases hShed
  · intro hLe
    rcases Nat.lt_or_eq_of_le hLe with hBelow | hExact
    · exact choose_expand_below_redline hUnder hOver hDeficitWeight hBelow
    · exact choose_expand_on_under_exact_redline hUnder hOver hDeficitWeight hExact

theorem choose_shed_load_iff_under_above_redline
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : 0 < underDeficit)
    (hOver : overDeficit = 0)
    (hDeficitWeight : 0 < deficitWeight) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty =
        .shedLoad ↔
      repairRedline deficitWeight shedPenalty <
        controllerBurden sequentialCapacity recoveredOverlap buleyRise := by
  constructor
  · intro hChoose
    by_contra hNotAbove
    have hLe :
        controllerBurden sequentialCapacity recoveredOverlap buleyRise <=
          repairRedline deficitWeight shedPenalty :=
      Nat.le_of_not_gt hNotAbove
    have hExpand :=
      (choose_expand_iff_under_at_or_below_redline hUnder hOver hDeficitWeight).2 hLe
    rw [hChoose] at hExpand
    cases hExpand
  · intro hAbove
    exact choose_shed_load_when_under_above_redline hUnder hOver hDeficitWeight hAbove

theorem choose_constrain_iff_over_at_or_below_redline
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : underDeficit = 0)
    (hOver : 0 < overDeficit)
    (hDeficitWeight : 0 < deficitWeight) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty =
        .constrain ↔
      controllerBurden sequentialCapacity recoveredOverlap buleyRise <=
        repairRedline deficitWeight shedPenalty := by
  constructor
  · intro hChoose
    by_contra hNotLe
    have hAbove :
        repairRedline deficitWeight shedPenalty <
          controllerBurden sequentialCapacity recoveredOverlap buleyRise :=
      Nat.lt_of_not_ge hNotLe
    have hShed :=
      choose_shed_load_when_over_above_redline
        hUnder hOver hDeficitWeight hAbove
    rw [hChoose] at hShed
    cases hShed
  · intro hLe
    rcases Nat.lt_or_eq_of_le hLe with hBelow | hExact
    · exact choose_constrain_below_redline hUnder hOver hDeficitWeight hBelow
    · exact choose_constrain_on_over_exact_redline hUnder hOver hDeficitWeight hExact

theorem choose_shed_load_iff_over_above_redline
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : underDeficit = 0)
    (hOver : 0 < overDeficit)
    (hDeficitWeight : 0 < deficitWeight) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty =
        .shedLoad ↔
      repairRedline deficitWeight shedPenalty <
        controllerBurden sequentialCapacity recoveredOverlap buleyRise := by
  constructor
  · intro hChoose
    by_contra hNotAbove
    have hLe :
        controllerBurden sequentialCapacity recoveredOverlap buleyRise <=
          repairRedline deficitWeight shedPenalty :=
      Nat.le_of_not_gt hNotAbove
    have hConstrain :=
      (choose_constrain_iff_over_at_or_below_redline hUnder hOver hDeficitWeight).2 hLe
    rw [hChoose] at hConstrain
    cases hConstrain
  · intro hAbove
    exact choose_shed_load_when_over_above_redline hUnder hOver hDeficitWeight hAbove

theorem choose_ne_constrain_when_under
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : 0 < underDeficit)
    (hOver : overDeficit = 0)
    (hDeficitWeight : 0 < deficitWeight) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty ≠
      .constrain := by
  by_cases hLe :
      controllerBurden sequentialCapacity recoveredOverlap buleyRise <=
        repairRedline deficitWeight shedPenalty
  · have hExpand :=
      (choose_expand_iff_under_at_or_below_redline
        hUnder hOver hDeficitWeight).2 hLe
    rw [hExpand]
    decide
  · have hAbove :
        repairRedline deficitWeight shedPenalty <
          controllerBurden sequentialCapacity recoveredOverlap buleyRise :=
      Nat.lt_of_not_ge hLe
    have hShed :=
      (choose_shed_load_iff_under_above_redline
        hUnder hOver hDeficitWeight).2 hAbove
    rw [hShed]
    decide

theorem choose_ne_expand_when_over
    {sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty :
      Nat}
    (hUnder : underDeficit = 0)
    (hOver : 0 < overDeficit)
    (hDeficitWeight : 0 < deficitWeight) :
    chooseWarmupAction
        sequentialCapacity recoveredOverlap buleyRise underDeficit overDeficit deficitWeight shedPenalty ≠
      .expand := by
  by_cases hLe :
      controllerBurden sequentialCapacity recoveredOverlap buleyRise <=
        repairRedline deficitWeight shedPenalty
  · have hConstrain :=
      (choose_constrain_iff_over_at_or_below_redline
        hUnder hOver hDeficitWeight).2 hLe
    rw [hConstrain]
    decide
  · have hAbove :
        repairRedline deficitWeight shedPenalty <
          controllerBurden sequentialCapacity recoveredOverlap buleyRise :=
      Nat.lt_of_not_ge hLe
    have hShed :=
      (choose_shed_load_iff_over_above_redline
        hUnder hOver hDeficitWeight).2 hAbove
    rw [hShed]
    decide

end ForkRaceFoldTheorems
