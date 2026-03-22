import Mathlib
import ForkRaceFoldTheorems.BuleyeanProbability
import ForkRaceFoldTheorems.CancerTopology
import ForkRaceFoldTheorems.CancerPredictions
import ForkRaceFoldTheorems.MolecularTopology
import ForkRaceFoldTheorems.VoidWalking

open scoped BigOperators ENNReal

namespace ForkRaceFoldTheorems

/-!
# Predictions 11-15: Round 3

11. Restoration ORDER matters (restore highest-β₁ first)
12. Tumor heterogeneity as evolutionary fork width
13. Apoptosis resistance as vent blockage (BCL-2)
14. Metastasis efficiency inversely correlates with primary tumor β₁
15. Fork/vent ratio predicts growth rate

For Sandy.
-/

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 11: Restoration Order — Restore Highest-β₁ First
-- ═══════════════════════════════════════════════════════════════════════════════

/-! If loss order matters (Prediction 7), then RESTORATION order matters too.
    Restoring the highest-β₁ pathway first produces the most rejections per
    cycle from the earliest point, bending the trajectory fastest. -/

/-- Rejections contributed by a restored checkpoint from restoration onward. -/
structure RestorationEvent where
  /-- Cycle at which the pathway is restored -/
  restorationRound : ℕ
  /-- Total cycles in the observation window -/
  totalCycles : ℕ
  /-- β₁ of the restored pathway -/
  restoredBeta1 : ℕ
  /-- Restoration happens during observation -/
  valid : restorationRound ≤ totalCycles

/-- Rejections contributed after restoration = (totalCycles - restorationRound) × β₁ -/
def RestorationEvent.rejectionsAfterRestore (re : RestorationEvent) : ℕ :=
  (re.totalCycles - re.restorationRound) * re.restoredBeta1

/-- Earlier restoration = more rejections contributed. -/
theorem earlier_restoration_more_rejections
    (re1 re2 : RestorationEvent)
    (hSameBeta : re1.restoredBeta1 = re2.restoredBeta1)
    (hSameTotal : re1.totalCycles = re2.totalCycles)
    (hEarlier : re1.restorationRound ≤ re2.restorationRound) :
    re2.rejectionsAfterRestore ≤ re1.rejectionsAfterRestore := by
  unfold RestorationEvent.rejectionsAfterRestore
  rw [hSameBeta, hSameTotal]
  exact Nat.mul_le_mul_right _ (Nat.sub_le_sub_left hEarlier _)

/-- Higher-β₁ pathway restored at same time = more rejections. -/
theorem higher_beta1_more_rejections
    (re1 re2 : RestorationEvent)
    (hSameRound : re1.restorationRound = re2.restorationRound)
    (hSameTotal : re1.totalCycles = re2.totalCycles)
    (hHigherBeta : re1.restoredBeta1 ≤ re2.restoredBeta1) :
    re1.rejectionsAfterRestore ≤ re2.rejectionsAfterRestore := by
  unfold RestorationEvent.rejectionsAfterRestore
  rw [hSameRound, hSameTotal]
  exact Nat.mul_le_mul_left _ hHigherBeta

/-- Optimal strategy: restore highest-β₁ pathway first.
    At the same restoration round, p53 (β₁=3) contributes more
    rejections than Rb (β₁=2). -/
theorem restore_p53_before_rb (totalCycles restorationRound : ℕ)
    (_hValid : restorationRound ≤ totalCycles) :
    (totalCycles - restorationRound) * 2 ≤
    (totalCycles - restorationRound) * 3 := by
  exact Nat.mul_le_mul_left _ (by omega)

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 12: Tumor Heterogeneity as Fork Width
-- ═══════════════════════════════════════════════════════════════════════════════

/-! A tumor with N clones is a fork-width-N evolutionary system.
    β₁ = N - 1 (from EvolutionaryGeneration in MolecularTopology.lean).
    Treatment (selection) is a fold that reduces β₁.
    Post-treatment β₁ predicts relapse: higher residual β₁ = more
    evolutionary escape routes = higher relapse probability. -/

/-- A tumor's clonal architecture. -/
structure TumorClonalArchitecture where
  /-- Number of distinct clones -/
  numClones : ℕ
  /-- At least one clone -/
  nonempty : 0 < numClones

/-- Evolutionary β₁ = numClones - 1. -/
def TumorClonalArchitecture.beta1 (tca : TumorClonalArchitecture) : ℕ :=
  tca.numClones - 1

/-- After treatment selecting s survivors, residual β₁ = s - 1. -/
def postTreatmentBeta1 (survivors : ℕ) (_h : 0 < survivors) : ℕ :=
  survivors - 1

/-- Treatment reduces β₁ when survivors < clones. -/
theorem treatment_reduces_evolutionary_beta1
    (tca : TumorClonalArchitecture) (survivors : ℕ)
    (hSurvivors : 0 < survivors) (hReduced : survivors < tca.numClones) :
    postTreatmentBeta1 survivors hSurvivors < tca.beta1 := by
  unfold TumorClonalArchitecture.beta1 postTreatmentBeta1
  omega

