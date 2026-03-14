import Mathlib
import ForkRaceFoldTheorems.Axioms

namespace ForkRaceFoldTheorems

theorem linear_cost_monotone
    {base penalty deficitLeft deficitRight : Nat}
    (hDeficit : deficitLeft <= deficitRight) :
    base + penalty * deficitLeft <= base + penalty * deficitRight := by
  exact Nat.add_le_add_left (Nat.mul_le_mul_left penalty hDeficit) base

structure BeautyMonotoneObjective where
  score : Nat → Nat → Nat
  monotone :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : Nat},
      latencyLeft <= latencyRight ->
        wasteLeft <= wasteRight ->
          score latencyLeft wasteLeft <= score latencyRight wasteRight

structure BeautyStrictObjective extends BeautyMonotoneObjective where
  strictMonotoneFromLatency :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : Nat},
      latencyLeft < latencyRight ->
        wasteLeft <= wasteRight ->
          score latencyLeft wasteLeft < score latencyRight wasteRight
  strictMonotoneFromWaste :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : Nat},
      latencyLeft <= latencyRight ->
        wasteLeft < wasteRight ->
          score latencyLeft wasteLeft < score latencyRight wasteRight

structure BeautyGeneralizedConvexCost where
  cost : ℝ → ℝ → ℝ
  monotone :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : ℝ},
      latencyLeft <= latencyRight ->
        wasteLeft <= wasteRight ->
          cost latencyLeft wasteLeft <= cost latencyRight wasteRight
  convex :
    ∀ {weight : ℝ}
      {latencyLeft latencyRight wasteLeft wasteRight : ℝ},
        0 <= weight ->
          weight <= 1 ->
            cost
              (weight * latencyLeft + (1 - weight) * latencyRight)
              (weight * wasteLeft + (1 - weight) * wasteRight) <=
              weight * cost latencyLeft wasteLeft +
                (1 - weight) * cost latencyRight wasteRight

structure BeautyStrictGeneralizedConvexCost extends BeautyGeneralizedConvexCost where
  strictMonotoneFromLatency :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : ℝ},
      latencyLeft < latencyRight ->
        wasteLeft <= wasteRight ->
          cost latencyLeft wasteLeft < cost latencyRight wasteRight
  strictMonotoneFromWaste :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : ℝ},
      latencyLeft <= latencyRight ->
        wasteLeft < wasteRight ->
          cost latencyLeft wasteLeft < cost latencyRight wasteRight

structure BeautyRealMonotoneObjective where
  score : ℝ → ℝ → ℝ
  monotone :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : ℝ},
      latencyLeft <= latencyRight ->
        wasteLeft <= wasteRight ->
          score latencyLeft wasteLeft <= score latencyRight wasteRight

structure BeautyRealStrictObjective extends BeautyRealMonotoneObjective where
  strictMonotoneFromLatency :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : ℝ},
      latencyLeft < latencyRight ->
        wasteLeft <= wasteRight ->
          score latencyLeft wasteLeft < score latencyRight wasteRight
  strictMonotoneFromWaste :
    ∀ {latencyLeft latencyRight wasteLeft wasteRight : ℝ},
      latencyLeft <= latencyRight ->
        wasteLeft < wasteRight ->
          score latencyLeft wasteLeft < score latencyRight wasteRight

structure BeautyMonotoneProfileWorkload where
  intrinsicBu : Bu
  implementationBuA : Bu
  implementationBuB : Bu
  latencyOfDeficit : Bu → Nat
  wasteOfDeficit : Bu → Nat
  implementationBoundA : implementationBuA <= intrinsicBu
  implementationBoundB : implementationBuB <= intrinsicBu
  deficitOrder : intrinsicBu - implementationBuA <= intrinsicBu - implementationBuB
  latencyMonotoneFromDeficit :
    ∀ {deficitLeft deficitRight : Bu},
      deficitLeft <= deficitRight ->
        latencyOfDeficit deficitLeft <= latencyOfDeficit deficitRight
  wasteMonotoneFromDeficit :
    ∀ {deficitLeft deficitRight : Bu},
      deficitLeft <= deficitRight ->
        wasteOfDeficit deficitLeft <= wasteOfDeficit deficitRight

namespace BeautyMonotoneProfileWorkload

def deficitA (workload : BeautyMonotoneProfileWorkload) : Bu :=
  workload.intrinsicBu - workload.implementationBuA

def deficitB (workload : BeautyMonotoneProfileWorkload) : Bu :=
  workload.intrinsicBu - workload.implementationBuB

def beautyA (workload : BeautyMonotoneProfileWorkload) : Bu :=
  workload.intrinsicBu - workload.deficitA

def beautyB (workload : BeautyMonotoneProfileWorkload) : Bu :=
  workload.intrinsicBu - workload.deficitB

def latencyA (workload : BeautyMonotoneProfileWorkload) : Nat :=
  workload.latencyOfDeficit workload.deficitA

def latencyB (workload : BeautyMonotoneProfileWorkload) : Nat :=
  workload.latencyOfDeficit workload.deficitB

def wasteA (workload : BeautyMonotoneProfileWorkload) : Nat :=
  workload.wasteOfDeficit workload.deficitA

def wasteB (workload : BeautyMonotoneProfileWorkload) : Nat :=
  workload.wasteOfDeficit workload.deficitB

theorem deficitA_eq
    (workload : BeautyMonotoneProfileWorkload) :
    workload.deficitA = workload.intrinsicBu - workload.implementationBuA := by
  rfl

theorem deficitB_eq
    (workload : BeautyMonotoneProfileWorkload) :
    workload.deficitB = workload.intrinsicBu - workload.implementationBuB := by
  rfl

theorem beautyA_eq
    (workload : BeautyMonotoneProfileWorkload) :
    workload.beautyA = workload.intrinsicBu - workload.deficitA := by
  rfl

theorem beautyB_eq
    (workload : BeautyMonotoneProfileWorkload) :
    workload.beautyB = workload.intrinsicBu - workload.deficitB := by
  rfl

theorem beautyA_eq_implementation
    (workload : BeautyMonotoneProfileWorkload) :
    workload.beautyA = workload.implementationBuA := by
  simpa [beautyA, deficitA] using Nat.sub_sub_self workload.implementationBoundA

theorem beautyB_eq_implementation
    (workload : BeautyMonotoneProfileWorkload) :
    workload.beautyB = workload.implementationBuB := by
  simpa [beautyB, deficitB] using Nat.sub_sub_self workload.implementationBoundB

theorem latency_monotone
    (workload : BeautyMonotoneProfileWorkload) :
    workload.latencyA <= workload.latencyB := by
  exact workload.latencyMonotoneFromDeficit workload.deficitOrder

theorem waste_monotone
    (workload : BeautyMonotoneProfileWorkload) :
    workload.wasteA <= workload.wasteB := by
  exact workload.wasteMonotoneFromDeficit workload.deficitOrder

theorem beauty_monotone
    (workload : BeautyMonotoneProfileWorkload) :
    workload.beautyB <= workload.beautyA := by
  simpa [beautyA, beautyB, deficitA, deficitB] using
    (Nat.sub_le_sub_left workload.deficitOrder workload.intrinsicBu)

theorem zero_deficit_of_full_fit
    (workload : BeautyMonotoneProfileWorkload)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu) :
    workload.deficitA = 0 := by
  simp [deficitA, hFullFit]

theorem deficitB_positive_of_strict_underfit
    (workload : BeautyMonotoneProfileWorkload)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu) :
    0 < workload.deficitB := by
  simpa [deficitB] using Nat.sub_pos_of_lt hStrictUnderfit

theorem strict_deficit_of_full_fit_underfit
    (workload : BeautyMonotoneProfileWorkload)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu) :
    workload.deficitA < workload.deficitB := by
  have hDeficitAZero : workload.deficitA = 0 :=
    workload.zero_deficit_of_full_fit hFullFit
  have hDeficitBPos : 0 < workload.deficitB :=
    workload.deficitB_positive_of_strict_underfit hStrictUnderfit
  rw [hDeficitAZero]
  exact hDeficitBPos

theorem objective_monotone
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyMonotoneObjective) :
    objective.score workload.latencyA workload.wasteA <=
      objective.score workload.latencyB workload.wasteB := by
  exact objective.monotone workload.latency_monotone workload.waste_monotone

theorem generalized_convex_cost_monotone
    (workload : BeautyMonotoneProfileWorkload)
    (costFunction : BeautyGeneralizedConvexCost) :
    costFunction.cost workload.latencyA workload.wasteA <=
      costFunction.cost workload.latencyB workload.wasteB := by
  exact costFunction.monotone
    (by exact_mod_cast workload.latency_monotone)
    (by exact_mod_cast workload.waste_monotone)

theorem real_objective_monotone
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyRealMonotoneObjective) :
    objective.score workload.latencyA workload.wasteA <=
      objective.score workload.latencyB workload.wasteB := by
  exact objective.monotone
    (by exact_mod_cast workload.latency_monotone)
    (by exact_mod_cast workload.waste_monotone)

theorem zero_deficit_objective_optimal
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyMonotoneObjective)
    (hZeroDeficit : workload.deficitA = 0) :
    workload.deficitA = 0 /\
      objective.score workload.latencyA workload.wasteA <=
        objective.score workload.latencyB workload.wasteB := by
  exact ⟨hZeroDeficit, workload.objective_monotone objective⟩

theorem zero_deficit_generalized_convex_cost_optimal
    (workload : BeautyMonotoneProfileWorkload)
    (costFunction : BeautyGeneralizedConvexCost)
    (hZeroDeficit : workload.deficitA = 0) :
    workload.deficitA = 0 /\
      costFunction.cost workload.latencyA workload.wasteA <=
        costFunction.cost workload.latencyB workload.wasteB := by
  exact ⟨hZeroDeficit, workload.generalized_convex_cost_monotone costFunction⟩

theorem zero_deficit_real_objective_optimal
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyRealMonotoneObjective)
    (hZeroDeficit : workload.deficitA = 0) :
    workload.deficitA = 0 /\
      objective.score workload.latencyA workload.wasteA <=
        objective.score workload.latencyB workload.wasteB := by
  exact ⟨hZeroDeficit, workload.real_objective_monotone objective⟩

theorem strict_generalized_convex_cost_optimality_of_strict_latency_profile
    (workload : BeautyMonotoneProfileWorkload)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictLatencyProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.latencyOfDeficit deficitLeft < workload.latencyOfDeficit deficitRight) :
    costFunction.cost workload.latencyA workload.wasteA <
      costFunction.cost workload.latencyB workload.wasteB := by
  exact costFunction.strictMonotoneFromLatency
    (by
      exact_mod_cast hStrictLatencyProfile
        (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))
    (by exact_mod_cast workload.waste_monotone)

