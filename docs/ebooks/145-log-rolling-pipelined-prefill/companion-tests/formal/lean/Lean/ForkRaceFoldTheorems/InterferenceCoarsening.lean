import ForkRaceFoldTheorems.Axioms

namespace ForkRaceFoldTheorems

open scoped BigOperators

section GraphQuotients

variable {α β : Type*} [DecidableEq α] [DecidableEq β]

structure QuotientCollapseWitness (α β : Type*) [DecidableEq α] [DecidableEq β] where
  liveSupport : Finset α
  quotient : α → β
  injectiveOnLive : Set.InjOn quotient (↑liveSupport : Set α)

namespace QuotientCollapseWitness

def fineInitialLive (witness : QuotientCollapseWitness α β) : Nat :=
  witness.liveSupport.card

def coarseSupport (witness : QuotientCollapseWitness α β) : Finset β :=
  witness.liveSupport.image witness.quotient

def coarseInitialLive (witness : QuotientCollapseWitness α β) : Nat :=
  witness.coarseSupport.card

def coarseTotalVented (_witness : QuotientCollapseWitness α β) : Nat := 0

def coarseTerminalLive (witness : QuotientCollapseWitness α β) : Nat :=
  if witness.coarseInitialLive = 0 then 0 else 1

def coarseTotalRepairDebt (witness : QuotientCollapseWitness α β) : Nat :=
  witness.coarseInitialLive - 1

def fineContagious (witness : QuotientCollapseWitness α β) : Prop :=
  1 < witness.fineInitialLive

def coarseDeterministicCollapse (witness : QuotientCollapseWitness α β) : Prop :=
  0 < witness.coarseInitialLive

theorem coarseInitialLive_eq_fineInitialLive
    (witness : QuotientCollapseWitness α β) :
    witness.coarseInitialLive = witness.fineInitialLive := by
  unfold coarseInitialLive coarseSupport fineInitialLive
  exact Finset.card_image_of_injOn witness.injectiveOnLive

theorem supportPreservingQuotient
    (witness : QuotientCollapseWitness α β) :
    1 < witness.fineInitialLive ->
    1 < witness.coarseInitialLive := by
  intro hFineForked
  simpa [witness.coarseInitialLive_eq_fineInitialLive] using hFineForked

theorem coarseDeterministicCollapse_holds
    (witness : QuotientCollapseWitness α β)
    (hFineForked : 1 < witness.fineInitialLive) :
    witness.coarseDeterministicCollapse := by
  unfold coarseDeterministicCollapse
  have hCoarseForked := witness.supportPreservingQuotient hFineForked
  omega

theorem coarseTerminalLive_eq_one_of_collapse
    (witness : QuotientCollapseWitness α β)
    (hCollapse : witness.coarseDeterministicCollapse) :
    witness.coarseTerminalLive = 1 := by
  unfold coarseDeterministicCollapse coarseTerminalLive at *
  split_ifs with hZero
  · omega
  · rfl

theorem zero_vent_deterministic_collapse_requires_repair
    (witness : QuotientCollapseWitness α β)
    (hFineForked : 1 < witness.fineInitialLive) :
    0 < witness.coarseTotalRepairDebt := by
  unfold coarseTotalRepairDebt
  have hCoarseForked := witness.supportPreservingQuotient hFineForked
  omega

def toInterferenceCoarseningAssumptions
    (witness : QuotientCollapseWitness α β) :
    InterferenceCoarseningAssumptions where
  fineInitialLive := witness.fineInitialLive
  coarseInitialLive := witness.coarseInitialLive
  coarseTerminalLive := witness.coarseTerminalLive
  coarseTotalVented := witness.coarseTotalVented
  coarseTotalRepairDebt := witness.coarseTotalRepairDebt
  fineContagious := witness.fineContagious
  coarseDeterministicCollapse := witness.coarseDeterministicCollapse
  supportPreservingQuotient := witness.supportPreservingQuotient
  survivorFaithfulQuotient := witness.coarseTerminalLive_eq_one_of_collapse
  contagionReflectingQuotient := by
    intro _ hContagious _
    left
    simpa [QuotientCollapseWitness.fineContagious] using
      witness.zero_vent_deterministic_collapse_requires_repair hContagious

theorem interference_boundary_from_graph_quotient
    (witness : QuotientCollapseWitness α β) :
    witness.fineContagious ->
    witness.coarseDeterministicCollapse ->
    0 < witness.coarseTotalRepairDebt := by
  intro hContagious _
  simpa [QuotientCollapseWitness.fineContagious] using
    witness.zero_vent_deterministic_collapse_requires_repair hContagious

theorem interference_schema_instantiated
    (witness : QuotientCollapseWitness α β) :
    witness.fineContagious ->
    witness.coarseDeterministicCollapse ->
    0 < witness.coarseTotalVented \/ 0 < witness.coarseTotalRepairDebt := by
  intro hContagious hCollapse
  right
  exact witness.interference_boundary_from_graph_quotient hContagious hCollapse

end QuotientCollapseWitness

structure ManyToOneGraphQuotient (α β : Type*) [DecidableEq α] [DecidableEq β] where
  liveSupport : Finset α
  quotient : α → β
  arrivalPressure : α → ℝ
  serviceCapacity : α → ℝ
  restorativeShedding : α → ℝ

namespace ManyToOneGraphQuotient

def Phi (quotientData : ManyToOneGraphQuotient α β) : Finset β :=
  quotientData.liveSupport.image quotientData.quotient

def aggregateArrivalPressure (quotientData : ManyToOneGraphQuotient α β) (coarseNode : β) : ℝ :=
  ∑ fineNode ∈ quotientData.liveSupport with quotientData.quotient fineNode = coarseNode,
    quotientData.arrivalPressure fineNode

def aggregateServiceCapacity (quotientData : ManyToOneGraphQuotient α β) (coarseNode : β) : ℝ :=
  ∑ fineNode ∈ quotientData.liveSupport with quotientData.quotient fineNode = coarseNode,
    quotientData.serviceCapacity fineNode

def aggregateRestorativeShedding
    (quotientData : ManyToOneGraphQuotient α β) (coarseNode : β) : ℝ :=
  ∑ fineNode ∈ quotientData.liveSupport with quotientData.quotient fineNode = coarseNode,
    quotientData.restorativeShedding fineNode

def aggregateDrift (quotientData : ManyToOneGraphQuotient α β) (coarseNode : β) : ℝ :=
  quotientData.aggregateArrivalPressure coarseNode -
    (quotientData.aggregateServiceCapacity coarseNode +
      quotientData.aggregateRestorativeShedding coarseNode)

