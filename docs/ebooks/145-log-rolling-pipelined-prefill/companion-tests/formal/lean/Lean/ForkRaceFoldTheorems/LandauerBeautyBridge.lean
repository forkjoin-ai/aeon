import Mathlib
import ForkRaceFoldTheorems.LandauerBuley
import ForkRaceFoldTheorems.BeautyOptimality

namespace ForkRaceFoldTheorems

/--
Thermodynamic Observable Coupling (Axiom TOC): the single physics axiom that
Landauer erasure heat is observable through latency or waste. Physically, erasing
a bit at temperature T dissipates >= kT ln 2 joules. Dissipating heat takes time
(latency) or produces waste. This structure encodes that principle as monotone
observable floor maps from heat to latency/waste, with a strict gap whenever
the heat is positive.
-/
structure ThermodynamicObservableCoupling where
  boltzmannConstant : ℝ
  temperature : ℝ
  hBoltzmannPos : 0 < boltzmannConstant
  hTemperaturePos : 0 < temperature
  latencyFromHeat : ℝ → ℝ
  wasteFromHeat : ℝ → ℝ
  latencyFromHeatMonotone : ∀ {hL hR}, hL ≤ hR → latencyFromHeat hL ≤ latencyFromHeat hR
  wasteFromHeatMonotone : ∀ {hL hR}, hL ≤ hR → wasteFromHeat hL ≤ wasteFromHeat hR
  strictGapFromPositiveHeat : ∀ {heat}, 0 < heat →
    latencyFromHeat 0 < latencyFromHeat heat ∨ wasteFromHeat 0 < wasteFromHeat heat

/--
Landauer Beauty Frontier: bundles a thermodynamic observable coupling with a frontier
of beauty failure Pareto points and a live-branch-count function, connecting deficit
to Landauer heat via the existing chain: positive deficit → liveBranches ≥ 2 →
entropy ≥ 1 bit → heat > 0 → observable gap.
-/
structure LandauerBeautyFrontier (coupling : ThermodynamicObservableCoupling) where
  pointOnFrontier : BeautyFailureParetoPoint → Prop
  floor : BeautyFailureParetoPoint
  liveBranches : BeautyFailureParetoPoint → ℕ
  floorOnFrontier : pointOnFrontier floor
  floorZeroDeficit : floor.deficit = 0
  floorLiveBranchesOne : liveBranches floor = 1
  deficitDeterminesLiveBranches :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point →
        0 < point.deficit →
          2 ≤ liveBranches point
  liveBranchesPositive :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point →
        0 < liveBranches point
  latencyLowerBound :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point →
        coupling.latencyFromHeat
          (landauerHeatLowerBound coupling.boltzmannConstant coupling.temperature
            (equiprobableFrontierEntropyBits (liveBranches point))) ≤ point.latency
  wasteLowerBound :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point →
        coupling.wasteFromHeat
          (landauerHeatLowerBound coupling.boltzmannConstant coupling.temperature
            (equiprobableFrontierEntropyBits (liveBranches point))) ≤ point.waste
  floorLatencyEq :
    floor.latency = coupling.latencyFromHeat 0
  floorWasteEq :
    floor.waste = coupling.wasteFromHeat 0
  zeroDeficitUniqueOnFrontier :
    ∀ {point : BeautyFailureParetoPoint},
      pointOnFrontier point →
        point.deficit = 0 →
          point = floor

private theorem landauer_heat_positive_of_two_le
    (coupling : ThermodynamicObservableCoupling)
    {liveBranches : ℕ}
    (hTwo : 2 ≤ liveBranches) :
    0 < landauerHeatLowerBound coupling.boltzmannConstant coupling.temperature
      (equiprobableFrontierEntropyBits liveBranches) := by
  unfold landauerHeatLowerBound
  have hLogTwo : 0 < Real.log 2 := Real.log_pos (by norm_num)
  have hEntropyPos : 0 < equiprobableFrontierEntropyBits liveBranches := by
    unfold equiprobableFrontierEntropyBits
    rw [Real.logb]
    apply div_pos
    · exact Real.log_pos (by exact_mod_cast (show 1 < liveBranches by omega))
    · exact hLogTwo
  exact mul_pos (mul_pos (mul_pos coupling.hBoltzmannPos coupling.hTemperaturePos) hLogTwo)
    hEntropyPos

private theorem landauer_heat_floor_zero
    (coupling : ThermodynamicObservableCoupling) :
    landauerHeatLowerBound coupling.boltzmannConstant coupling.temperature
      (equiprobableFrontierEntropyBits 1) = 0 := by
  unfold landauerHeatLowerBound equiprobableFrontierEntropyBits
  simp [Real.logb, Real.log_one]

private theorem landauer_heat_nonneg
    (coupling : ThermodynamicObservableCoupling)
    {liveBranches : ℕ}
    (hLive : 0 < liveBranches) :
    0 ≤ landauerHeatLowerBound coupling.boltzmannConstant coupling.temperature
      (equiprobableFrontierEntropyBits liveBranches) := by
  unfold landauerHeatLowerBound
  have hLogTwo : 0 < Real.log 2 := Real.log_pos (by norm_num)
  have hEntropyNonneg : 0 ≤ equiprobableFrontierEntropyBits liveBranches := by
    unfold equiprobableFrontierEntropyBits
    rw [Real.logb]
    apply div_nonneg
    · exact Real.log_nonneg (by exact_mod_cast hLive)
    · exact le_of_lt hLogTwo
  exact mul_nonneg
    (mul_nonneg (mul_nonneg (le_of_lt coupling.hBoltzmannPos) (le_of_lt coupling.hTemperaturePos))
      (le_of_lt hLogTwo))
    hEntropyNonneg