theorem strict_generalized_convex_cost_optimality_of_strict_waste_profile
    (workload : BeautyMonotoneProfileWorkload)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictWasteProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.wasteOfDeficit deficitLeft < workload.wasteOfDeficit deficitRight) :
    costFunction.cost workload.latencyA workload.wasteA <
      costFunction.cost workload.latencyB workload.wasteB := by
  exact costFunction.strictMonotoneFromWaste
    (by exact_mod_cast workload.latency_monotone)
    (by
      exact_mod_cast hStrictWasteProfile
        (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))

theorem strict_generalized_convex_cost_optimality_of_strict_profile
    (workload : BeautyMonotoneProfileWorkload)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.latencyOfDeficit deficitLeft < workload.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.wasteOfDeficit deficitLeft < workload.wasteOfDeficit deficitRight)) :
    costFunction.cost workload.latencyA workload.wasteA <
      costFunction.cost workload.latencyB workload.wasteB := by
  cases hStrictProfile with
  | inl hStrictLatencyProfile =>
      exact workload.strict_generalized_convex_cost_optimality_of_strict_latency_profile
        costFunction hFullFit hStrictUnderfit hStrictLatencyProfile
  | inr hStrictWasteProfile =>
      exact workload.strict_generalized_convex_cost_optimality_of_strict_waste_profile
        costFunction hFullFit hStrictUnderfit hStrictWasteProfile

theorem strict_real_objective_optimality_of_strict_latency_profile
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyRealStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictLatencyProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.latencyOfDeficit deficitLeft < workload.latencyOfDeficit deficitRight) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  exact objective.strictMonotoneFromLatency
    (by
      exact_mod_cast hStrictLatencyProfile
        (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))
    (by exact_mod_cast workload.waste_monotone)

theorem strict_real_objective_optimality_of_strict_waste_profile
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyRealStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictWasteProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.wasteOfDeficit deficitLeft < workload.wasteOfDeficit deficitRight) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  exact objective.strictMonotoneFromWaste
    (by exact_mod_cast workload.latency_monotone)
    (by
      exact_mod_cast hStrictWasteProfile
        (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))

theorem strict_real_objective_optimality_of_strict_profile
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyRealStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.latencyOfDeficit deficitLeft < workload.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.wasteOfDeficit deficitLeft < workload.wasteOfDeficit deficitRight)) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  cases hStrictProfile with
  | inl hStrictLatencyProfile =>
      exact workload.strict_real_objective_optimality_of_strict_latency_profile
        objective hFullFit hStrictUnderfit hStrictLatencyProfile
  | inr hStrictWasteProfile =>
      exact workload.strict_real_objective_optimality_of_strict_waste_profile
        objective hFullFit hStrictUnderfit hStrictWasteProfile

theorem strict_objective_optimality_of_strict_latency_profile
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictLatencyProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.latencyOfDeficit deficitLeft < workload.latencyOfDeficit deficitRight) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  exact objective.strictMonotoneFromLatency
    (hStrictLatencyProfile
      (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))
    workload.waste_monotone

theorem strict_objective_optimality_of_strict_waste_profile
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictWasteProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.wasteOfDeficit deficitLeft < workload.wasteOfDeficit deficitRight) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  exact objective.strictMonotoneFromWaste
    workload.latency_monotone
    (hStrictWasteProfile
      (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))

theorem strict_objective_optimality_of_strict_profile
    (workload : BeautyMonotoneProfileWorkload)
    (objective : BeautyStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.latencyOfDeficit deficitLeft < workload.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          workload.wasteOfDeficit deficitLeft < workload.wasteOfDeficit deficitRight)) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  cases hStrictProfile with
  | inl hStrictLatencyProfile =>
      exact workload.strict_objective_optimality_of_strict_latency_profile
        objective hFullFit hStrictUnderfit hStrictLatencyProfile
  | inr hStrictWasteProfile =>
      exact workload.strict_objective_optimality_of_strict_waste_profile
        objective hFullFit hStrictUnderfit hStrictWasteProfile

end BeautyMonotoneProfileWorkload

structure BeautyFailureParetoPoint where
  deficit : Bu
  latency : ℝ
  waste : ℝ

namespace BeautyFailureParetoPoint

def cost
    (point : BeautyFailureParetoPoint)
    (costFunction : BeautyGeneralizedConvexCost) : ℝ :=
  costFunction.cost point.latency point.waste

def objectiveScore
    (point : BeautyFailureParetoPoint)
    (objective : BeautyRealMonotoneObjective) : ℝ :=
  objective.score point.latency point.waste

end BeautyFailureParetoPoint

namespace BeautyDeficitOnlyBoundary

def floorPoint : BeautyFailureParetoPoint where
  deficit := 0
  latency := 1
  waste := 1

def underfitPoint : BeautyFailureParetoPoint where
  deficit := 1
  latency := 0
  waste := 0

def latencyWasteSumObjective : BeautyRealStrictObjective where
  score := fun latency waste => latency + waste
  monotone := by
    intro latencyLeft latencyRight wasteLeft wasteRight hLatency hWaste
    linarith
  strictMonotoneFromLatency := by
    intro latencyLeft latencyRight wasteLeft wasteRight hLatency hWaste
    linarith
  strictMonotoneFromWaste := by
    intro latencyLeft latencyRight wasteLeft wasteRight hLatency hWaste
    linarith

def latencyWasteSumCost : BeautyStrictGeneralizedConvexCost where
  cost := fun latency waste => latency + waste
  monotone := by
    intro latencyLeft latencyRight wasteLeft wasteRight hLatency hWaste
    linarith
  convex := by
    intro weight latencyLeft latencyRight wasteLeft wasteRight hWeightNonneg hWeightLeOne
    have hEq :
        (weight * latencyLeft + (1 - weight) * latencyRight) +
            (weight * wasteLeft + (1 - weight) * wasteRight) =
          weight * (latencyLeft + wasteLeft) +
            (1 - weight) * (latencyRight + wasteRight) := by
      ring
    exact le_of_eq hEq
  strictMonotoneFromLatency := by
    intro latencyLeft latencyRight wasteLeft wasteRight hLatency hWaste
    linarith
  strictMonotoneFromWaste := by
    intro latencyLeft latencyRight wasteLeft wasteRight hLatency hWaste
    linarith

@[simp] theorem latencyWasteSumObjective_score
    (latency waste : ℝ) :
    latencyWasteSumObjective.score latency waste = latency + waste := by
  rfl

@[simp] theorem latencyWasteSumCost_eval
    (latency waste : ℝ) :
    latencyWasteSumCost.cost latency waste = latency + waste := by
  rfl

theorem floorPoint_zero_deficit :
    floorPoint.deficit = 0 := by
  rfl

theorem underfitPoint_positive_deficit :
    0 < underfitPoint.deficit := by
  norm_num [underfitPoint]

theorem underfitPoint_improves_both_coordinates :
    underfitPoint.latency < floorPoint.latency /\
      underfitPoint.waste < floorPoint.waste := by
  constructor <;> norm_num [floorPoint, underfitPoint]

theorem underfitPoint_beats_floor_for_sum_objective :
    underfitPoint.objectiveScore latencyWasteSumObjective.toBeautyRealMonotoneObjective <
      floorPoint.objectiveScore latencyWasteSumObjective.toBeautyRealMonotoneObjective := by
  norm_num [BeautyFailureParetoPoint.objectiveScore, floorPoint, underfitPoint]

theorem underfitPoint_beats_floor_for_sum_cost :
    underfitPoint.cost latencyWasteSumCost.toBeautyGeneralizedConvexCost <
      floorPoint.cost latencyWasteSumCost.toBeautyGeneralizedConvexCost := by
  norm_num [BeautyFailureParetoPoint.cost, floorPoint, underfitPoint]

theorem exists_componentwise_improving_positive_deficit_point :
    ∃ floor underfit : BeautyFailureParetoPoint,
      floor.deficit = 0 /\
        0 < underfit.deficit /\
        underfit.latency < floor.latency /\
        underfit.waste < floor.waste := by
  refine ⟨floorPoint, underfitPoint, ?_⟩
  constructor
  · exact floorPoint_zero_deficit
  constructor
  · exact underfitPoint_positive_deficit
  · exact underfitPoint_improves_both_coordinates

theorem exists_positive_deficit_point_below_zero_deficit_for_real_objective :
    ∃ floor underfit : BeautyFailureParetoPoint,
      floor.deficit = 0 /\
        0 < underfit.deficit /\
        underfit.objectiveScore latencyWasteSumObjective.toBeautyRealMonotoneObjective <
          floor.objectiveScore latencyWasteSumObjective.toBeautyRealMonotoneObjective := by
  refine ⟨floorPoint, underfitPoint, ?_⟩
  constructor
  · exact floorPoint_zero_deficit
  constructor
  · exact underfitPoint_positive_deficit
  · exact underfitPoint_beats_floor_for_sum_objective

theorem exists_positive_deficit_point_below_zero_deficit_for_generalized_convex_cost :
    ∃ floor underfit : BeautyFailureParetoPoint,
      floor.deficit = 0 /\
        0 < underfit.deficit /\
        underfit.cost latencyWasteSumCost.toBeautyGeneralizedConvexCost <
          floor.cost latencyWasteSumCost.toBeautyGeneralizedConvexCost := by
  refine ⟨floorPoint, underfitPoint, ?_⟩
  constructor
  · exact floorPoint_zero_deficit
  constructor
  · exact underfitPoint_positive_deficit
  · exact underfitPoint_beats_floor_for_sum_cost

end BeautyDeficitOnlyBoundary

structure BeautyFailureParetoFrontier where
  pointOnFrontier : BeautyFailureParetoPoint → Prop
  floor : BeautyFailureParetoPoint
  floorOnFrontier : pointOnFrontier floor
  floorZeroDeficit : floor.deficit = 0
  latencyFloorByMeasure :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        floor.latency <= point.latency
  wasteFloorByMeasure :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        floor.waste <= point.waste
  strictFloorGapByMeasure :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        0 < point.deficit ->
          floor.latency < point.latency \/ floor.waste < point.waste
  zeroDeficitUniqueOnFrontier :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        point.deficit = 0 ->
          point = floor

namespace BeautyFailureParetoFrontier

theorem floor_generalized_convex_cost_minimal
    (frontier : BeautyFailureParetoFrontier)
    (costFunction : BeautyGeneralizedConvexCost)
    {point : BeautyFailureParetoPoint}
    (hPoint : frontier.pointOnFrontier point) :
    frontier.floor.cost costFunction <= point.cost costFunction := by
  exact costFunction.monotone
    (frontier.latencyFloorByMeasure hPoint)
    (frontier.wasteFloorByMeasure hPoint)

theorem floor_objective_minimal
    (frontier : BeautyFailureParetoFrontier)
    (objective : BeautyRealMonotoneObjective)
    {point : BeautyFailureParetoPoint}
    (hPoint : frontier.pointOnFrontier point) :
    frontier.floor.objectiveScore objective <= point.objectiveScore objective := by
  exact objective.monotone
    (frontier.latencyFloorByMeasure hPoint)
    (frontier.wasteFloorByMeasure hPoint)