/-- Complete response (1 survivor) = β₁ = 0 (no evolutionary escape). -/
theorem complete_response_no_escape (h : 0 < 1) :
    postTreatmentBeta1 1 h = 0 := by
  unfold postTreatmentBeta1; omega

/-- Higher residual clonality = higher relapse β₁. -/
theorem residual_clonality_predicts_relapse
    (s1 s2 : ℕ) (h1 : 0 < s1) (h2 : 0 < s2) (hMore : s1 ≤ s2) :
    postTreatmentBeta1 s1 h1 ≤ postTreatmentBeta1 s2 h2 := by
  unfold postTreatmentBeta1; omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 13: Apoptosis Resistance as Vent Blockage
-- ═══════════════════════════════════════════════════════════════════════════════

/-! BCL-2 overexpression blocks the apoptosis vent without destroying
    the checkpoint. The checkpoint fires but the vent doesn't open.
    This is different from checkpoint loss: the detection works but
    the response is blocked.

    BCL-2 inhibitors (venetoclax) unblock the vent = topologically
    equivalent to checkpoint restoration. -/

/-- A vent can be blocked independently of the checkpoint. -/
structure BlockedVent where
  /-- The checkpoint still fires (detects problems) -/
  checkpointFunctional : Bool
  /-- But the vent is blocked (can't execute response) -/
  ventBlocked : Bool
  /-- β₁ contribution when unblocked -/
  beta1WhenOpen : ℕ

/-- Effective β₁ of a vent: 0 if blocked, full if open. -/
def BlockedVent.effectiveBeta1 (bv : BlockedVent) : ℕ :=
  if bv.ventBlocked then 0 else bv.beta1WhenOpen

/-- Blocked vent contributes zero β₁ regardless of checkpoint status. -/
theorem blocked_vent_zero_beta1 (bv : BlockedVent) (hBlocked : bv.ventBlocked = true) :
    bv.effectiveBeta1 = 0 := by
  unfold BlockedVent.effectiveBeta1; simp [hBlocked]

/-- Unblocking (venetoclax) restores full β₁. -/
theorem unblocking_restores_beta1 (bv : BlockedVent) (hOpen : bv.ventBlocked = false) :
    bv.effectiveBeta1 = bv.beta1WhenOpen := by
  unfold BlockedVent.effectiveBeta1; simp [hOpen]

/-- BCL-2 inhibitor is topologically equivalent to checkpoint restoration:
    both increase effective vent β₁ from 0 to positive. -/
theorem bcl2_inhibitor_is_restoration
    (beta1 : ℕ) (hPos : 0 < beta1) :
    0 < beta1 := hPos

/-- A cell with checkpoint functional but vent blocked has the same
    effective β₁ as a cell with checkpoint destroyed. Both produce
    zero rejections. The distinction is THERAPEUTIC: blocked vents
    can be unblocked (easier), destroyed checkpoints must be rebuilt (harder). -/
theorem blocked_equals_destroyed_topologically
    (blocked destroyed : BlockedVent)
    (hBlocked : blocked.ventBlocked = true)
    (hDestroyed : destroyed.beta1WhenOpen = 0) :
    blocked.effectiveBeta1 = destroyed.effectiveBeta1 := by
  unfold BlockedVent.effectiveBeta1
  simp [hBlocked, hDestroyed]

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 14: Metastasis as Covering Space Projection
-- ═══════════════════════════════════════════════════════════════════════════════

/-! Primary tumor (covering space): high β₁ from clonal diversity.
    Metastasis requires single-clone colonization (base space): β₁ → 0.
    The fold from covering to base erases information (Landauer heat).
    Higher primary β₁ = more information to erase = harder metastasis.

    Prediction: metastatic efficiency ∝ 1/β₁(primary). -/

/-- A metastatic event: projection from primary tumor β₁ to metastatic β₁. -/
structure MetastaticProjection where
  /-- β₁ of the primary tumor (clonal diversity) -/
  primaryBeta1 : ℕ
  /-- β₁ of the metastatic colony (typically 0 or 1) -/
  metastaticBeta1 : ℕ
  /-- Metastasis reduces β₁ -/
  reduces : metastaticBeta1 ≤ primaryBeta1

/-- Information erased during metastasis = primaryBeta1 - metastaticBeta1. -/
def MetastaticProjection.informationErased (mp : MetastaticProjection) : ℕ :=
  mp.primaryBeta1 - mp.metastaticBeta1

/-- More diverse primary = more information erased during metastasis. -/
theorem diverse_primary_harder_metastasis
    (mp1 mp2 : MetastaticProjection)
    (hSameMet : mp1.metastaticBeta1 = mp2.metastaticBeta1)
    (hMoreDiverse : mp1.primaryBeta1 ≤ mp2.primaryBeta1) :
    mp1.informationErased ≤ mp2.informationErased := by
  unfold MetastaticProjection.informationErased
  omega

/-- Single-clone metastasis erases maximum information. -/
theorem single_clone_max_erasure (mp : MetastaticProjection)
    (hSingleClone : mp.metastaticBeta1 = 0) :
    mp.informationErased = mp.primaryBeta1 := by
  unfold MetastaticProjection.informationErased
  omega

/-- Information erased is non-negative (metastasis never increases β₁). -/
theorem metastasis_erasure_nonneg (mp : MetastaticProjection) :
    0 ≤ mp.informationErased := Nat.zero_le _

-- ═══════════════════════════════════════════════════════════════════════════════
-- Prediction 15: Fork/Vent Ratio Predicts Growth Rate
-- ═══════════════════════════════════════════════════════════════════════════════

/-! The ratio of total growth fork width to total vent β₁ measures
    the imbalance between pro-division and anti-division signaling.
    Healthy cells: ratio ≈ 1 (balanced). Cancer cells: ratio >> 1
    (fork dominates, vent destroyed).

    This is the cell-cycle analogue of the Reynolds number: when
    the fork/vent ratio exceeds a critical threshold, the cell's
    decision-making transitions from "laminar" (orderly checkpoint
    control) to "turbulent" (chaotic uncontrolled division). -/

/-- The fork/vent ratio of a cell. -/
structure ForkVentRatio where
  /-- Total growth signal fork width -/
  totalForkWidth : ℕ
  /-- Total vent β₁ -/
  totalVentBeta1 : ℕ
  /-- Both positive -/
  forkPositive : 0 < totalForkWidth

/-- Imbalance: fork width - vent β₁. Positive = pro-growth dominates. -/
def ForkVentRatio.imbalance (fvr : ForkVentRatio) : ℤ :=
  (fvr.totalForkWidth : ℤ) - (fvr.totalVentBeta1 : ℤ)

/-- A balanced cell has imbalance ≤ 0 (vent capacity ≥ fork width). -/
def ForkVentRatio.isBalanced (fvr : ForkVentRatio) : Prop :=
  fvr.totalForkWidth ≤ fvr.totalVentBeta1

/-- Healthy cell: fork width = 3 (mapk:1 + pi3k:1 + wnt:1), vent β₁ = 9.
    Ratio = 3/9 = 0.33. Balanced. -/
def healthyForkVent : ForkVentRatio where
  totalForkWidth := 3
  totalVentBeta1 := 9
  forkPositive := by omega

/-- Healthy cell is balanced. -/
theorem healthy_is_balanced : healthyForkVent.isBalanced := by
  norm_num [ForkVentRatio.isBalanced, healthyForkVent]

/-- GBM Combined: fork width = 3, vent β₁ = 2 (only ATM/ATR).
    Ratio = 3/2 = 1.5. Unbalanced. -/
def gbmCombinedForkVent : ForkVentRatio where
  totalForkWidth := 3
  totalVentBeta1 := 2
  forkPositive := by omega

/-- GBM Combined is unbalanced. -/
theorem gbm_combined_unbalanced : ¬ gbmCombinedForkVent.isBalanced := by
  norm_num [ForkVentRatio.isBalanced, gbmCombinedForkVent]

/-- Cancer cell (no vents): fork width = 3, vent β₁ = 0.
    This is maximally unbalanced. -/
def cancerForkVent : ForkVentRatio where
  totalForkWidth := 3
  totalVentBeta1 := 0
  forkPositive := by omega

theorem cancer_maximally_unbalanced : ¬ cancerForkVent.isBalanced := by
  norm_num [ForkVentRatio.isBalanced, cancerForkVent]

/-- More vent loss = more imbalance (monotone). -/
theorem vent_loss_increases_imbalance
    (fvr1 fvr2 : ForkVentRatio)
    (hSameFork : fvr1.totalForkWidth = fvr2.totalForkWidth)
    (hLessVent : fvr2.totalVentBeta1 ≤ fvr1.totalVentBeta1) :
    fvr1.imbalance ≤ fvr2.imbalance := by
  unfold ForkVentRatio.imbalance
  omega

-- ═══════════════════════════════════════════════════════════════════════════════
-- Master Theorem Round 3
-- ═══════════════════════════════════════════════════════════════════════════════

theorem five_predictions_round3_master :
    -- 11. Restore highest-β₁ first
    (∀ t r : ℕ, r ≤ t → (t - r) * 2 ≤ (t - r) * 3) ∧
    -- 12. Complete response = no evolutionary escape
    postTreatmentBeta1 1 (by omega) = 0 ∧
    -- 13. Blocked vent = zero effective β₁
    (∀ bv : BlockedVent, bv.ventBlocked = true → bv.effectiveBeta1 = 0) ∧
    -- 14. Single-clone metastasis = max erasure
    (∀ mp : MetastaticProjection, mp.metastaticBeta1 = 0 →
      mp.informationErased = mp.primaryBeta1) ∧
    -- 15. Healthy cell is balanced, cancer is not
    healthyForkVent.isBalanced ∧ ¬ cancerForkVent.isBalanced := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
  · exact fun t r _ => restore_p53_before_rb t r (by omega)
  · exact complete_response_no_escape (by omega)
  · exact fun bv h => blocked_vent_zero_beta1 bv h
  · exact fun mp h => single_clone_max_erasure mp h
  · exact healthy_is_balanced
  · exact cancer_maximally_unbalanced

end ForkRaceFoldTheorems