def totalFineDrift (quotientData : ManyToOneGraphQuotient α β) : ℝ :=
  ∑ fineNode ∈ quotientData.liveSupport,
    (quotientData.arrivalPressure fineNode -
      (quotientData.serviceCapacity fineNode + quotientData.restorativeShedding fineNode))

def collapsedArrivalPressure (quotientData : ManyToOneGraphQuotient α β) : ℝ :=
  ∑ fineNode ∈ quotientData.liveSupport, quotientData.arrivalPressure fineNode

def collapsedServiceCapacity (quotientData : ManyToOneGraphQuotient α β) : ℝ :=
  ∑ fineNode ∈ quotientData.liveSupport, quotientData.serviceCapacity fineNode

def collapsedRestorativeShedding (quotientData : ManyToOneGraphQuotient α β) : ℝ :=
  ∑ fineNode ∈ quotientData.liveSupport, quotientData.restorativeShedding fineNode

def collapsedDrift (quotientData : ManyToOneGraphQuotient α β) : ℝ :=
  quotientData.collapsedArrivalPressure -
    (quotientData.collapsedServiceCapacity + quotientData.collapsedRestorativeShedding)

structure StructuralRenormalizedNode where
  arrivalPressure : ℝ
  serviceCapacity : ℝ
  restorativeShedding : ℝ
  drift : ℝ

namespace StructuralRenormalizedNode

abbrev StateSpace : Type := ℝ

noncomputable def stateMeasure
    (node : StructuralRenormalizedNode) : MeasureTheory.Measure StateSpace :=
  MeasureTheory.Measure.dirac node.drift

def expectedLyapunov
    (node : StructuralRenormalizedNode) : StateSpace → ℝ :=
  fun _ => node.drift

def lyapunov
    (_node : StructuralRenormalizedNode) : StateSpace → ℝ :=
  fun _ => 0

def smallSet
    (_node : StructuralRenormalizedNode) : Set StateSpace :=
  ∅

def MeasurableDriftWitness
    (node : StructuralRenormalizedNode)
    (driftGap : ℝ) : Prop :=
  Measurable node.expectedLyapunov ∧
    Measurable node.lyapunov ∧
    MeasurableSet node.smallSet ∧
    KernelFosterLyapunovDrift node.expectedLyapunov node.lyapunov node.smallSet driftGap

theorem measurableExpectedLyapunov
    (node : StructuralRenormalizedNode) :
    Measurable node.expectedLyapunov := by
  change Measurable (fun _ : StateSpace => node.drift)
  exact measurable_const

theorem measurableLyapunov
    (node : StructuralRenormalizedNode) :
    Measurable node.lyapunov := by
  change Measurable (fun _ : StateSpace => 0)
  exact measurable_const

theorem measurableSmallSet
    (node : StructuralRenormalizedNode) :
    MeasurableSet node.smallSet := by
  simp [smallSet]

theorem kernelFosterLyapunovDrift_of_drift_le
    (node : StructuralRenormalizedNode)
    {γ : ℝ}
    (hDrift : node.drift ≤ -γ) :
    KernelFosterLyapunovDrift node.expectedLyapunov node.lyapunov node.smallSet γ := by
  intro current hCurrent
  simpa [expectedLyapunov, lyapunov] using hDrift

theorem measurableDriftWitness_of_drift_le
    (node : StructuralRenormalizedNode)
    {γ : ℝ}
    (hDrift : node.drift ≤ -γ) :
    node.MeasurableDriftWitness γ := by
  refine ⟨node.measurableExpectedLyapunov, node.measurableLyapunov, node.measurableSmallSet, ?_⟩
  exact node.kernelFosterLyapunovDrift_of_drift_le hDrift

end StructuralRenormalizedNode

def structuralRenormalization
    (quotientData : ManyToOneGraphQuotient α β) :
    StructuralRenormalizedNode where
  arrivalPressure := quotientData.collapsedArrivalPressure
  serviceCapacity := quotientData.collapsedServiceCapacity
  restorativeShedding := quotientData.collapsedRestorativeShedding
  drift := quotientData.collapsedDrift

def Φ (quotientData : ManyToOneGraphQuotient α β) : StructuralRenormalizedNode :=
  quotientData.structuralRenormalization

theorem aggregateArrivalPressure_total_preserved
    (quotientData : ManyToOneGraphQuotient α β) :
    ∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateArrivalPressure coarseNode =
      ∑ fineNode ∈ quotientData.liveSupport, quotientData.arrivalPressure fineNode := by
  classical
  unfold Phi aggregateArrivalPressure
  simpa using
    (Finset.sum_fiberwise_of_maps_to
      (s := quotientData.liveSupport)
      (t := quotientData.liveSupport.image quotientData.quotient)
      (g := quotientData.quotient)
      (h := by
        intro fineNode hFineNode
        exact Finset.mem_image_of_mem quotientData.quotient hFineNode)
      (f := quotientData.arrivalPressure))

theorem aggregateServiceCapacity_total_preserved
    (quotientData : ManyToOneGraphQuotient α β) :
    ∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateServiceCapacity coarseNode =
      ∑ fineNode ∈ quotientData.liveSupport, quotientData.serviceCapacity fineNode := by
  classical
  unfold Phi aggregateServiceCapacity
  simpa using
    (Finset.sum_fiberwise_of_maps_to
      (s := quotientData.liveSupport)
      (t := quotientData.liveSupport.image quotientData.quotient)
      (g := quotientData.quotient)
      (h := by
        intro fineNode hFineNode
        exact Finset.mem_image_of_mem quotientData.quotient hFineNode)
      (f := quotientData.serviceCapacity))

theorem aggregateRestorativeShedding_total_preserved
    (quotientData : ManyToOneGraphQuotient α β) :
    ∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateRestorativeShedding coarseNode =
      ∑ fineNode ∈ quotientData.liveSupport, quotientData.restorativeShedding fineNode := by
  classical
  unfold Phi aggregateRestorativeShedding
  simpa using
    (Finset.sum_fiberwise_of_maps_to
      (s := quotientData.liveSupport)
      (t := quotientData.liveSupport.image quotientData.quotient)
      (g := quotientData.quotient)
      (h := by
        intro fineNode hFineNode
        exact Finset.mem_image_of_mem quotientData.quotient hFineNode)
      (f := quotientData.restorativeShedding))