theorem floor_strict_generalized_convex_cost_optimality
    (frontier : BeautyFailureParetoFrontier)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    {point : BeautyFailureParetoPoint}
    (hPoint : frontier.pointOnFrontier point)
    (hNotFloor : point ≠ frontier.floor) :
    frontier.floor.cost costFunction.toBeautyGeneralizedConvexCost <
      point.cost costFunction.toBeautyGeneralizedConvexCost := by
  have hPositiveDeficit : 0 < point.deficit := by
    by_cases hZero : point.deficit = 0
    · exact False.elim (hNotFloor (frontier.zeroDeficitUniqueOnFrontier hPoint hZero))
    · exact Nat.pos_iff_ne_zero.mpr hZero
  have hLatencyLe := frontier.latencyFloorByMeasure hPoint
  have hWasteLe := frontier.wasteFloorByMeasure hPoint
  cases frontier.strictFloorGapByMeasure hPoint hPositiveDeficit with
  | inl hLatencyLt =>
      exact costFunction.strictMonotoneFromLatency hLatencyLt hWasteLe
  | inr hWasteLt =>
      exact costFunction.strictMonotoneFromWaste hLatencyLe hWasteLt

theorem floor_strict_objective_optimality
    (frontier : BeautyFailureParetoFrontier)
    (objective : BeautyRealStrictObjective)
    {point : BeautyFailureParetoPoint}
    (hPoint : frontier.pointOnFrontier point)
    (hNotFloor : point ≠ frontier.floor) :
    frontier.floor.objectiveScore objective.toBeautyRealMonotoneObjective <
      point.objectiveScore objective.toBeautyRealMonotoneObjective := by
  have hPositiveDeficit : 0 < point.deficit := by
    by_cases hZero : point.deficit = 0
    · exact False.elim (hNotFloor (frontier.zeroDeficitUniqueOnFrontier hPoint hZero))
    · exact Nat.pos_iff_ne_zero.mpr hZero
  have hLatencyLe := frontier.latencyFloorByMeasure hPoint
  have hWasteLe := frontier.wasteFloorByMeasure hPoint
  cases frontier.strictFloorGapByMeasure hPoint hPositiveDeficit with
  | inl hLatencyLt =>
      exact objective.strictMonotoneFromLatency hLatencyLt hWasteLe
  | inr hWasteLt =>
      exact objective.strictMonotoneFromWaste hLatencyLe hWasteLt

theorem floor_strict_generalized_convex_cost_unique_minimizer
    (frontier : BeautyFailureParetoFrontier)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    {point : BeautyFailureParetoPoint}
    (hPoint : frontier.pointOnFrontier point)
    (hLe :
      point.cost costFunction.toBeautyGeneralizedConvexCost <=
        frontier.floor.cost costFunction.toBeautyGeneralizedConvexCost) :
    point = frontier.floor := by
  by_contra hNotFloor
  have hStrict :=
    frontier.floor_strict_generalized_convex_cost_optimality
      costFunction hPoint hNotFloor
  exact (not_le_of_gt hStrict) hLe

theorem floor_strict_objective_unique_minimizer
    (frontier : BeautyFailureParetoFrontier)
    (objective : BeautyRealStrictObjective)
    {point : BeautyFailureParetoPoint}
    (hPoint : frontier.pointOnFrontier point)
    (hLe :
      point.objectiveScore objective.toBeautyRealMonotoneObjective <=
        frontier.floor.objectiveScore objective.toBeautyRealMonotoneObjective) :
    point = frontier.floor := by
  by_contra hNotFloor
  have hStrict :=
    frontier.floor_strict_objective_optimality
      objective hPoint hNotFloor
  exact (not_le_of_gt hStrict) hLe

theorem floor_strict_generalized_convex_cost_global_minimum
    (frontier : BeautyFailureParetoFrontier)
    (costFunction : BeautyStrictGeneralizedConvexCost) :
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point ->
        frontier.floor.cost costFunction.toBeautyGeneralizedConvexCost <=
          point.cost costFunction.toBeautyGeneralizedConvexCost) /\
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point ->
        point.cost costFunction.toBeautyGeneralizedConvexCost <=
          frontier.floor.cost costFunction.toBeautyGeneralizedConvexCost ->
        point = frontier.floor) := by
  refine ⟨?_, ?_⟩
  · intro point hPoint
    exact frontier.floor_generalized_convex_cost_minimal
      costFunction.toBeautyGeneralizedConvexCost hPoint
  · intro point hPoint hLe
    exact frontier.floor_strict_generalized_convex_cost_unique_minimizer
      costFunction hPoint hLe

theorem floor_strict_objective_global_minimum
    (frontier : BeautyFailureParetoFrontier)
    (objective : BeautyRealStrictObjective) :
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point ->
        frontier.floor.objectiveScore objective.toBeautyRealMonotoneObjective <=
          point.objectiveScore objective.toBeautyRealMonotoneObjective) /\
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point ->
        point.objectiveScore objective.toBeautyRealMonotoneObjective <=
          frontier.floor.objectiveScore objective.toBeautyRealMonotoneObjective ->
        point = frontier.floor) := by
  refine ⟨?_, ?_⟩
  · intro point hPoint
    exact frontier.floor_objective_minimal
      objective.toBeautyRealMonotoneObjective hPoint
  · intro point hPoint hLe
    exact frontier.floor_strict_objective_unique_minimizer
      objective hPoint hLe

end BeautyFailureParetoFrontier

structure BeautyFailureTaxObservableFrontier where
  pointOnFrontier : BeautyFailureParetoPoint → Prop
  floor : BeautyFailureParetoPoint
  failureTax : BeautyFailureParetoPoint → ℝ
  latencyFloorFromTax : ℝ → ℝ
  wasteFloorFromTax : ℝ → ℝ
  floorOnFrontier : pointOnFrontier floor
  floorZeroDeficit : floor.deficit = 0
  floorFailureTaxZero : failureTax floor = 0
  taxNonnegative :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        0 <= failureTax point
  positiveDeficitForcesPositiveTax :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        0 < point.deficit ->
          0 < failureTax point
  latencyFloorFromTaxMonotone :
    ∀ {taxLeft taxRight : ℝ},
      taxLeft <= taxRight ->
        latencyFloorFromTax taxLeft <= latencyFloorFromTax taxRight
  wasteFloorFromTaxMonotone :
    ∀ {taxLeft taxRight : ℝ},
      taxLeft <= taxRight ->
        wasteFloorFromTax taxLeft <= wasteFloorFromTax taxRight
  latencyLowerBoundByTax :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        latencyFloorFromTax (failureTax point) <= point.latency
  wasteLowerBoundByTax :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        wasteFloorFromTax (failureTax point) <= point.waste
  strictObservableGapFromPositiveTax :
    ∀ {tax : ℝ},
      0 < tax ->
        latencyFloorFromTax 0 < latencyFloorFromTax tax \/
          wasteFloorFromTax 0 < wasteFloorFromTax tax
  floorLatencyEqTaxZero :
    floor.latency = latencyFloorFromTax 0
  floorWasteEqTaxZero :
    floor.waste = wasteFloorFromTax 0
  zeroDeficitUniqueOnFrontier :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        point.deficit = 0 ->
          point = floor

namespace BeautyFailureTaxObservableFrontier

noncomputable def oneStepFloor (base tax : ℝ) : ℝ :=
  base + if 0 < tax then 1 else 0

theorem oneStepFloor_monotone
    {base taxLeft taxRight : ℝ}
    (hTax : taxLeft <= taxRight) :
    oneStepFloor base taxLeft <= oneStepFloor base taxRight := by
  by_cases hLeft : 0 < taxLeft
  · have hRight : 0 < taxRight := lt_of_lt_of_le hLeft hTax
    simp [oneStepFloor, hLeft, hRight]
  · have hLeftNonpos : taxLeft <= 0 := le_of_not_gt hLeft
    by_cases hRight : 0 < taxRight
    · have hLeftEq : oneStepFloor base taxLeft = base := by
        simp [oneStepFloor, hLeft]
      have hRightEq : oneStepFloor base taxRight = base + 1 := by
        simp [oneStepFloor, hRight]
      rw [hLeftEq, hRightEq]
      linarith
    · simp [oneStepFloor, hLeft, hRight]

theorem oneStepFloor_eq_base_at_zero
    (base : ℝ) :
    oneStepFloor base 0 = base := by
  simp [oneStepFloor]

theorem oneStepFloor_strict_of_pos
    {base tax : ℝ}
    (hTax : 0 < tax) :
    base < oneStepFloor base tax := by
  simp [oneStepFloor, hTax]

def toFailureParetoFrontier
    (bridge : BeautyFailureTaxObservableFrontier) :
    BeautyFailureParetoFrontier where
  pointOnFrontier := bridge.pointOnFrontier
  floor := bridge.floor
  floorOnFrontier := bridge.floorOnFrontier
  floorZeroDeficit := bridge.floorZeroDeficit
  latencyFloorByMeasure := by
    intro point hPoint
    have hObservableLe :
        bridge.latencyFloorFromTax 0 <=
          bridge.latencyFloorFromTax (bridge.failureTax point) :=
      bridge.latencyFloorFromTaxMonotone (bridge.taxNonnegative hPoint)
    have hLowerBound :
        bridge.latencyFloorFromTax 0 <= point.latency :=
      le_trans hObservableLe (bridge.latencyLowerBoundByTax hPoint)
    simpa [bridge.floorLatencyEqTaxZero] using hLowerBound
  wasteFloorByMeasure := by
    intro point hPoint
    have hObservableLe :
        bridge.wasteFloorFromTax 0 <=
          bridge.wasteFloorFromTax (bridge.failureTax point) :=
      bridge.wasteFloorFromTaxMonotone (bridge.taxNonnegative hPoint)
    have hLowerBound :
        bridge.wasteFloorFromTax 0 <= point.waste :=
      le_trans hObservableLe (bridge.wasteLowerBoundByTax hPoint)
    simpa [bridge.floorWasteEqTaxZero] using hLowerBound
  strictFloorGapByMeasure := by
    intro point hPoint hPositiveDeficit
    have hPositiveTax :=
      bridge.positiveDeficitForcesPositiveTax hPoint hPositiveDeficit
    cases bridge.strictObservableGapFromPositiveTax hPositiveTax with
    | inl hLatencyGap =>
        left
        have hLowerBound :
            bridge.latencyFloorFromTax 0 < point.latency :=
          lt_of_lt_of_le hLatencyGap (bridge.latencyLowerBoundByTax hPoint)
        simpa [bridge.floorLatencyEqTaxZero] using hLowerBound
    | inr hWasteGap =>
        right
        have hLowerBound :
            bridge.wasteFloorFromTax 0 < point.waste :=
          lt_of_lt_of_le hWasteGap (bridge.wasteLowerBoundByTax hPoint)
        simpa [bridge.floorWasteEqTaxZero] using hLowerBound
  zeroDeficitUniqueOnFrontier := bridge.zeroDeficitUniqueOnFrontier

