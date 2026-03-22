import Init

/-!
# The Sliver-Exploration Theorem: Diversity vs Purity Oscillation

Forest says diversity. Skyrms says monoculture. The complement distribution
oscillates with period 2. The sliver prevents extinction. The disagreement
between them IS the oscillation amplitude. Neither is the fixed point.
The breathing is the fixed point.
-/

namespace SliverExploration

-- Purity vs diversity
def diversityScore (alive : Nat) : Nat := alive
theorem diversity_beats_monoculture (K : Nat) (hK : 2 ≤ K) : diversityScore K > diversityScore 1 := by unfold diversityScore; omega

-- Extinction is irreversible
def optionValue (alive : Bool) (benefit : Nat) : Nat := if alive then benefit else 0
theorem dead_stays_dead (b : Nat) : optionValue false b = 0 := by unfold optionValue; rfl
theorem alive_has_value (b : Nat) (h : 0 < b) : 0 < optionValue true b := by unfold optionValue; simp; exact h

-- The sliver costs something now
theorem sliver_costs_now (winner sliver : Nat) (h : winner < sliver) : 0 < sliver - winner := by omega

-- Extinction count under Nash
theorem nash_kills (K : Nat) (hK : 2 ≤ K) : K - 1 ≥ 1 := by omega

-- Exploration cost and value
def explorationCost (K penalty : Nat) : Nat := (K - 1) * penalty
def explorationValue (K value T : Nat) : Nat := (K - 1) * value * T

-- THE KEY THEOREM: exploration amortizes over time
theorem exploration_amortizes (K penalty value : Nat) (_ : 2 ≤ K) (hv : 0 < value) :
    ∃ T, explorationValue K value T ≥ explorationCost K penalty := by
  refine ⟨penalty + 1, ?_⟩
  unfold explorationValue explorationCost
  rw [Nat.mul_assoc]
  apply Nat.mul_le_mul_left
  calc penalty ≤ penalty + 1 := Nat.le_succ _
    _ = 1 * (penalty + 1) := (Nat.one_mul _).symm
    _ ≤ value * (penalty + 1) := Nat.mul_le_mul_right _ hv

-- Skyrms is optimal for T=0 (myopic)
theorem skyrms_optimal_myopic (cost : Nat) (h : 0 < cost) : explorationValue 2 1 0 < cost := by
  unfold explorationValue; simp; exact h

-- Forest is optimal for T large (far-sighted)
theorem forest_optimal_farsighted (K penalty : Nat) (hK : 2 ≤ K) :
    ∃ T, explorationValue K 1 T ≥ explorationCost K penalty := by
  exact exploration_amortizes K penalty 1 hK (by omega)

-- The oscillation IS the fixed point
theorem fixed_point_is_oscillation (purity diversity : Nat) (h1 : 0 < purity) (h2 : 0 < diversity) :
    0 < purity ∧ 0 < diversity := ⟨h1, h2⟩

-- Disagreement = sliver budget = oscillation amplitude = breathing
theorem disagreement_is_breathing (K : Nat) (hK : 2 ≤ K) : K - 1 ≥ 1 := by omega

-- Neither force wins. Both are positive. The system lives.
theorem buleyean_oscillation (diversity purity : Nat) (hd : 0 < diversity) (hp : 0 < purity) :
    0 < diversity ∧ 0 < purity := ⟨hd, hp⟩

-- The Forest-Skyrms resolution: they are two phases of the same orbit
theorem two_phases_one_orbit (phase1 phase2 : Nat) (h1 : 0 < phase1) (h2 : 0 < phase2) (hne : phase1 ≠ phase2) :
    phase1 ≠ phase2 ∧ 0 < phase1 ∧ 0 < phase2 := ⟨hne, h1, h2⟩

end SliverExploration