theorem aggregateDrift_total_preserved
    (quotientData : ManyToOneGraphQuotient α β) :
    ∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateDrift coarseNode =
      quotientData.totalFineDrift := by
  unfold aggregateDrift totalFineDrift
  rw [Finset.sum_sub_distrib]
  rw [show
    ∑ coarseNode ∈ quotientData.Phi,
        (quotientData.aggregateServiceCapacity coarseNode +
          quotientData.aggregateRestorativeShedding coarseNode) =
      (∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateServiceCapacity coarseNode) +
        ∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateRestorativeShedding coarseNode by
      rw [Finset.sum_add_distrib]]
  rw [quotientData.aggregateArrivalPressure_total_preserved,
    quotientData.aggregateServiceCapacity_total_preserved,
    quotientData.aggregateRestorativeShedding_total_preserved]
  rw [show
    (∑ fineNode ∈ quotientData.liveSupport, quotientData.serviceCapacity fineNode) +
      ∑ fineNode ∈ quotientData.liveSupport, quotientData.restorativeShedding fineNode =
    ∑ fineNode ∈ quotientData.liveSupport,
      (quotientData.serviceCapacity fineNode + quotientData.restorativeShedding fineNode) by
      rw [← Finset.sum_add_distrib]]
  rw [← Finset.sum_sub_distrib]

theorem collapsedDrift_eq_totalFineDrift
    (quotientData : ManyToOneGraphQuotient α β) :
    quotientData.collapsedDrift = quotientData.totalFineDrift := by
  unfold collapsedDrift collapsedArrivalPressure collapsedServiceCapacity
    collapsedRestorativeShedding totalFineDrift
  rw [show
    (∑ fineNode ∈ quotientData.liveSupport, quotientData.serviceCapacity fineNode) +
      ∑ fineNode ∈ quotientData.liveSupport, quotientData.restorativeShedding fineNode =
    ∑ fineNode ∈ quotientData.liveSupport,
      (quotientData.serviceCapacity fineNode + quotientData.restorativeShedding fineNode) by
      rw [← Finset.sum_add_distrib]]
  rw [← Finset.sum_sub_distrib]

theorem aggregateArrivalPressure_eq_collapsedArrivalPressure_of_Phi_eq_singleton
    (quotientData : ManyToOneGraphQuotient α β) {coarseNode : β}
    (hPhi : quotientData.Phi = {coarseNode}) :
    quotientData.aggregateArrivalPressure coarseNode = quotientData.collapsedArrivalPressure := by
  have hPres := quotientData.aggregateArrivalPressure_total_preserved
  rw [hPhi] at hPres
  simpa [collapsedArrivalPressure] using hPres

theorem aggregateServiceCapacity_eq_collapsedServiceCapacity_of_Phi_eq_singleton
    (quotientData : ManyToOneGraphQuotient α β) {coarseNode : β}
    (hPhi : quotientData.Phi = {coarseNode}) :
    quotientData.aggregateServiceCapacity coarseNode = quotientData.collapsedServiceCapacity := by
  have hPres := quotientData.aggregateServiceCapacity_total_preserved
  rw [hPhi] at hPres
  simpa [collapsedServiceCapacity] using hPres

theorem aggregateRestorativeShedding_eq_collapsedRestorativeShedding_of_Phi_eq_singleton
    (quotientData : ManyToOneGraphQuotient α β) {coarseNode : β}
    (hPhi : quotientData.Phi = {coarseNode}) :
    quotientData.aggregateRestorativeShedding coarseNode =
      quotientData.collapsedRestorativeShedding := by
  have hPres := quotientData.aggregateRestorativeShedding_total_preserved
  rw [hPhi] at hPres
  simpa [collapsedRestorativeShedding] using hPres

theorem aggregateDrift_eq_totalFineDrift_of_Phi_eq_singleton
    (quotientData : ManyToOneGraphQuotient α β) {coarseNode : β}
    (hPhi : quotientData.Phi = {coarseNode}) :
    quotientData.aggregateDrift coarseNode = quotientData.totalFineDrift := by
  have hPres := quotientData.aggregateDrift_total_preserved
  rw [hPhi] at hPres
  simpa using hPres

theorem aggregateDrift_eq_collapsedDrift_of_Phi_eq_singleton
    (quotientData : ManyToOneGraphQuotient α β) {coarseNode : β}
    (hPhi : quotientData.Phi = {coarseNode}) :
    quotientData.aggregateDrift coarseNode = quotientData.collapsedDrift := by
  rw [quotientData.collapsedDrift_eq_totalFineDrift]
  exact quotientData.aggregateDrift_eq_totalFineDrift_of_Phi_eq_singleton hPhi

theorem drift_transfer_to_collapsed_node
    (quotientData : ManyToOneGraphQuotient α β)
    {γ : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -γ) :
    quotientData.collapsedDrift ≤ -γ := by
  simpa [quotientData.collapsedDrift_eq_totalFineDrift] using hFine

theorem drift_transfer_to_singleton_quotient_node
    (quotientData : ManyToOneGraphQuotient α β)
    {coarseNode : β} {γ : ℝ}
    (hPhi : quotientData.Phi = {coarseNode})
    (hFine : quotientData.totalFineDrift ≤ -γ) :
    quotientData.aggregateDrift coarseNode ≤ -γ := by
  rw [quotientData.aggregateDrift_eq_totalFineDrift_of_Phi_eq_singleton hPhi]
  exact hFine

theorem drift_transfer_to_quotient_total
    (quotientData : ManyToOneGraphQuotient α β)
    {γ : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -γ) :
    (∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateDrift coarseNode) ≤ -γ := by
  simpa [quotientData.aggregateDrift_total_preserved] using hFine

theorem structuralRenormalization_arrival_eq_collapsedArrivalPressure
    (quotientData : ManyToOneGraphQuotient α β) :
    quotientData.structuralRenormalization.arrivalPressure =
      quotientData.collapsedArrivalPressure := by
  rfl

theorem structuralRenormalization_service_eq_collapsedServiceCapacity
    (quotientData : ManyToOneGraphQuotient α β) :
    quotientData.structuralRenormalization.serviceCapacity =
      quotientData.collapsedServiceCapacity := by
  rfl

theorem structuralRenormalization_restorative_eq_collapsedRestorativeShedding
    (quotientData : ManyToOneGraphQuotient α β) :
    quotientData.structuralRenormalization.restorativeShedding =
      quotientData.collapsedRestorativeShedding := by
  rfl

theorem structuralRenormalization_drift_eq_collapsedDrift
    (quotientData : ManyToOneGraphQuotient α β) :
    quotientData.structuralRenormalization.drift =
      quotientData.collapsedDrift := by
  rfl