theorem floor_generalized_convex_cost_minimal
    (bridge : BeautyFailureTaxObservableFrontier)
    (costFunction : BeautyGeneralizedConvexCost)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point) :
    bridge.floor.cost costFunction <= point.cost costFunction := by
  exact (bridge.toFailureParetoFrontier).floor_generalized_convex_cost_minimal
    costFunction hPoint

theorem floor_objective_minimal
    (bridge : BeautyFailureTaxObservableFrontier)
    (objective : BeautyRealMonotoneObjective)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point) :
    bridge.floor.objectiveScore objective <= point.objectiveScore objective := by
  exact (bridge.toFailureParetoFrontier).floor_objective_minimal objective hPoint

theorem floor_strict_generalized_convex_cost_optimality
    (bridge : BeautyFailureTaxObservableFrontier)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point)
    (hNotFloor : point ≠ bridge.floor) :
    bridge.floor.cost costFunction.toBeautyGeneralizedConvexCost <
      point.cost costFunction.toBeautyGeneralizedConvexCost := by
  exact (bridge.toFailureParetoFrontier).floor_strict_generalized_convex_cost_optimality
    costFunction hPoint hNotFloor

theorem floor_strict_objective_optimality
    (bridge : BeautyFailureTaxObservableFrontier)
    (objective : BeautyRealStrictObjective)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point)
    (hNotFloor : point ≠ bridge.floor) :
    bridge.floor.objectiveScore objective.toBeautyRealMonotoneObjective <
      point.objectiveScore objective.toBeautyRealMonotoneObjective := by
  exact (bridge.toFailureParetoFrontier).floor_strict_objective_optimality
    objective hPoint hNotFloor

theorem floor_strict_generalized_convex_cost_global_minimum
    (bridge : BeautyFailureTaxObservableFrontier)
    (costFunction : BeautyStrictGeneralizedConvexCost) :
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        bridge.floor.cost costFunction.toBeautyGeneralizedConvexCost <=
          point.cost costFunction.toBeautyGeneralizedConvexCost) /\
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        point.cost costFunction.toBeautyGeneralizedConvexCost <=
          bridge.floor.cost costFunction.toBeautyGeneralizedConvexCost ->
        point = bridge.floor) := by
  exact (bridge.toFailureParetoFrontier).floor_strict_generalized_convex_cost_global_minimum
    costFunction

theorem floor_strict_objective_global_minimum
    (bridge : BeautyFailureTaxObservableFrontier)
    (objective : BeautyRealStrictObjective) :
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        bridge.floor.objectiveScore objective.toBeautyRealMonotoneObjective <=
          point.objectiveScore objective.toBeautyRealMonotoneObjective) /\
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        point.objectiveScore objective.toBeautyRealMonotoneObjective <=
          bridge.floor.objectiveScore objective.toBeautyRealMonotoneObjective ->
        point = bridge.floor) := by
  exact (bridge.toFailureParetoFrontier).floor_strict_objective_global_minimum
    objective

end BeautyFailureTaxObservableFrontier

structure BeautyDeficitDominatingFailureTaxFrontier where
  pointOnFrontier : BeautyFailureParetoPoint → Prop
  floor : BeautyFailureParetoPoint
  failureTax : BeautyFailureParetoPoint → ℝ
  latencyFloorFromTax : ℝ → ℝ
  wasteFloorFromTax : ℝ → ℝ
  floorOnFrontier : pointOnFrontier floor
  floorZeroDeficit : floor.deficit = 0
  floorFailureTaxZero : failureTax floor = 0
  failureTaxDominatesDeficit :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        (point.deficit : ℝ) <= failureTax point
  latencyFloorFromTaxMonotone :
    ∀ {taxLeft taxRight : ℝ},
      taxLeft <= taxRight ->
        latencyFloorFromTax taxLeft <= latencyFloorFromTax taxRight
  wasteFloorFromTaxMonotone :
    ∀ {taxLeft taxRight : ℝ},
      taxLeft <= taxRight ->
        wasteFloorFromTax taxLeft <= wasteFloorFromTax taxRight
  latencyLowerBoundByTax :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        latencyFloorFromTax (failureTax point) <= point.latency
  wasteLowerBoundByTax :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        wasteFloorFromTax (failureTax point) <= point.waste
  strictObservableGapFromPositiveTax :
    ∀ {tax : ℝ},
      0 < tax ->
        latencyFloorFromTax 0 < latencyFloorFromTax tax \/
          wasteFloorFromTax 0 < wasteFloorFromTax tax
  floorLatencyEqTaxZero :
    floor.latency = latencyFloorFromTax 0
  floorWasteEqTaxZero :
    floor.waste = wasteFloorFromTax 0
  zeroDeficitUniqueOnFrontier :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point ->
        point.deficit = 0 ->
          point = floor

namespace BeautyDeficitDominatingFailureTaxFrontier

def toFailureTaxObservableFrontier
    (bridge : BeautyDeficitDominatingFailureTaxFrontier) :
    BeautyFailureTaxObservableFrontier where
  pointOnFrontier := bridge.pointOnFrontier
  floor := bridge.floor
  failureTax := bridge.failureTax
  latencyFloorFromTax := bridge.latencyFloorFromTax
  wasteFloorFromTax := bridge.wasteFloorFromTax
  floorOnFrontier := bridge.floorOnFrontier
  floorZeroDeficit := bridge.floorZeroDeficit
  floorFailureTaxZero := bridge.floorFailureTaxZero
  taxNonnegative := by
    intro point hPoint
    have hDeficitNonneg : 0 <= (point.deficit : ℝ) := by
      exact_mod_cast Nat.zero_le point.deficit
    exact le_trans hDeficitNonneg (bridge.failureTaxDominatesDeficit hPoint)
  positiveDeficitForcesPositiveTax := by
    intro point hPoint hPositiveDeficit
    have hPositiveDeficitReal : 0 < (point.deficit : ℝ) := by
      exact_mod_cast hPositiveDeficit
    exact lt_of_lt_of_le hPositiveDeficitReal (bridge.failureTaxDominatesDeficit hPoint)
  latencyFloorFromTaxMonotone := bridge.latencyFloorFromTaxMonotone
  wasteFloorFromTaxMonotone := bridge.wasteFloorFromTaxMonotone
  latencyLowerBoundByTax := bridge.latencyLowerBoundByTax
  wasteLowerBoundByTax := bridge.wasteLowerBoundByTax
  strictObservableGapFromPositiveTax := bridge.strictObservableGapFromPositiveTax
  floorLatencyEqTaxZero := bridge.floorLatencyEqTaxZero
  floorWasteEqTaxZero := bridge.floorWasteEqTaxZero
  zeroDeficitUniqueOnFrontier := bridge.zeroDeficitUniqueOnFrontier

theorem floor_generalized_convex_cost_minimal
    (bridge : BeautyDeficitDominatingFailureTaxFrontier)
    (costFunction : BeautyGeneralizedConvexCost)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point) :
    bridge.floor.cost costFunction <= point.cost costFunction := by
  exact (bridge.toFailureTaxObservableFrontier).floor_generalized_convex_cost_minimal
    costFunction hPoint

theorem floor_objective_minimal
    (bridge : BeautyDeficitDominatingFailureTaxFrontier)
    (objective : BeautyRealMonotoneObjective)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point) :
    bridge.floor.objectiveScore objective <= point.objectiveScore objective := by
  exact (bridge.toFailureTaxObservableFrontier).floor_objective_minimal objective hPoint

theorem floor_strict_generalized_convex_cost_optimality
    (bridge : BeautyDeficitDominatingFailureTaxFrontier)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point)
    (hNotFloor : point ≠ bridge.floor) :
    bridge.floor.cost costFunction.toBeautyGeneralizedConvexCost <
      point.cost costFunction.toBeautyGeneralizedConvexCost := by
  exact (bridge.toFailureTaxObservableFrontier).floor_strict_generalized_convex_cost_optimality
    costFunction hPoint hNotFloor

theorem floor_strict_objective_optimality
    (bridge : BeautyDeficitDominatingFailureTaxFrontier)
    (objective : BeautyRealStrictObjective)
    {point : BeautyFailureParetoPoint}
    (hPoint : bridge.pointOnFrontier point)
    (hNotFloor : point ≠ bridge.floor) :
    bridge.floor.objectiveScore objective.toBeautyRealMonotoneObjective <
      point.objectiveScore objective.toBeautyRealMonotoneObjective := by
  exact (bridge.toFailureTaxObservableFrontier).floor_strict_objective_optimality
    objective hPoint hNotFloor

theorem floor_strict_generalized_convex_cost_global_minimum
    (bridge : BeautyDeficitDominatingFailureTaxFrontier)
    (costFunction : BeautyStrictGeneralizedConvexCost) :
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        bridge.floor.cost costFunction.toBeautyGeneralizedConvexCost <=
          point.cost costFunction.toBeautyGeneralizedConvexCost) /\
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        point.cost costFunction.toBeautyGeneralizedConvexCost <=
          bridge.floor.cost costFunction.toBeautyGeneralizedConvexCost ->
        point = bridge.floor) := by
  exact (bridge.toFailureTaxObservableFrontier).floor_strict_generalized_convex_cost_global_minimum
    costFunction

theorem floor_strict_objective_global_minimum
    (bridge : BeautyDeficitDominatingFailureTaxFrontier)
    (objective : BeautyRealStrictObjective) :
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        bridge.floor.objectiveScore objective.toBeautyRealMonotoneObjective <=
          point.objectiveScore objective.toBeautyRealMonotoneObjective) /\
    (∀ {point : BeautyFailureParetoPoint},
      bridge.pointOnFrontier point ->
        point.objectiveScore objective.toBeautyRealMonotoneObjective <=
          bridge.floor.objectiveScore objective.toBeautyRealMonotoneObjective ->
        point = bridge.floor) := by
  exact (bridge.toFailureTaxObservableFrontier).floor_strict_objective_global_minimum
    objective

end BeautyDeficitDominatingFailureTaxFrontier

structure BeautyMonotoneProfileFamily (ι : Type*) where
  best : ι
  intrinsicBu : Bu
  implementationBu : ι → Bu
  latencyOfDeficit : Bu → Nat
  wasteOfDeficit : Bu → Nat
  implementationBound : ∀ i, implementationBu i <= intrinsicBu
  bestFullFit : implementationBu best = intrinsicBu
  othersStrictUnderfit : ∀ {i}, i ≠ best -> implementationBu i < intrinsicBu
  latencyMonotoneFromDeficit :
    ∀ {deficitLeft deficitRight : Bu},
      deficitLeft <= deficitRight ->
        latencyOfDeficit deficitLeft <= latencyOfDeficit deficitRight
  wasteMonotoneFromDeficit :
    ∀ {deficitLeft deficitRight : Bu},
      deficitLeft <= deficitRight ->
        wasteOfDeficit deficitLeft <= wasteOfDeficit deficitRight