/--
Bridge construction: given a thermodynamic observable coupling and a Landauer beauty
frontier, construct a `BeautyFailureTaxObservableFrontier`. This is the key theorem
that closes THM-BEAUTY-UNCONDITIONAL-FLOOR conditionally on the coupling axiom.

The proof composes existing results:
- Positive deficit → liveBranches ≥ 2 → entropy ≥ 1 bit → heat > 0
- Heat > 0 → observable gap (from the coupling)
- Observable floor maps are monotone (from the coupling)
- Latency/waste lower bounds hold pointwise (from the frontier)
-/
noncomputable def landauer_beauty_frontier_to_observable_frontier
    (coupling : ThermodynamicObservableCoupling)
    (frontier : LandauerBeautyFrontier coupling) :
    BeautyFailureTaxObservableFrontier where
  pointOnFrontier := frontier.pointOnFrontier
  floor := frontier.floor
  failureTax := fun point =>
    landauerHeatLowerBound coupling.boltzmannConstant coupling.temperature
      (equiprobableFrontierEntropyBits (frontier.liveBranches point))
  latencyFloorFromTax := coupling.latencyFromHeat
  wasteFloorFromTax := coupling.wasteFromHeat
  floorOnFrontier := frontier.floorOnFrontier
  floorZeroDeficit := frontier.floorZeroDeficit
  floorFailureTaxZero := by
    rw [frontier.floorLiveBranchesOne]
    exact landauer_heat_floor_zero coupling
  taxNonnegative := by
    intro point hPoint
    exact landauer_heat_nonneg coupling (frontier.liveBranchesPositive hPoint)
  positiveDeficitForcesPositiveTax := by
    intro point hPoint hPositiveDeficit
    exact landauer_heat_positive_of_two_le coupling
      (frontier.deficitDeterminesLiveBranches hPoint hPositiveDeficit)
  latencyFloorFromTaxMonotone := fun hTax => coupling.latencyFromHeatMonotone hTax
  wasteFloorFromTaxMonotone := fun hTax => coupling.wasteFromHeatMonotone hTax
  latencyLowerBoundByTax := fun hPoint => frontier.latencyLowerBound hPoint
  wasteLowerBoundByTax := fun hPoint => frontier.wasteLowerBound hPoint
  strictObservableGapFromPositiveTax := fun hTax =>
    coupling.strictGapFromPositiveHeat hTax
  floorLatencyEqTaxZero := frontier.floorLatencyEq
  floorWasteEqTaxZero := frontier.floorWasteEq
  zeroDeficitUniqueOnFrontier := frontier.zeroDeficitUniqueOnFrontier

/--
Paper theorem (conditional on Axiom TOC): under the thermodynamic observable coupling,
zero topological deficit is the strict unique global minimum for every strict
generalized-convex cost on the Landauer beauty frontier.

This composes the bridge construction with the existing
`floor_strict_generalized_convex_cost_global_minimum`.
-/
theorem landauer_beauty_unconditional_floor
    (coupling : ThermodynamicObservableCoupling)
    (frontier : LandauerBeautyFrontier coupling)
    (cost : BeautyStrictGeneralizedConvexCost) :
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point →
        frontier.floor.cost cost.toBeautyGeneralizedConvexCost ≤
          point.cost cost.toBeautyGeneralizedConvexCost) ∧
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point →
        point.cost cost.toBeautyGeneralizedConvexCost ≤
          frontier.floor.cost cost.toBeautyGeneralizedConvexCost →
        point = frontier.floor) :=
  let bridge := landauer_beauty_frontier_to_observable_frontier coupling frontier
  bridge.floor_strict_generalized_convex_cost_global_minimum cost

/--
Paper theorem (conditional on Axiom TOC): under the thermodynamic observable coupling,
zero topological deficit is the strict unique global minimum for every strict
real monotone objective on the Landauer beauty frontier.
-/
theorem landauer_beauty_unconditional_floor_objective
    (coupling : ThermodynamicObservableCoupling)
    (frontier : LandauerBeautyFrontier coupling)
    (objective : BeautyRealStrictObjective) :
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point →
        frontier.floor.objectiveScore objective.toBeautyRealMonotoneObjective ≤
          point.objectiveScore objective.toBeautyRealMonotoneObjective) ∧
    (∀ {point : BeautyFailureParetoPoint},
      frontier.pointOnFrontier point →
        point.objectiveScore objective.toBeautyRealMonotoneObjective ≤
          frontier.floor.objectiveScore objective.toBeautyRealMonotoneObjective →
        point = frontier.floor) :=
  let bridge := landauer_beauty_frontier_to_observable_frontier coupling frontier
  bridge.floor_strict_objective_global_minimum objective

end ForkRaceFoldTheorems