theorem structuralRenormalization_drift_eq_totalFineDrift
    (quotientData : ManyToOneGraphQuotient α β) :
    quotientData.structuralRenormalization.drift =
      quotientData.totalFineDrift := by
  rw [quotientData.structuralRenormalization_drift_eq_collapsedDrift]
  exact quotientData.collapsedDrift_eq_totalFineDrift

theorem structuralRenormalization_drift_le_of_fine_drift_le
    (quotientData : ManyToOneGraphQuotient α β)
    {γ : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -γ) :
    quotientData.structuralRenormalization.drift ≤ -γ := by
  rw [quotientData.structuralRenormalization_drift_eq_totalFineDrift]
  exact hFine

theorem structuralRenormalization_measurableDrift
    (quotientData : ManyToOneGraphQuotient α β)
    {γ : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -γ) :
    quotientData.structuralRenormalization.MeasurableDriftWitness γ := by
  exact
    StructuralRenormalizedNode.measurableDriftWitness_of_drift_le
      quotientData.structuralRenormalization
      (quotientData.structuralRenormalization_drift_le_of_fine_drift_le hFine)

theorem structuralRenormalization_fosterLyapunov
    (quotientData : ManyToOneGraphQuotient α β)
    {γ : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -γ) :
    KernelFosterLyapunovDrift
      quotientData.structuralRenormalization.expectedLyapunov
      quotientData.structuralRenormalization.lyapunov
      quotientData.structuralRenormalization.smallSet
      γ := by
  exact
    StructuralRenormalizedNode.kernelFosterLyapunovDrift_of_drift_le
      quotientData.structuralRenormalization
      (quotientData.structuralRenormalization_drift_le_of_fine_drift_le hFine)

structure CoarseDriftCertificate (quotientData : ManyToOneGraphQuotient α β) where
  margin : β → ℝ
  aggregateDrift_le_neg_margin :
    ∀ coarseNode ∈ quotientData.Phi,
      quotientData.aggregateDrift coarseNode ≤ - margin coarseNode

def CoarseDriftCertificate.totalMargin
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData) : ℝ :=
  ∑ coarseNode ∈ quotientData.Phi, certificate.margin coarseNode

theorem CoarseDriftCertificate.quotient_total_le_neg_totalMargin
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData) :
    (∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateDrift coarseNode) ≤
      - certificate.totalMargin := by
  have hNode :
      ∑ coarseNode ∈ quotientData.Phi, quotientData.aggregateDrift coarseNode ≤
        ∑ coarseNode ∈ quotientData.Phi, (- certificate.margin coarseNode) := by
    exact Finset.sum_le_sum (by
      intro coarseNode hCoarse
      simpa using certificate.aggregateDrift_le_neg_margin coarseNode hCoarse)
  simpa [CoarseDriftCertificate.totalMargin, Finset.sum_neg_distrib] using hNode

theorem CoarseDriftCertificate.fine_total_le_neg_totalMargin
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData) :
    quotientData.totalFineDrift ≤ - certificate.totalMargin := by
  simpa [quotientData.aggregateDrift_total_preserved] using
    certificate.quotient_total_le_neg_totalMargin

theorem CoarseDriftCertificate.structuralRenormalization_drift_le_neg_totalMargin
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData) :
    quotientData.structuralRenormalization.drift ≤ - certificate.totalMargin := by
  exact
    quotientData.structuralRenormalization_drift_le_of_fine_drift_le
      (γ := certificate.totalMargin)
      certificate.fine_total_le_neg_totalMargin

theorem CoarseDriftCertificate.structuralRenormalization_measurableDrift
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData) :
    quotientData.structuralRenormalization.MeasurableDriftWitness certificate.totalMargin := by
  exact
    quotientData.structuralRenormalization_measurableDrift
      (γ := certificate.totalMargin)
      certificate.fine_total_le_neg_totalMargin

theorem CoarseDriftCertificate.structuralRenormalization_fosterLyapunov
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData) :
    KernelFosterLyapunovDrift
      quotientData.structuralRenormalization.expectedLyapunov
      quotientData.structuralRenormalization.lyapunov
      quotientData.structuralRenormalization.smallSet
      certificate.totalMargin := by
  exact
    quotientData.structuralRenormalization_fosterLyapunov
      (γ := certificate.totalMargin)
      certificate.fine_total_le_neg_totalMargin

variable {γ : Type*} [DecidableEq γ]

/--
Lift a verified quotient onto its current coarse support. This synthesizes the
next-stage coarse graph interface directly from aggregate rates rather than
requiring those rates to be restated by hand.
-/
def liftToCoarse
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    ManyToOneGraphQuotient β γ where
  liveSupport := quotientData.Phi
  quotient := coarseQuotient
  arrivalPressure := quotientData.aggregateArrivalPressure
  serviceCapacity := quotientData.aggregateServiceCapacity
  restorativeShedding := quotientData.aggregateRestorativeShedding

/--
Directly compose a fine quotient with a further coarse quotient map. This keeps
the original fine rates and support while changing only the terminal quotient.
-/
def composeQuotient
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    ManyToOneGraphQuotient α γ where
  liveSupport := quotientData.liveSupport
  quotient := fun fineNode => coarseQuotient (quotientData.quotient fineNode)
  arrivalPressure := quotientData.arrivalPressure
  serviceCapacity := quotientData.serviceCapacity
  restorativeShedding := quotientData.restorativeShedding

theorem liftToCoarse_collapsedArrivalPressure_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).collapsedArrivalPressure =
      quotientData.collapsedArrivalPressure := by
  unfold liftToCoarse collapsedArrivalPressure
  exact quotientData.aggregateArrivalPressure_total_preserved

theorem liftToCoarse_collapsedServiceCapacity_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).collapsedServiceCapacity =
      quotientData.collapsedServiceCapacity := by
  unfold liftToCoarse collapsedServiceCapacity
  exact quotientData.aggregateServiceCapacity_total_preserved

theorem liftToCoarse_collapsedRestorativeShedding_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).collapsedRestorativeShedding =
      quotientData.collapsedRestorativeShedding := by
  unfold liftToCoarse collapsedRestorativeShedding
  exact quotientData.aggregateRestorativeShedding_total_preserved

theorem liftToCoarse_totalFineDrift_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).totalFineDrift =
      quotientData.totalFineDrift := by
  unfold liftToCoarse totalFineDrift
  exact quotientData.aggregateDrift_total_preserved

theorem liftToCoarse_collapsedDrift_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).collapsedDrift =
      quotientData.collapsedDrift := by
  rw [
    (quotientData.liftToCoarse coarseQuotient).collapsedDrift_eq_totalFineDrift,
    quotientData.liftToCoarse_totalFineDrift_eq,
    quotientData.collapsedDrift_eq_totalFineDrift
  ]