namespace BeautyMonotoneProfileFamily

def deficit
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) : Bu :=
  family.intrinsicBu - family.implementationBu i

def latency
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) : Nat :=
  family.latencyOfDeficit (family.deficit i)

def waste
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) : Nat :=
  family.wasteOfDeficit (family.deficit i)

def failureParetoPoint
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) : BeautyFailureParetoPoint where
  deficit := family.deficit i
  latency := family.latency i
  waste := family.waste i

def failureParetoFrontier
    (family : BeautyMonotoneProfileFamily ι)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight)) :
    BeautyFailureParetoFrontier where
  pointOnFrontier := fun point => ∃ i, point = family.failureParetoPoint i
  floor := family.failureParetoPoint family.best
  floorOnFrontier := ⟨family.best, rfl⟩
  floorZeroDeficit := by
    have hBestDeficitZero : family.deficit family.best = 0 := by
      unfold deficit
      rw [family.bestFullFit]
      simp
    simpa [failureParetoPoint] using hBestDeficitZero
  latencyFloorByMeasure := by
    intro point hPoint
    rcases hPoint with ⟨i, rfl⟩
    have hBestDeficitZero : family.deficit family.best = 0 := by
      unfold deficit
      rw [family.bestFullFit]
      simp
    have hLatencyLeNat :
        family.latency family.best <= family.latency i := by
      unfold latency
      rw [hBestDeficitZero]
      exact family.latencyMonotoneFromDeficit (Nat.zero_le _)
    have hLatencyLe :
        (family.latency family.best : ℝ) <= family.latency i := by
      exact_mod_cast hLatencyLeNat
    simpa [failureParetoPoint] using hLatencyLe
  wasteFloorByMeasure := by
    intro point hPoint
    rcases hPoint with ⟨i, rfl⟩
    have hBestDeficitZero : family.deficit family.best = 0 := by
      unfold deficit
      rw [family.bestFullFit]
      simp
    have hWasteLeNat :
        family.waste family.best <= family.waste i := by
      unfold waste
      rw [hBestDeficitZero]
      exact family.wasteMonotoneFromDeficit (Nat.zero_le _)
    have hWasteLe :
        (family.waste family.best : ℝ) <= family.waste i := by
      exact_mod_cast hWasteLeNat
    simpa [failureParetoPoint] using hWasteLe
  strictFloorGapByMeasure := by
    intro point hPoint hPositiveDeficit
    rcases hPoint with ⟨i, rfl⟩
    have hBestDeficitZero : family.deficit family.best = 0 := by
      unfold deficit
      rw [family.bestFullFit]
      simp
    have hPositiveDeficitNat : 0 < family.deficit i := by
      simpa [failureParetoPoint] using hPositiveDeficit
    cases hStrictProfile with
    | inl hStrictLatencyProfile =>
        left
        have hLatencyLtNat :
            family.latency family.best < family.latency i := by
          unfold latency
          rw [hBestDeficitZero]
          exact hStrictLatencyProfile hPositiveDeficitNat
        have hLatencyLt :
            (family.latency family.best : ℝ) < family.latency i := by
          exact_mod_cast hLatencyLtNat
        simpa [failureParetoPoint] using hLatencyLt
    | inr hStrictWasteProfile =>
        right
        have hWasteLtNat :
            family.waste family.best < family.waste i := by
          unfold waste
          rw [hBestDeficitZero]
          exact hStrictWasteProfile hPositiveDeficitNat
        have hWasteLt :
            (family.waste family.best : ℝ) < family.waste i := by
          exact_mod_cast hWasteLtNat
        simpa [failureParetoPoint] using hWasteLt
  zeroDeficitUniqueOnFrontier := by
    intro point hPoint hZeroDeficit
    rcases hPoint with ⟨i, rfl⟩
    have hZeroDeficitNat : family.deficit i = 0 := by
      simpa [failureParetoPoint] using hZeroDeficit
    by_cases hNotBest : i ≠ family.best
    · have hPositiveDeficit : 0 < family.deficit i := by
        simpa [deficit] using Nat.sub_pos_of_lt (family.othersStrictUnderfit hNotBest)
      exact False.elim ((Nat.ne_of_gt hPositiveDeficit) hZeroDeficitNat)
    · have hBest : i = family.best := by
        exact not_ne_iff.mp hNotBest
      cases hBest
      rfl

noncomputable def deficitDominatingFailureTaxFrontierOfStrictLatencyProfile
    (family : BeautyMonotoneProfileFamily ι)
    (hStrictLatencyProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) :
    BeautyDeficitDominatingFailureTaxFrontier :=
  let hBestDeficitZero : family.deficit family.best = 0 := by
    unfold deficit
    rw [family.bestFullFit]
    simp
  { pointOnFrontier := fun point => ∃ i, point = family.failureParetoPoint i
    floor := family.failureParetoPoint family.best
    failureTax := fun point => point.deficit
    latencyFloorFromTax := fun tax =>
      BeautyFailureTaxObservableFrontier.oneStepFloor (family.latency family.best) tax
    wasteFloorFromTax := fun _ => family.waste family.best
    floorOnFrontier := ⟨family.best, rfl⟩
    floorZeroDeficit := by
      simpa [failureParetoPoint] using hBestDeficitZero
    floorFailureTaxZero := by
      exact_mod_cast hBestDeficitZero
    failureTaxDominatesDeficit := by
      intro point hPoint
      exact le_rfl
    latencyFloorFromTaxMonotone := by
      intro taxLeft taxRight hTax
      exact BeautyFailureTaxObservableFrontier.oneStepFloor_monotone hTax
    wasteFloorFromTaxMonotone := by
      intro taxLeft taxRight hTax
      exact le_rfl
    latencyLowerBoundByTax := by
      intro point hPoint
      rcases hPoint with ⟨i, rfl⟩
      by_cases hPositiveDeficit : 0 < family.deficit i
      · have hBestDeficitZero' : family.deficit family.best = 0 := hBestDeficitZero
        have hLatencyLtNat : family.latency family.best < family.latency i := by
          unfold latency
          rw [hBestDeficitZero']
          exact hStrictLatencyProfile hPositiveDeficit
        have hLatencyStepNat :
            family.latency family.best + 1 <= family.latency i :=
          Nat.succ_le_of_lt hLatencyLtNat
        have hPositiveTax : 0 < ((family.deficit i : Nat) : ℝ) := by
          exact_mod_cast hPositiveDeficit
        have hLatencyStep :
            BeautyFailureTaxObservableFrontier.oneStepFloor (family.latency family.best)
                ((family.deficit i : Nat) : ℝ) <=
              family.latency i := by
          have hStepReal :
              (family.latency family.best : ℝ) + 1 <= family.latency i := by
            exact_mod_cast hLatencyStepNat
          simpa [BeautyFailureTaxObservableFrontier.oneStepFloor, hPositiveTax] using hStepReal
        simpa [failureParetoPoint] using hLatencyStep
      · have hBaseLeNat : family.latency family.best <= family.latency i := by
          unfold latency
          rw [hBestDeficitZero]
          exact family.latencyMonotoneFromDeficit (Nat.zero_le _)
        have hTaxNotPos : ¬ 0 < ((family.deficit i : Nat) : ℝ) := by
          intro hTaxPos
          exact hPositiveDeficit (by exact_mod_cast hTaxPos)
        have hBaseLe :
            BeautyFailureTaxObservableFrontier.oneStepFloor (family.latency family.best)
                ((family.deficit i : Nat) : ℝ) <=
              family.latency i := by
          have hBaseLeReal :
              (family.latency family.best : ℝ) <= family.latency i := by
            exact_mod_cast hBaseLeNat
          simpa [BeautyFailureTaxObservableFrontier.oneStepFloor, hTaxNotPos] using hBaseLeReal
        simpa [failureParetoPoint] using hBaseLe
    wasteLowerBoundByTax := by
      intro point hPoint
      rcases hPoint with ⟨i, rfl⟩
      have hWasteLeNat : family.waste family.best <= family.waste i := by
        unfold waste
        rw [hBestDeficitZero]
        exact family.wasteMonotoneFromDeficit (Nat.zero_le _)
      have hWasteLe :
          (family.waste family.best : ℝ) <= family.waste i := by
        exact_mod_cast hWasteLeNat
      simpa [failureParetoPoint] using hWasteLe
    strictObservableGapFromPositiveTax := by
      intro tax hTax
      left
      simpa [BeautyFailureTaxObservableFrontier.oneStepFloor_eq_base_at_zero] using
        (BeautyFailureTaxObservableFrontier.oneStepFloor_strict_of_pos
          (base := (family.latency family.best : ℝ)) hTax)
    floorLatencyEqTaxZero := by
      simp [failureParetoPoint, BeautyFailureTaxObservableFrontier.oneStepFloor_eq_base_at_zero]
    floorWasteEqTaxZero := by
      simp [failureParetoPoint]
    zeroDeficitUniqueOnFrontier := by
      intro point hPoint hZeroDeficit
      rcases hPoint with ⟨i, rfl⟩
      have hZeroDeficitNat : family.deficit i = 0 := by
        simpa [failureParetoPoint] using hZeroDeficit
      by_cases hNotBest : i ≠ family.best
      · have hPositiveDeficit : 0 < family.deficit i := by
          simpa [deficit] using Nat.sub_pos_of_lt (family.othersStrictUnderfit hNotBest)
        exact False.elim ((Nat.ne_of_gt hPositiveDeficit) hZeroDeficitNat)
      · have hBest : i = family.best := by
          exact not_ne_iff.mp hNotBest
        cases hBest
        rfl
  }

noncomputable def failureTaxObservableFrontierOfStrictLatencyProfile
    (family : BeautyMonotoneProfileFamily ι)
    (hStrictLatencyProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) :
    BeautyFailureTaxObservableFrontier :=
  BeautyDeficitDominatingFailureTaxFrontier.toFailureTaxObservableFrontier
    (family.deficitDominatingFailureTaxFrontierOfStrictLatencyProfile hStrictLatencyProfile)

noncomputable def deficitDominatingFailureTaxFrontierOfStrictWasteProfile
    (family : BeautyMonotoneProfileFamily ι)
    (hStrictWasteProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight) :
    BeautyDeficitDominatingFailureTaxFrontier :=
  let hBestDeficitZero : family.deficit family.best = 0 := by
    unfold deficit
    rw [family.bestFullFit]
    simp
  { pointOnFrontier := fun point => ∃ i, point = family.failureParetoPoint i
    floor := family.failureParetoPoint family.best
    failureTax := fun point => point.deficit
    latencyFloorFromTax := fun _ => family.latency family.best
    wasteFloorFromTax := fun tax =>
      BeautyFailureTaxObservableFrontier.oneStepFloor (family.waste family.best) tax
    floorOnFrontier := ⟨family.best, rfl⟩
    floorZeroDeficit := by
      simpa [failureParetoPoint] using hBestDeficitZero
    floorFailureTaxZero := by
      exact_mod_cast hBestDeficitZero
    failureTaxDominatesDeficit := by
      intro point hPoint
      exact le_rfl
    latencyFloorFromTaxMonotone := by
      intro taxLeft taxRight hTax
      exact le_rfl
    wasteFloorFromTaxMonotone := by
      intro taxLeft taxRight hTax
      exact BeautyFailureTaxObservableFrontier.oneStepFloor_monotone hTax
    latencyLowerBoundByTax := by
      intro point hPoint
      rcases hPoint with ⟨i, rfl⟩
      have hLatencyLeNat : family.latency family.best <= family.latency i := by
        unfold latency
        rw [hBestDeficitZero]
        exact family.latencyMonotoneFromDeficit (Nat.zero_le _)
      have hLatencyLe :
          (family.latency family.best : ℝ) <= family.latency i := by
        exact_mod_cast hLatencyLeNat
      simpa [failureParetoPoint] using hLatencyLe
    wasteLowerBoundByTax := by
      intro point hPoint
      rcases hPoint with ⟨i, rfl⟩
      by_cases hPositiveDeficit : 0 < family.deficit i
      · have hBestDeficitZero' : family.deficit family.best = 0 := hBestDeficitZero
        have hWasteLtNat : family.waste family.best < family.waste i := by
          unfold waste
          rw [hBestDeficitZero']
          exact hStrictWasteProfile hPositiveDeficit
        have hWasteStepNat :
            family.waste family.best + 1 <= family.waste i :=
          Nat.succ_le_of_lt hWasteLtNat
        have hPositiveTax : 0 < ((family.deficit i : Nat) : ℝ) := by
          exact_mod_cast hPositiveDeficit
        have hWasteStep :
            BeautyFailureTaxObservableFrontier.oneStepFloor (family.waste family.best)
                ((family.deficit i : Nat) : ℝ) <=
              family.waste i := by
          have hStepReal :
              (family.waste family.best : ℝ) + 1 <= family.waste i := by
            exact_mod_cast hWasteStepNat
          simpa [BeautyFailureTaxObservableFrontier.oneStepFloor, hPositiveTax] using hStepReal
        simpa [failureParetoPoint] using hWasteStep
      · have hBaseLeNat : family.waste family.best <= family.waste i := by
          unfold waste
          rw [hBestDeficitZero]
          exact family.wasteMonotoneFromDeficit (Nat.zero_le _)
        have hTaxNotPos : ¬ 0 < ((family.deficit i : Nat) : ℝ) := by
          intro hTaxPos
          exact hPositiveDeficit (by exact_mod_cast hTaxPos)
        have hBaseLe :
            BeautyFailureTaxObservableFrontier.oneStepFloor (family.waste family.best)
                ((family.deficit i : Nat) : ℝ) <=
              family.waste i := by
          have hBaseLeReal :
              (family.waste family.best : ℝ) <= family.waste i := by
            exact_mod_cast hBaseLeNat
          simpa [BeautyFailureTaxObservableFrontier.oneStepFloor, hTaxNotPos] using hBaseLeReal
        simpa [failureParetoPoint] using hBaseLe
    strictObservableGapFromPositiveTax := by
      intro tax hTax
      right
      simpa [BeautyFailureTaxObservableFrontier.oneStepFloor_eq_base_at_zero] using
        (BeautyFailureTaxObservableFrontier.oneStepFloor_strict_of_pos
          (base := (family.waste family.best : ℝ)) hTax)
    floorLatencyEqTaxZero := by
      simp [failureParetoPoint]
    floorWasteEqTaxZero := by
      simp [failureParetoPoint, BeautyFailureTaxObservableFrontier.oneStepFloor_eq_base_at_zero]
    zeroDeficitUniqueOnFrontier := by
      intro point hPoint hZeroDeficit
      rcases hPoint with ⟨i, rfl⟩
      have hZeroDeficitNat : family.deficit i = 0 := by
        simpa [failureParetoPoint] using hZeroDeficit
      by_cases hNotBest : i ≠ family.best
      · have hPositiveDeficit : 0 < family.deficit i := by
          simpa [deficit] using Nat.sub_pos_of_lt (family.othersStrictUnderfit hNotBest)
        exact False.elim ((Nat.ne_of_gt hPositiveDeficit) hZeroDeficitNat)
      · have hBest : i = family.best := by
          exact not_ne_iff.mp hNotBest
        cases hBest
        rfl
  }

noncomputable def failureTaxObservableFrontierOfStrictWasteProfile
    (family : BeautyMonotoneProfileFamily ι)
    (hStrictWasteProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight) :
    BeautyFailureTaxObservableFrontier :=
  BeautyDeficitDominatingFailureTaxFrontier.toFailureTaxObservableFrontier
    (family.deficitDominatingFailureTaxFrontierOfStrictWasteProfile hStrictWasteProfile)

def comparisonWorkload
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) : BeautyMonotoneProfileWorkload where
  intrinsicBu := family.intrinsicBu
  implementationBuA := family.implementationBu family.best
  implementationBuB := family.implementationBu i
  latencyOfDeficit := family.latencyOfDeficit
  wasteOfDeficit := family.wasteOfDeficit
  implementationBoundA := family.implementationBound family.best
  implementationBoundB := family.implementationBound i
  deficitOrder := by
    have hBestDeficitZero :
        family.intrinsicBu - family.implementationBu family.best = 0 := by
      rw [family.bestFullFit]
      simp
    rw [hBestDeficitZero]
    exact Nat.zero_le _
  latencyMonotoneFromDeficit := family.latencyMonotoneFromDeficit
  wasteMonotoneFromDeficit := family.wasteMonotoneFromDeficit

@[simp] theorem best_deficit_zero
    (family : BeautyMonotoneProfileFamily ι) :
    family.deficit family.best = 0 := by
  simp [deficit, family.bestFullFit]

@[simp] theorem comparisonWorkload_latencyA
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) :
    (family.comparisonWorkload i).latencyA = family.latency family.best := by
  rfl