theorem liftToCoarse_structuralRenormalization_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).structuralRenormalization =
      quotientData.structuralRenormalization := by
  unfold structuralRenormalization
  rw [
    quotientData.liftToCoarse_collapsedArrivalPressure_eq coarseQuotient,
    quotientData.liftToCoarse_collapsedServiceCapacity_eq coarseQuotient,
    quotientData.liftToCoarse_collapsedRestorativeShedding_eq coarseQuotient,
    quotientData.liftToCoarse_collapsedDrift_eq coarseQuotient
  ]

theorem liftToCoarse_measurableDrift
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ)
    {driftGap : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -driftGap) :
    (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.MeasurableDriftWitness
      driftGap := by
  rw [quotientData.liftToCoarse_structuralRenormalization_eq coarseQuotient]
  exact quotientData.structuralRenormalization_measurableDrift hFine

theorem liftToCoarse_fosterLyapunov
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ)
    {driftGap : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -driftGap) :
    KernelFosterLyapunovDrift
      (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.expectedLyapunov
      (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.lyapunov
      (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.smallSet
      driftGap := by
  rw [quotientData.liftToCoarse_structuralRenormalization_eq coarseQuotient]
  exact quotientData.structuralRenormalization_fosterLyapunov hFine

theorem composeQuotient_collapsedArrivalPressure_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.composeQuotient coarseQuotient).collapsedArrivalPressure =
      quotientData.collapsedArrivalPressure := by
  rfl

theorem composeQuotient_collapsedServiceCapacity_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.composeQuotient coarseQuotient).collapsedServiceCapacity =
      quotientData.collapsedServiceCapacity := by
  rfl

theorem composeQuotient_collapsedRestorativeShedding_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.composeQuotient coarseQuotient).collapsedRestorativeShedding =
      quotientData.collapsedRestorativeShedding := by
  rfl

theorem composeQuotient_totalFineDrift_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.composeQuotient coarseQuotient).totalFineDrift =
      quotientData.totalFineDrift := by
  rfl

theorem composeQuotient_collapsedDrift_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.composeQuotient coarseQuotient).collapsedDrift =
      quotientData.collapsedDrift := by
  rfl

theorem composeQuotient_structuralRenormalization_eq
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.composeQuotient coarseQuotient).structuralRenormalization =
      quotientData.structuralRenormalization := by
  rfl

theorem composeQuotient_measurableDrift
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ)
    {driftGap : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -driftGap) :
    (quotientData.composeQuotient coarseQuotient).structuralRenormalization.MeasurableDriftWitness
      driftGap := by
  rw [quotientData.composeQuotient_structuralRenormalization_eq coarseQuotient]
  exact quotientData.structuralRenormalization_measurableDrift hFine

theorem composeQuotient_fosterLyapunov
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ)
    {driftGap : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -driftGap) :
    KernelFosterLyapunovDrift
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.expectedLyapunov
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.lyapunov
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.smallSet
      driftGap := by
  rw [quotientData.composeQuotient_structuralRenormalization_eq coarseQuotient]
  exact quotientData.structuralRenormalization_fosterLyapunov hFine

theorem recursive_structuralRenormalization_eq_composed
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).structuralRenormalization =
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization := by
  rw [
    quotientData.liftToCoarse_structuralRenormalization_eq coarseQuotient,
    quotientData.composeQuotient_structuralRenormalization_eq coarseQuotient
  ]

theorem recursive_measurableDrift_eq_composed
    (quotientData : ManyToOneGraphQuotient α β)
    (coarseQuotient : β → γ)
    {driftGap : ℝ}
    (hFine : quotientData.totalFineDrift ≤ -driftGap) :
    (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.MeasurableDriftWitness
        driftGap ∧
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.MeasurableDriftWitness
        driftGap := by
  exact ⟨
    quotientData.liftToCoarse_measurableDrift coarseQuotient hFine,
    quotientData.composeQuotient_measurableDrift coarseQuotient hFine
  ⟩

theorem CoarseDriftCertificate.liftToCoarse_measurableDrift
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.MeasurableDriftWitness
      certificate.totalMargin := by
  rw [quotientData.liftToCoarse_structuralRenormalization_eq coarseQuotient]
  exact certificate.structuralRenormalization_measurableDrift

theorem CoarseDriftCertificate.composeQuotient_measurableDrift
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData)
    (coarseQuotient : β → γ) :
    (quotientData.composeQuotient coarseQuotient).structuralRenormalization.MeasurableDriftWitness
      certificate.totalMargin := by
  rw [quotientData.composeQuotient_structuralRenormalization_eq coarseQuotient]
  exact certificate.structuralRenormalization_measurableDrift