@[simp] theorem comparisonWorkload_latencyB
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) :
    (family.comparisonWorkload i).latencyB = family.latency i := by
  rfl

@[simp] theorem comparisonWorkload_wasteA
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) :
    (family.comparisonWorkload i).wasteA = family.waste family.best := by
  rfl

@[simp] theorem comparisonWorkload_wasteB
    (family : BeautyMonotoneProfileFamily ι)
    (i : ι) :
    (family.comparisonWorkload i).wasteB = family.waste i := by
  rfl

theorem best_real_objective_minimal
    (family : BeautyMonotoneProfileFamily ι)
    (objective : BeautyRealMonotoneObjective)
    (i : ι) :
    objective.score (family.latency family.best) (family.waste family.best) <=
      objective.score (family.latency i) (family.waste i) := by
  simpa using
    (family.comparisonWorkload i).real_objective_monotone objective

theorem best_real_objective_optimality_of_strict_latency_profile
    (family : BeautyMonotoneProfileFamily ι)
    (objective : BeautyRealStrictObjective)
    {i : ι}
    (hNotBest : i ≠ family.best)
    (hStrictLatencyProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) :
    objective.score (family.latency family.best) (family.waste family.best) <
      objective.score (family.latency i) (family.waste i) := by
  have hFullFit :
      (family.comparisonWorkload i).implementationBuA =
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.bestFullFit
  have hStrictUnderfit :
      (family.comparisonWorkload i).implementationBuB <
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.othersStrictUnderfit hNotBest
  simpa using
    (BeautyMonotoneProfileWorkload.strict_real_objective_optimality_of_strict_latency_profile
      (family.comparisonWorkload i)
      objective hFullFit hStrictUnderfit hStrictLatencyProfile
    )

theorem best_real_objective_optimality_of_strict_waste_profile
    (family : BeautyMonotoneProfileFamily ι)
    (objective : BeautyRealStrictObjective)
    {i : ι}
    (hNotBest : i ≠ family.best)
    (hStrictWasteProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight) :
    objective.score (family.latency family.best) (family.waste family.best) <
      objective.score (family.latency i) (family.waste i) := by
  have hFullFit :
      (family.comparisonWorkload i).implementationBuA =
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.bestFullFit
  have hStrictUnderfit :
      (family.comparisonWorkload i).implementationBuB <
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.othersStrictUnderfit hNotBest
  simpa using
    (BeautyMonotoneProfileWorkload.strict_real_objective_optimality_of_strict_waste_profile
      (family.comparisonWorkload i)
      objective hFullFit hStrictUnderfit hStrictWasteProfile
    )

theorem best_real_objective_optimality_of_strict_profile
    (family : BeautyMonotoneProfileFamily ι)
    (objective : BeautyRealStrictObjective)
    {i : ι}
    (hNotBest : i ≠ family.best)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight)) :
    objective.score (family.latency family.best) (family.waste family.best) <
      objective.score (family.latency i) (family.waste i) := by
  cases hStrictProfile with
  | inl hStrictLatencyProfile =>
      exact family.best_real_objective_optimality_of_strict_latency_profile
        objective hNotBest hStrictLatencyProfile
  | inr hStrictWasteProfile =>
      exact family.best_real_objective_optimality_of_strict_waste_profile
        objective hNotBest hStrictWasteProfile

theorem best_real_objective_unique_minimizer_of_strict_profile
    (family : BeautyMonotoneProfileFamily ι)
    (objective : BeautyRealStrictObjective)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight)) :
    ∀ {i : ι},
      objective.score (family.latency i) (family.waste i) <=
        objective.score (family.latency family.best) (family.waste family.best) ->
      i = family.best := by
  intro i hLe
  by_contra hNotBest
  have hStrict :=
    family.best_real_objective_optimality_of_strict_profile
      objective hNotBest hStrictProfile
  exact (not_le_of_gt hStrict) hLe

theorem best_real_objective_global_minimum_of_strict_profile
    (family : BeautyMonotoneProfileFamily ι)
    (objective : BeautyRealStrictObjective)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight)) :
    (∀ i : ι,
      objective.score (family.latency family.best) (family.waste family.best) <=
        objective.score (family.latency i) (family.waste i)) /\
    (∀ i : ι,
      objective.score (family.latency i) (family.waste i) <=
        objective.score (family.latency family.best) (family.waste family.best) ->
      i = family.best) := by
  refine ⟨?_, ?_⟩
  · intro i
    exact family.best_real_objective_minimal objective.toBeautyRealMonotoneObjective i
  · intro i hLe
    exact family.best_real_objective_unique_minimizer_of_strict_profile
      objective hStrictProfile hLe

theorem best_generalized_convex_cost_minimal
    (family : BeautyMonotoneProfileFamily ι)
    (costFunction : BeautyGeneralizedConvexCost)
    (i : ι) :
    costFunction.cost (family.latency family.best) (family.waste family.best) <=
      costFunction.cost (family.latency i) (family.waste i) := by
  simpa using
    (family.comparisonWorkload i).generalized_convex_cost_monotone costFunction

theorem best_strict_generalized_convex_cost_optimality_of_strict_latency_profile
    (family : BeautyMonotoneProfileFamily ι)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    {i : ι}
    (hNotBest : i ≠ family.best)
    (hStrictLatencyProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) :
    costFunction.cost (family.latency family.best) (family.waste family.best) <
      costFunction.cost (family.latency i) (family.waste i) := by
  have hFullFit :
      (family.comparisonWorkload i).implementationBuA =
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.bestFullFit
  have hStrictUnderfit :
      (family.comparisonWorkload i).implementationBuB <
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.othersStrictUnderfit hNotBest
  simpa using
    (BeautyMonotoneProfileWorkload.strict_generalized_convex_cost_optimality_of_strict_latency_profile
      (family.comparisonWorkload i)
      costFunction hFullFit hStrictUnderfit hStrictLatencyProfile
    )

theorem best_strict_generalized_convex_cost_optimality_of_strict_waste_profile
    (family : BeautyMonotoneProfileFamily ι)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    {i : ι}
    (hNotBest : i ≠ family.best)
    (hStrictWasteProfile :
      ∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight) :
    costFunction.cost (family.latency family.best) (family.waste family.best) <
      costFunction.cost (family.latency i) (family.waste i) := by
  have hFullFit :
      (family.comparisonWorkload i).implementationBuA =
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.bestFullFit
  have hStrictUnderfit :
      (family.comparisonWorkload i).implementationBuB <
        (family.comparisonWorkload i).intrinsicBu := by
    simpa [comparisonWorkload] using family.othersStrictUnderfit hNotBest
  simpa using
    (BeautyMonotoneProfileWorkload.strict_generalized_convex_cost_optimality_of_strict_waste_profile
      (family.comparisonWorkload i)
      costFunction hFullFit hStrictUnderfit hStrictWasteProfile
    )

theorem best_strict_generalized_convex_cost_optimality_of_strict_profile
    (family : BeautyMonotoneProfileFamily ι)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    {i : ι}
    (hNotBest : i ≠ family.best)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight)) :
    costFunction.cost (family.latency family.best) (family.waste family.best) <
      costFunction.cost (family.latency i) (family.waste i) := by
  cases hStrictProfile with
  | inl hStrictLatencyProfile =>
      exact family.best_strict_generalized_convex_cost_optimality_of_strict_latency_profile
        costFunction hNotBest hStrictLatencyProfile
  | inr hStrictWasteProfile =>
      exact family.best_strict_generalized_convex_cost_optimality_of_strict_waste_profile
        costFunction hNotBest hStrictWasteProfile

theorem best_generalized_convex_cost_unique_minimizer_of_strict_profile
    (family : BeautyMonotoneProfileFamily ι)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight)) :
    ∀ {i : ι},
      costFunction.cost (family.latency i) (family.waste i) <=
        costFunction.cost (family.latency family.best) (family.waste family.best) ->
      i = family.best := by
  intro i hLe
  by_contra hNotBest
  have hStrict :=
    family.best_strict_generalized_convex_cost_optimality_of_strict_profile
      costFunction hNotBest hStrictProfile
  exact (not_le_of_gt hStrict) hLe

theorem best_generalized_convex_cost_global_minimum_of_strict_profile
    (family : BeautyMonotoneProfileFamily ι)
    (costFunction : BeautyStrictGeneralizedConvexCost)
    (hStrictProfile :
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.latencyOfDeficit deficitLeft < family.latencyOfDeficit deficitRight) \/
      (∀ {deficitLeft deficitRight : Bu},
        deficitLeft < deficitRight ->
          family.wasteOfDeficit deficitLeft < family.wasteOfDeficit deficitRight)) :
    (∀ i : ι,
      costFunction.cost (family.latency family.best) (family.waste family.best) <=
        costFunction.cost (family.latency i) (family.waste i)) /\
    (∀ i : ι,
      costFunction.cost (family.latency i) (family.waste i) <=
        costFunction.cost (family.latency family.best) (family.waste family.best) ->
      i = family.best) := by
  refine ⟨?_, ?_⟩
  · intro i
    exact family.best_generalized_convex_cost_minimal costFunction.toBeautyGeneralizedConvexCost i
  · intro i hLe
    exact family.best_generalized_convex_cost_unique_minimizer_of_strict_profile
      costFunction hStrictProfile hLe

end BeautyMonotoneProfileFamily

structure BeautyLinearWorkload where
  intrinsicBu : Bu
  implementationBuA : Bu
  implementationBuB : Bu
  baseLatency : Nat
  latencyPenalty : Nat
  baseWaste : Nat
  wastePenalty : Nat
  implementationBoundA : implementationBuA <= intrinsicBu
  implementationBoundB : implementationBuB <= intrinsicBu
  deficitOrder : intrinsicBu - implementationBuA <= intrinsicBu - implementationBuB

namespace BeautyLinearWorkload

def deficitA (workload : BeautyLinearWorkload) : Bu :=
  workload.intrinsicBu - workload.implementationBuA

def deficitB (workload : BeautyLinearWorkload) : Bu :=
  workload.intrinsicBu - workload.implementationBuB

def beautyA (workload : BeautyLinearWorkload) : Bu :=
  workload.intrinsicBu - workload.deficitA

def beautyB (workload : BeautyLinearWorkload) : Bu :=
  workload.intrinsicBu - workload.deficitB

def latencyA (workload : BeautyLinearWorkload) : Nat :=
  workload.baseLatency + workload.latencyPenalty * workload.deficitA

def latencyB (workload : BeautyLinearWorkload) : Nat :=
  workload.baseLatency + workload.latencyPenalty * workload.deficitB

def wasteA (workload : BeautyLinearWorkload) : Nat :=
  workload.baseWaste + workload.wastePenalty * workload.deficitA

def wasteB (workload : BeautyLinearWorkload) : Nat :=
  workload.baseWaste + workload.wastePenalty * workload.deficitB

theorem deficitA_eq
    (workload : BeautyLinearWorkload) :
    workload.deficitA = workload.intrinsicBu - workload.implementationBuA := by
  rfl

theorem deficitB_eq
    (workload : BeautyLinearWorkload) :
    workload.deficitB = workload.intrinsicBu - workload.implementationBuB := by
  rfl

theorem beautyA_eq
    (workload : BeautyLinearWorkload) :
    workload.beautyA = workload.intrinsicBu - workload.deficitA := by
  rfl

theorem beautyB_eq
    (workload : BeautyLinearWorkload) :
    workload.beautyB = workload.intrinsicBu - workload.deficitB := by
  rfl

theorem beautyA_eq_implementation
    (workload : BeautyLinearWorkload) :
    workload.beautyA = workload.implementationBuA := by
  simpa [beautyA, deficitA] using Nat.sub_sub_self workload.implementationBoundA

theorem beautyB_eq_implementation
    (workload : BeautyLinearWorkload) :
    workload.beautyB = workload.implementationBuB := by
  simpa [beautyB, deficitB] using Nat.sub_sub_self workload.implementationBoundB

theorem latency_monotone
    (workload : BeautyLinearWorkload) :
    workload.latencyA <= workload.latencyB := by
  exact linear_cost_monotone workload.deficitOrder

theorem waste_monotone
    (workload : BeautyLinearWorkload) :
    workload.wasteA <= workload.wasteB := by
  exact linear_cost_monotone workload.deficitOrder

theorem beauty_monotone
    (workload : BeautyLinearWorkload) :
    workload.beautyB <= workload.beautyA := by
  simpa [beautyA, beautyB, deficitA, deficitB] using
    (Nat.sub_le_sub_left workload.deficitOrder workload.intrinsicBu)

theorem strict_latency_monotone
    (workload : BeautyLinearWorkload)
    (hPenalty : 0 < workload.latencyPenalty)
    (hStrictDeficit : workload.deficitA < workload.deficitB) :
    workload.latencyA < workload.latencyB := by
  unfold latencyA latencyB
  exact Nat.add_lt_add_left (Nat.mul_lt_mul_of_pos_left hStrictDeficit hPenalty) _

theorem strict_waste_monotone
    (workload : BeautyLinearWorkload)
    (hPenalty : 0 < workload.wastePenalty)
    (hStrictDeficit : workload.deficitA < workload.deficitB) :
    workload.wasteA < workload.wasteB := by
  unfold wasteA wasteB
  exact Nat.add_lt_add_left (Nat.mul_lt_mul_of_pos_left hStrictDeficit hPenalty) _

theorem strict_beauty_monotone
    (workload : BeautyLinearWorkload)
    (hStrictDeficit : workload.deficitA < workload.deficitB) :
    workload.beautyB < workload.beautyA := by
  have hImplementation :
      workload.implementationBuB < workload.implementationBuA := by
    by_contra hNotStrict
    have hImplLe : workload.implementationBuA <= workload.implementationBuB :=
      Nat.le_of_not_gt hNotStrict
    have hDeficitLe : workload.deficitB <= workload.deficitA := by
      simpa [deficitA, deficitB] using
        (Nat.sub_le_sub_left hImplLe workload.intrinsicBu)
    exact (not_lt_of_ge hDeficitLe hStrictDeficit).elim
  simpa [workload.beautyA_eq_implementation, workload.beautyB_eq_implementation] using
    hImplementation

theorem zero_deficit_of_full_fit
    (workload : BeautyLinearWorkload)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu) :
    workload.deficitA = 0 := by
  simp [deficitA, hFullFit]

theorem deficitB_positive_of_strict_underfit
    (workload : BeautyLinearWorkload)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu) :
    0 < workload.deficitB := by
  simpa [deficitB] using Nat.sub_pos_of_lt hStrictUnderfit

theorem strict_deficit_of_full_fit_underfit
    (workload : BeautyLinearWorkload)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu) :
    workload.deficitA < workload.deficitB := by
  have hDeficitAZero : workload.deficitA = 0 :=
    workload.zero_deficit_of_full_fit hFullFit
  have hDeficitBPos : 0 < workload.deficitB :=
    workload.deficitB_positive_of_strict_underfit hStrictUnderfit
  rw [hDeficitAZero]
  exact hDeficitBPos

theorem objective_monotone
    (workload : BeautyLinearWorkload)
    (objective : BeautyMonotoneObjective) :
    objective.score workload.latencyA workload.wasteA <=
      objective.score workload.latencyB workload.wasteB := by
  exact objective.monotone workload.latency_monotone workload.waste_monotone

theorem zero_deficit_objective_optimal
    (workload : BeautyLinearWorkload)
    (objective : BeautyMonotoneObjective)
    (hZeroDeficit : workload.deficitA = 0) :
    workload.deficitA = 0 /\
      objective.score workload.latencyA workload.wasteA <=
        objective.score workload.latencyB workload.wasteB := by
  exact ⟨hZeroDeficit, workload.objective_monotone objective⟩