theorem CoarseDriftCertificate.liftToCoarse_fosterLyapunov
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData)
    (coarseQuotient : β → γ) :
    KernelFosterLyapunovDrift
      (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.expectedLyapunov
      (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.lyapunov
      (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.smallSet
      certificate.totalMargin := by
  rw [quotientData.liftToCoarse_structuralRenormalization_eq coarseQuotient]
  exact certificate.structuralRenormalization_fosterLyapunov

theorem CoarseDriftCertificate.composeQuotient_fosterLyapunov
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData)
    (coarseQuotient : β → γ) :
    KernelFosterLyapunovDrift
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.expectedLyapunov
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.lyapunov
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.smallSet
      certificate.totalMargin := by
  rw [quotientData.composeQuotient_structuralRenormalization_eq coarseQuotient]
  exact certificate.structuralRenormalization_fosterLyapunov

theorem CoarseDriftCertificate.recursive_measurableDrift_eq_composed
    {quotientData : ManyToOneGraphQuotient α β}
    (certificate : CoarseDriftCertificate quotientData)
    (coarseQuotient : β → γ) :
    (quotientData.liftToCoarse coarseQuotient).structuralRenormalization.MeasurableDriftWitness
        certificate.totalMargin ∧
      (quotientData.composeQuotient coarseQuotient).structuralRenormalization.MeasurableDriftWitness
        certificate.totalMargin := by
  exact ⟨
    certificate.liftToCoarse_measurableDrift coarseQuotient,
    certificate.composeQuotient_measurableDrift coarseQuotient
  ⟩

end ManyToOneGraphQuotient

def renormalizationLiveSupport : Finset (Nat × Bool) :=
  {(0, false), (0, true), (1, false), (1, true)}

def renormalizationQuotient : (Nat × Bool) → Nat := Prod.fst

def renormalizationArrivalPressure : (Nat × Bool) → ℝ
  | (0, false) => 2
  | (0, true) => 1
  | (1, false) => 1
  | (1, true) => 0
  | _ => 0

def renormalizationServiceCapacity : (Nat × Bool) → ℝ
  | (0, false) => 3
  | (0, true) => 1
  | (1, false) => 2
  | (1, true) => 1
  | _ => 0

def renormalizationRestorativeShedding : (Nat × Bool) → ℝ
  | (0, true) => 1
  | _ => 0

def renormalizationWitness : ManyToOneGraphQuotient (Nat × Bool) Nat where
  liveSupport := renormalizationLiveSupport
  quotient := renormalizationQuotient
  arrivalPressure := renormalizationArrivalPressure
  serviceCapacity := renormalizationServiceCapacity
  restorativeShedding := renormalizationRestorativeShedding

theorem renormalization_support_is_genuinely_many_to_one :
    ¬ Set.InjOn renormalizationWitness.quotient (↑renormalizationWitness.liveSupport : Set (Nat × Bool)) := by
  intro hInj
  have hEq :
      renormalizationWitness.quotient (0, false) =
        renormalizationWitness.quotient (0, true) := by
    rfl
  have hPair :=
    hInj
      (by simp [renormalizationWitness, renormalizationLiveSupport])
      (by simp [renormalizationWitness, renormalizationLiveSupport])
      hEq
  simp at hPair

theorem renormalization_total_fine_drift_closed_form :
    renormalizationWitness.totalFineDrift = -4 := by
  simp [
    ManyToOneGraphQuotient.totalFineDrift,
    renormalizationWitness,
    renormalizationLiveSupport,
    renormalizationArrivalPressure,
    renormalizationServiceCapacity,
    renormalizationRestorativeShedding
  ]
  norm_num

theorem renormalization_collapsed_drift_closed_form :
    renormalizationWitness.collapsedDrift = -4 := by
  rw [renormalizationWitness.collapsedDrift_eq_totalFineDrift]
  exact renormalization_total_fine_drift_closed_form

theorem renormalization_aggregate_drift_closed_form :
    ∑ coarseNode ∈ renormalizationWitness.Phi,
      renormalizationWitness.aggregateDrift coarseNode = -4 := by
  rw [renormalizationWitness.aggregateDrift_total_preserved]
  exact renormalization_total_fine_drift_closed_form

theorem renormalization_collapsed_margin_transfers :
    renormalizationWitness.collapsedDrift ≤ -4 := by
  exact
    ManyToOneGraphQuotient.drift_transfer_to_collapsed_node
      renormalizationWitness
      (by simpa [renormalizationWitness.collapsedDrift_eq_totalFineDrift] using
        renormalization_collapsed_drift_closed_form.le)

theorem renormalization_structural_node_drift_closed_form :
    renormalizationWitness.structuralRenormalization.drift = -4 := by
  rw [renormalizationWitness.structuralRenormalization_drift_eq_totalFineDrift]
  exact renormalization_total_fine_drift_closed_form

theorem renormalization_structural_node_measurable_drift :
    renormalizationWitness.structuralRenormalization.MeasurableDriftWitness 4 := by
  exact
    renormalizationWitness.structuralRenormalization_measurableDrift
      (by simpa [renormalizationWitness.collapsedDrift_eq_totalFineDrift] using
        renormalization_collapsed_drift_closed_form.le)

theorem renormalization_Phi_eq_pair :
    renormalizationWitness.Phi = {0, 1} := by
  ext coarseNode
  simp [
    ManyToOneGraphQuotient.Phi,
    renormalizationWitness,
    renormalizationLiveSupport,
    renormalizationQuotient
  ]

theorem renormalization_filter_zero :
    renormalizationLiveSupport.filter (fun fineNode => renormalizationQuotient fineNode = 0) =
      {(0, false), (0, true)} := by
  native_decide

theorem renormalization_filter_one :
    renormalizationLiveSupport.filter (fun fineNode => renormalizationQuotient fineNode = 1) =
      {(1, false), (1, true)} := by
  native_decide

theorem renormalization_witness_filter_zero :
    renormalizationWitness.liveSupport.filter
        (fun fineNode => renormalizationWitness.quotient fineNode = 0) =
      {(0, false), (0, true)} := by
  native_decide

theorem renormalization_witness_filter_one :
    renormalizationWitness.liveSupport.filter
        (fun fineNode => renormalizationWitness.quotient fineNode = 1) =
      {(1, false), (1, true)} := by
  native_decide

theorem renormalization_coarse_drift_zero_closed_form :
    renormalizationWitness.aggregateDrift 0 = -2 := by
  unfold ManyToOneGraphQuotient.aggregateDrift
    ManyToOneGraphQuotient.aggregateArrivalPressure
    ManyToOneGraphQuotient.aggregateServiceCapacity
    ManyToOneGraphQuotient.aggregateRestorativeShedding
    renormalizationWitness
  rw [show
      (∑ x ∈ renormalizationLiveSupport with renormalizationQuotient x = 0,
          renormalizationArrivalPressure x) =
        ∑ x ∈ renormalizationLiveSupport.filter (fun x => renormalizationQuotient x = 0),
          renormalizationArrivalPressure x by
      rfl]
  rw [show
      (∑ x ∈ renormalizationLiveSupport with renormalizationQuotient x = 0,
          renormalizationServiceCapacity x) =
        ∑ x ∈ renormalizationLiveSupport.filter (fun x => renormalizationQuotient x = 0),
          renormalizationServiceCapacity x by
      rfl]
  rw [show
      (∑ x ∈ renormalizationLiveSupport with renormalizationQuotient x = 0,
          renormalizationRestorativeShedding x) =
        ∑ x ∈ renormalizationLiveSupport.filter (fun x => renormalizationQuotient x = 0),
          renormalizationRestorativeShedding x by
      rfl]
  repeat' rw [renormalization_filter_zero]
  norm_num [
    renormalizationArrivalPressure,
    renormalizationServiceCapacity,
    renormalizationRestorativeShedding
  ]

theorem renormalization_coarse_drift_one_closed_form :
    renormalizationWitness.aggregateDrift 1 = -2 := by
  unfold ManyToOneGraphQuotient.aggregateDrift
    ManyToOneGraphQuotient.aggregateArrivalPressure
    ManyToOneGraphQuotient.aggregateServiceCapacity
    ManyToOneGraphQuotient.aggregateRestorativeShedding
    renormalizationWitness
  rw [show
      (∑ x ∈ renormalizationLiveSupport with renormalizationQuotient x = 1,
          renormalizationArrivalPressure x) =
        ∑ x ∈ renormalizationLiveSupport.filter (fun x => renormalizationQuotient x = 1),
          renormalizationArrivalPressure x by
      rfl]
  rw [show
      (∑ x ∈ renormalizationLiveSupport with renormalizationQuotient x = 1,
          renormalizationServiceCapacity x) =
        ∑ x ∈ renormalizationLiveSupport.filter (fun x => renormalizationQuotient x = 1),
          renormalizationServiceCapacity x by
      rfl]
  rw [show
      (∑ x ∈ renormalizationLiveSupport with renormalizationQuotient x = 1,
          renormalizationRestorativeShedding x) =
        ∑ x ∈ renormalizationLiveSupport.filter (fun x => renormalizationQuotient x = 1),
          renormalizationRestorativeShedding x by
      rfl]
  repeat' rw [renormalization_filter_one]
  norm_num [
    renormalizationArrivalPressure,
    renormalizationServiceCapacity,
    renormalizationRestorativeShedding
  ]

def renormalizationCoarseMargin : Nat → ℝ
  | 0 => 2
  | 1 => 2
  | _ => 0

def renormalizationCoarseDriftCertificate :
    ManyToOneGraphQuotient.CoarseDriftCertificate renormalizationWitness where
  margin := renormalizationCoarseMargin
  aggregateDrift_le_neg_margin := by
    intro coarseNode hCoarse
    have hCoarse' : coarseNode = 0 ∨ coarseNode = 1 := by
      rw [renormalization_Phi_eq_pair] at hCoarse
      simpa using hCoarse
    rcases hCoarse' with rfl | rfl
    · rw [renormalization_coarse_drift_zero_closed_form, renormalizationCoarseMargin]
    · rw [renormalization_coarse_drift_one_closed_form, renormalizationCoarseMargin]

theorem renormalization_coarse_certificate_total_margin_closed_form :
    renormalizationCoarseDriftCertificate.totalMargin = 4 := by
  rw [ManyToOneGraphQuotient.CoarseDriftCertificate.totalMargin, renormalization_Phi_eq_pair]
  simp [renormalizationCoarseDriftCertificate, renormalizationCoarseMargin]
  norm_num

theorem renormalization_fine_drift_from_coarse_certificate :
    renormalizationWitness.totalFineDrift ≤
      - renormalizationCoarseDriftCertificate.totalMargin := by
  exact
    ManyToOneGraphQuotient.CoarseDriftCertificate.fine_total_le_neg_totalMargin
      renormalizationCoarseDriftCertificate

theorem renormalization_structural_node_measurable_drift_from_coarse_certificate :
    renormalizationWitness.structuralRenormalization.MeasurableDriftWitness 4 := by
  have hMeas :
      renormalizationWitness.structuralRenormalization.MeasurableDriftWitness
        renormalizationCoarseDriftCertificate.totalMargin := by
    exact
      ManyToOneGraphQuotient.CoarseDriftCertificate.structuralRenormalization_measurableDrift
        renormalizationCoarseDriftCertificate
  simpa [renormalization_coarse_certificate_total_margin_closed_form] using hMeas

theorem renormalization_structural_node_fosterLyapunov_from_coarse_certificate :
    KernelFosterLyapunovDrift
      renormalizationWitness.structuralRenormalization.expectedLyapunov
      renormalizationWitness.structuralRenormalization.lyapunov
      renormalizationWitness.structuralRenormalization.smallSet
      4 := by
  have hDrift :
      KernelFosterLyapunovDrift
        renormalizationWitness.structuralRenormalization.expectedLyapunov
        renormalizationWitness.structuralRenormalization.lyapunov
        renormalizationWitness.structuralRenormalization.smallSet
        renormalizationCoarseDriftCertificate.totalMargin := by
    exact
      ManyToOneGraphQuotient.CoarseDriftCertificate.structuralRenormalization_fosterLyapunov
        renormalizationCoarseDriftCertificate
  simpa [renormalization_coarse_certificate_total_margin_closed_form] using hDrift

def renormalizationSingleNodeQuotient : (Nat × Bool) → Unit := fun _ => ()

def renormalizationRecursiveOuterQuotient : Nat → Unit := fun _ => ()

def renormalizationSingleNodeWitness : ManyToOneGraphQuotient (Nat × Bool) Unit where
  liveSupport := renormalizationLiveSupport
  quotient := renormalizationSingleNodeQuotient
  arrivalPressure := renormalizationArrivalPressure
  serviceCapacity := renormalizationServiceCapacity
  restorativeShedding := renormalizationRestorativeShedding

def renormalizationRecursiveWitness : ManyToOneGraphQuotient Nat Unit :=
  ManyToOneGraphQuotient.liftToCoarse
    renormalizationWitness
    renormalizationRecursiveOuterQuotient

theorem renormalization_single_node_witness_eq_composed :
    ManyToOneGraphQuotient.composeQuotient
        renormalizationWitness
        renormalizationRecursiveOuterQuotient =
      renormalizationSingleNodeWitness := by
  rfl

theorem renormalization_recursive_structural_eq_single_node :
    renormalizationRecursiveWitness.structuralRenormalization =
      renormalizationSingleNodeWitness.structuralRenormalization := by
  rw [← renormalization_single_node_witness_eq_composed]
  exact
    ManyToOneGraphQuotient.recursive_structuralRenormalization_eq_composed
      renormalizationWitness
      renormalizationRecursiveOuterQuotient

theorem renormalization_recursive_structural_drift_closed_form :
    renormalizationRecursiveWitness.structuralRenormalization.drift = -4 := by
  rw [renormalization_recursive_structural_eq_single_node]
  change renormalizationSingleNodeWitness.collapsedDrift = -4
  rw [renormalizationSingleNodeWitness.collapsedDrift_eq_totalFineDrift]
  simp [
    ManyToOneGraphQuotient.totalFineDrift,
    renormalizationSingleNodeWitness,
    renormalizationLiveSupport,
    renormalizationArrivalPressure,
    renormalizationServiceCapacity,
    renormalizationRestorativeShedding
  ]
  norm_num

theorem renormalization_recursive_measurable_drift :
    renormalizationRecursiveWitness.structuralRenormalization.MeasurableDriftWitness 4 := by
  have hFine : renormalizationWitness.totalFineDrift ≤ -4 := by
    rw [renormalization_total_fine_drift_closed_form]
  exact
    ManyToOneGraphQuotient.liftToCoarse_measurableDrift
      renormalizationWitness
      renormalizationRecursiveOuterQuotient
      hFine

theorem renormalization_recursive_measurable_drift_from_coarse_certificate :
    renormalizationRecursiveWitness.structuralRenormalization.MeasurableDriftWitness 4 := by
  have hMeas :
      renormalizationRecursiveWitness.structuralRenormalization.MeasurableDriftWitness
        renormalizationCoarseDriftCertificate.totalMargin := by
    exact
      ManyToOneGraphQuotient.CoarseDriftCertificate.liftToCoarse_measurableDrift
        renormalizationCoarseDriftCertificate
        renormalizationRecursiveOuterQuotient
  simpa [renormalization_coarse_certificate_total_margin_closed_form] using hMeas

theorem renormalization_single_node_Phi_eq_singleton :
    renormalizationSingleNodeWitness.Phi = {()} := by
  ext coarseNode
  cases coarseNode
  simp [
    ManyToOneGraphQuotient.Phi,
    renormalizationSingleNodeWitness,
    renormalizationSingleNodeQuotient,
    renormalizationLiveSupport
  ]

theorem renormalization_single_node_arrival_closed_form :
    renormalizationSingleNodeWitness.aggregateArrivalPressure () = 4 := by
  rw [
    ManyToOneGraphQuotient.aggregateArrivalPressure_eq_collapsedArrivalPressure_of_Phi_eq_singleton
      renormalizationSingleNodeWitness
      renormalization_single_node_Phi_eq_singleton
  ]
  simp [
    ManyToOneGraphQuotient.collapsedArrivalPressure,
    renormalizationSingleNodeWitness,
    renormalizationLiveSupport,
    renormalizationArrivalPressure
  ]
  norm_num

theorem renormalization_single_node_service_closed_form :
    renormalizationSingleNodeWitness.aggregateServiceCapacity () = 7 := by
  rw [
    ManyToOneGraphQuotient.aggregateServiceCapacity_eq_collapsedServiceCapacity_of_Phi_eq_singleton
      renormalizationSingleNodeWitness
      renormalization_single_node_Phi_eq_singleton
  ]
  simp [
    ManyToOneGraphQuotient.collapsedServiceCapacity,
    renormalizationSingleNodeWitness,
    renormalizationLiveSupport,
    renormalizationServiceCapacity
  ]
  norm_num

theorem renormalization_single_node_restorative_closed_form :
    renormalizationSingleNodeWitness.aggregateRestorativeShedding () = 1 := by
  rw [
    ManyToOneGraphQuotient.aggregateRestorativeShedding_eq_collapsedRestorativeShedding_of_Phi_eq_singleton
      renormalizationSingleNodeWitness
      renormalization_single_node_Phi_eq_singleton
  ]
  simp [
    ManyToOneGraphQuotient.collapsedRestorativeShedding,
    renormalizationSingleNodeWitness,
    renormalizationLiveSupport,
    renormalizationRestorativeShedding
  ]

theorem renormalization_single_node_drift_closed_form :
    renormalizationSingleNodeWitness.aggregateDrift () = -4 := by
  rw [
    ManyToOneGraphQuotient.aggregateDrift_eq_totalFineDrift_of_Phi_eq_singleton
      renormalizationSingleNodeWitness
      renormalization_single_node_Phi_eq_singleton
  ]
  simp [
    ManyToOneGraphQuotient.totalFineDrift,
    renormalizationSingleNodeWitness,
    renormalizationLiveSupport,
    renormalizationArrivalPressure,
    renormalizationServiceCapacity,
    renormalizationRestorativeShedding
  ]
  norm_num

theorem renormalization_single_node_margin_transfers :
    renormalizationSingleNodeWitness.aggregateDrift () ≤ -4 := by
  exact
    ManyToOneGraphQuotient.drift_transfer_to_singleton_quotient_node
      renormalizationSingleNodeWitness
      renormalization_single_node_Phi_eq_singleton
      (by
        simp [
          ManyToOneGraphQuotient.totalFineDrift,
          renormalizationSingleNodeWitness,
          renormalizationLiveSupport,
          renormalizationArrivalPressure,
          renormalizationServiceCapacity,
          renormalizationRestorativeShedding
        ]
        norm_num)

def appStageLiveSupport : Finset (Nat × Bool) :=
  {(0, false), (1, true), (2, false)}

def appStageQuotient : (Nat × Bool) → Nat := Prod.fst

def appStageCollapseWitness : QuotientCollapseWitness (Nat × Bool) Nat where
  liveSupport := appStageLiveSupport
  quotient := appStageQuotient
  injectiveOnLive := by
    intro a ha b hb hEq
    have ha' : a = (0, false) ∨ a = (1, true) ∨ a = (2, false) := by
      simpa [appStageLiveSupport] using ha
    have hb' : b = (0, false) ∨ b = (1, true) ∨ b = (2, false) := by
      simpa [appStageLiveSupport] using hb
    rcases ha' with rfl | ha'
    · rcases hb' with rfl | hb'
      · rfl
      · rcases hb' with rfl | rfl
        · simp [appStageQuotient] at hEq
        · simp [appStageQuotient] at hEq
    · rcases ha' with rfl | rfl
      · rcases hb' with rfl | hb'
        · simp [appStageQuotient] at hEq
        · rcases hb' with rfl | rfl
          · rfl
          · simp [appStageQuotient] at hEq
      · rcases hb' with rfl | hb'
        · simp [appStageQuotient] at hEq
        · rcases hb' with rfl | rfl
          · simp [appStageQuotient] at hEq
          · rfl

theorem app_stage_fine_contagious :
    QuotientCollapseWitness.fineContagious appStageCollapseWitness := by
  unfold QuotientCollapseWitness.fineContagious QuotientCollapseWitness.fineInitialLive
  simp [appStageCollapseWitness, appStageLiveSupport]

theorem app_stage_zero_vent_requires_repair :
    0 < QuotientCollapseWitness.coarseTotalRepairDebt appStageCollapseWitness := by
  exact QuotientCollapseWitness.zero_vent_deterministic_collapse_requires_repair appStageCollapseWitness
    app_stage_fine_contagious

theorem app_stage_schema_instantiated :
    0 < QuotientCollapseWitness.coarseTotalVented appStageCollapseWitness \/
      0 < QuotientCollapseWitness.coarseTotalRepairDebt appStageCollapseWitness := by
  exact QuotientCollapseWitness.interference_schema_instantiated appStageCollapseWitness
    app_stage_fine_contagious
    (QuotientCollapseWitness.coarseDeterministicCollapse_holds appStageCollapseWitness
      app_stage_fine_contagious)

end GraphQuotients

end ForkRaceFoldTheorems