theorem strict_objective_optimality_of_latency
    (workload : BeautyLinearWorkload)
    (objective : BeautyStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hLatencyPenalty : 0 < workload.latencyPenalty) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  exact objective.strictMonotoneFromLatency
    (workload.strict_latency_monotone hLatencyPenalty
      (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))
    workload.waste_monotone

theorem strict_objective_optimality_of_waste
    (workload : BeautyLinearWorkload)
    (objective : BeautyStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hWastePenalty : 0 < workload.wastePenalty) :
    objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  exact objective.strictMonotoneFromWaste
    workload.latency_monotone
    (workload.strict_waste_monotone hWastePenalty
      (workload.strict_deficit_of_full_fit_underfit hFullFit hStrictUnderfit))

theorem strict_objective_optimality_of_positive_penalty
    (workload : BeautyLinearWorkload)
    (objective : BeautyStrictObjective)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hPositivePenalty :
      0 < workload.latencyPenalty \/ 0 < workload.wastePenalty) :
      objective.score workload.latencyA workload.wasteA <
      objective.score workload.latencyB workload.wasteB := by
  cases hPositivePenalty with
  | inl hLatencyPenalty =>
      exact workload.strict_objective_optimality_of_latency objective
        hFullFit hStrictUnderfit hLatencyPenalty
  | inr hWastePenalty =>
      exact workload.strict_objective_optimality_of_waste objective
        hFullFit hStrictUnderfit hWastePenalty

theorem generalized_convex_cost_monotone
    (workload : BeautyLinearWorkload)
    (costFunction : BeautyGeneralizedConvexCost) :
    costFunction.cost workload.latencyA workload.wasteA <=
      costFunction.cost workload.latencyB workload.wasteB := by
  exact costFunction.monotone
    (by exact_mod_cast workload.latency_monotone)
    (by exact_mod_cast workload.waste_monotone)

theorem zero_deficit_generalized_convex_cost_optimal
    (workload : BeautyLinearWorkload)
    (costFunction : BeautyGeneralizedConvexCost)
    (hZeroDeficit : workload.deficitA = 0) :
    workload.deficitA = 0 /\
      costFunction.cost workload.latencyA workload.wasteA <=
        costFunction.cost workload.latencyB workload.wasteB := by
  exact ⟨hZeroDeficit, workload.generalized_convex_cost_monotone costFunction⟩

theorem zero_deficit_pareto
    (workload : BeautyLinearWorkload)
    (hZeroDeficit : workload.deficitA = 0) :
    workload.deficitA = 0 ∧ workload.latencyA <= workload.latencyB ∧ workload.wasteA <= workload.wasteB := by
  exact ⟨hZeroDeficit, workload.latency_monotone, workload.waste_monotone⟩

theorem zero_deficit_strict_optimality
    (workload : BeautyLinearWorkload)
    (hFullFit : workload.implementationBuA = workload.intrinsicBu)
    (hStrictUnderfit : workload.implementationBuB < workload.intrinsicBu)
    (hLatencyPenalty : 0 < workload.latencyPenalty)
    (hWastePenalty : 0 < workload.wastePenalty) :
    workload.latencyA < workload.latencyB ∧
      workload.wasteA < workload.wasteB ∧
      workload.beautyB < workload.beautyA := by
  have hDeficitAZero : workload.deficitA = 0 :=
    workload.zero_deficit_of_full_fit hFullFit
  have hDeficitBPos : 0 < workload.deficitB :=
    workload.deficitB_positive_of_strict_underfit hStrictUnderfit
  have hStrictDeficit : workload.deficitA < workload.deficitB := by
    rw [hDeficitAZero]
    exact hDeficitBPos
  exact
    ⟨ workload.strict_latency_monotone hLatencyPenalty hStrictDeficit
    , workload.strict_waste_monotone hWastePenalty hStrictDeficit
    , workload.strict_beauty_monotone hStrictDeficit
    ⟩

def toDefinitionAssumptions
    (workload : BeautyLinearWorkload) :
    BeautyDefinitionAssumptions where
  intrinsicBu := workload.intrinsicBu
  implementationBuA := workload.implementationBuA
  implementationBuB := workload.implementationBuB
  deficitBuA := workload.deficitA
  deficitBuB := workload.deficitB
  beautyBuA := workload.beautyA
  beautyBuB := workload.beautyB
  deficitDefA := by rfl
  deficitDefB := by rfl
  beautyDefA := by rfl
  beautyDefB := by rfl

def toLatencyAssumptions
    (workload : BeautyLinearWorkload) :
    BeautyLatencyMonotonicityAssumptions where
  deficitBuA := workload.deficitA
  deficitBuB := workload.deficitB
  latencyA := workload.latencyA
  latencyB := workload.latencyB
  deficitOrder := workload.deficitOrder
  latencyMonotoneFromDeficit := by
    intro hDeficit
    exact linear_cost_monotone hDeficit

def toWasteAssumptions
    (workload : BeautyLinearWorkload) :
    BeautyWasteMonotonicityAssumptions where
  deficitBuA := workload.deficitA
  deficitBuB := workload.deficitB
  wasteA := workload.wasteA
  wasteB := workload.wasteB
  deficitOrder := workload.deficitOrder
  wasteMonotoneFromDeficit := by
    intro hDeficit
    exact linear_cost_monotone hDeficit

def toParetoAssumptions
    (workload : BeautyLinearWorkload)
    (hZeroDeficit : workload.deficitA = 0) :
    BeautyParetoAssumptions where
  deficitBuA := workload.deficitA
  deficitBuB := workload.deficitB
  latencyA := workload.latencyA
  latencyB := workload.latencyB
  wasteA := workload.wasteA
  wasteB := workload.wasteB
  zeroDeficitA := hZeroDeficit
  deficitOrder := workload.deficitOrder
  latencyMonotoneFromDeficit := by
    intro hDeficit
    exact linear_cost_monotone hDeficit
  wasteMonotoneFromDeficit := by
    intro hDeficit
    exact linear_cost_monotone hDeficit

end BeautyLinearWorkload

structure BeautyCompositionWitness where
  pipelineBu : Bu
  protocolBu : Bu
  compressionBu : Bu

namespace BeautyCompositionWitness

def globalBu (witness : BeautyCompositionWitness) : Bu :=
  witness.pipelineBu + witness.protocolBu + witness.compressionBu

theorem global_eq_sum
    (witness : BeautyCompositionWitness) :
    witness.globalBu = witness.pipelineBu + witness.protocolBu + witness.compressionBu := by
  rfl

def toAssumptions
    (witness : BeautyCompositionWitness) :
    BeautyCompositionAssumptions where
  pipelineBu := witness.pipelineBu
  protocolBu := witness.protocolBu
  compressionBu := witness.compressionBu
  globalBu := witness.globalBu
  additiveComposition := by rfl

end BeautyCompositionWitness

structure BeautyLinearOptimalityInstance where
  workload : BeautyLinearWorkload
  composition : BeautyCompositionWitness
  zeroDeficitA : workload.deficitA = 0

namespace BeautyLinearOptimalityInstance

def toAssumptions
    (certificate : BeautyLinearOptimalityInstance) :
    BeautyOptimalityAssumptions where
  definition := certificate.workload.toDefinitionAssumptions
  latency := certificate.workload.toLatencyAssumptions
  waste := certificate.workload.toWasteAssumptions
  pareto := certificate.workload.toParetoAssumptions certificate.zeroDeficitA
  composition := certificate.composition.toAssumptions
  beautyMonotoneFromDeficit := by
    intro hDeficit
    simpa [BeautyLinearWorkload.toDefinitionAssumptions, BeautyLinearWorkload.toLatencyAssumptions,
      BeautyLinearWorkload.deficitA, BeautyLinearWorkload.deficitB,
      BeautyLinearWorkload.beautyA, BeautyLinearWorkload.beautyB] using
      (Nat.sub_le_sub_left hDeficit certificate.workload.intrinsicBu)

theorem schema_instantiated
    (certificate : BeautyLinearOptimalityInstance) :
    let assumptions := certificate.toAssumptions
    (assumptions.definition.deficitBuA =
      assumptions.definition.intrinsicBu - assumptions.definition.implementationBuA /\
     assumptions.definition.deficitBuB =
      assumptions.definition.intrinsicBu - assumptions.definition.implementationBuB /\
     assumptions.definition.beautyBuA =
      assumptions.definition.intrinsicBu - assumptions.definition.deficitBuA /\
     assumptions.definition.beautyBuB =
      assumptions.definition.intrinsicBu - assumptions.definition.deficitBuB) /\
    assumptions.latency.latencyA <= assumptions.latency.latencyB /\
    assumptions.waste.wasteA <= assumptions.waste.wasteB /\
    assumptions.pareto.latencyA <= assumptions.pareto.latencyB /\
    assumptions.pareto.wasteA <= assumptions.pareto.wasteB /\
    assumptions.definition.beautyBuB <= assumptions.definition.beautyBuA /\
    assumptions.composition.globalBu =
      assumptions.composition.pipelineBu + assumptions.composition.protocolBu +
        assumptions.composition.compressionBu := by
  simpa using beauty_optimality_schema certificate.toAssumptions

theorem optimality
    (certificate : BeautyLinearOptimalityInstance) :
    (certificate.workload.deficitA =
      certificate.workload.intrinsicBu - certificate.workload.implementationBuA /\
     certificate.workload.deficitB =
      certificate.workload.intrinsicBu - certificate.workload.implementationBuB /\
     certificate.workload.beautyA =
      certificate.workload.intrinsicBu - certificate.workload.deficitA /\
     certificate.workload.beautyB =
      certificate.workload.intrinsicBu - certificate.workload.deficitB) /\
    certificate.workload.latencyA <= certificate.workload.latencyB /\
    certificate.workload.wasteA <= certificate.workload.wasteB /\
    (certificate.workload.deficitA = 0 /\
      certificate.workload.latencyA <= certificate.workload.latencyB /\
      certificate.workload.wasteA <= certificate.workload.wasteB) /\
    certificate.workload.beautyB <= certificate.workload.beautyA /\
    certificate.composition.globalBu =
      certificate.composition.pipelineBu + certificate.composition.protocolBu +
        certificate.composition.compressionBu := by
  exact
    ⟨ ⟨ certificate.workload.deficitA_eq
      , certificate.workload.deficitB_eq
      , certificate.workload.beautyA_eq
      , certificate.workload.beautyB_eq
      ⟩
    , certificate.workload.latency_monotone
    , certificate.workload.waste_monotone
    , certificate.workload.zero_deficit_pareto certificate.zeroDeficitA
    , certificate.workload.beauty_monotone
    , certificate.composition.global_eq_sum
    ⟩

end BeautyLinearOptimalityInstance

end ForkRaceFoldTheorems
