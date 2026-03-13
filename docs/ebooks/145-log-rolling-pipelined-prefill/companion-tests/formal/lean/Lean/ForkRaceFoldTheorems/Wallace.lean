import Mathlib

namespace ForkRaceFoldTheorems

def frontierArea3 (left middle right : Nat) : Nat := left + middle + right

def peakFrontier3 (left middle right : Nat) : Nat := max left (max middle right)

def envelopeArea3 (left middle right : Nat) : Nat := 3 * peakFrontier3 left middle right

def wallaceNumerator3 (left middle right : Nat) : Nat :=
  envelopeArea3 left middle right - frontierArea3 left middle right

def wallaceDenominator3 (left middle right : Nat) : Nat :=
  envelopeArea3 left middle right

theorem frontierArea3_le_envelopeArea3 (left middle right : Nat) :
    frontierArea3 left middle right <= envelopeArea3 left middle right := by
  unfold frontierArea3 envelopeArea3 peakFrontier3
  have hLeft : left <= max left (max middle right) := Nat.le_max_left _ _
  have hMiddleInner : middle <= max middle right := Nat.le_max_left _ _
  have hMiddle : middle <= max left (max middle right) := by
    exact Nat.le_trans hMiddleInner (Nat.le_max_right left (max middle right))
  have hRightInner : right <= max middle right := Nat.le_max_right _ _
  have hRight : right <= max left (max middle right) := by
    exact Nat.le_trans hRightInner (Nat.le_max_right left (max middle right))
  omega

theorem wallace_bounds3 (left middle right : Nat) :
    wallaceNumerator3 left middle right <= wallaceDenominator3 left middle right := by
  unfold wallaceNumerator3 wallaceDenominator3
  exact Nat.sub_le _ _

theorem wallace_complement3 (left middle right : Nat) :
    frontierArea3 left middle right + wallaceNumerator3 left middle right =
      wallaceDenominator3 left middle right := by
  have hAreaLeEnvelope := frontierArea3_le_envelopeArea3 left middle right
  unfold wallaceNumerator3 wallaceDenominator3
  omega

theorem wallace_zero_iff_full3 (left middle right : Nat) :
    wallaceNumerator3 left middle right = 0 ↔
      frontierArea3 left middle right = wallaceDenominator3 left middle right := by
  have hAreaLeEnvelope := frontierArea3_le_envelopeArea3 left middle right
  unfold wallaceNumerator3 wallaceDenominator3
  omega

def diamondFrontierArea (branchWidth : Nat) : Nat := frontierArea3 1 branchWidth 1

def diamondWallaceNumerator (branchWidth : Nat) : Nat := wallaceNumerator3 1 branchWidth 1

def diamondWallaceDenominator (branchWidth : Nat) : Nat := wallaceDenominator3 1 branchWidth 1

theorem diamond_peak {branchWidth : Nat} (hBranchWidth : 0 < branchWidth) :
    peakFrontier3 1 branchWidth 1 = branchWidth := by
  unfold peakFrontier3
  rw [Nat.max_eq_left (Nat.succ_le_of_lt hBranchWidth)]
  exact Nat.max_eq_right (Nat.succ_le_of_lt hBranchWidth)

theorem diamond_wallace_closed_form {branchWidth : Nat}
    (hBranchWidth : 0 < branchWidth) :
    diamondFrontierArea branchWidth = branchWidth + 2 /\
      diamondWallaceNumerator branchWidth = 2 * (branchWidth - 1) /\
      diamondWallaceDenominator branchWidth = 3 * branchWidth := by
  have hPeak := diamond_peak hBranchWidth
  constructor
  · unfold diamondFrontierArea frontierArea3
    omega
  constructor
  · unfold diamondWallaceNumerator wallaceNumerator3 envelopeArea3 frontierArea3
    rw [hPeak]
    omega
  · unfold diamondWallaceDenominator wallaceDenominator3 envelopeArea3
    rw [hPeak]

theorem diamond_wallace_zero_iff_unit {branchWidth : Nat}
    (hBranchWidth : 0 < branchWidth) :
    diamondWallaceNumerator branchWidth = 0 ↔ branchWidth = 1 := by
  have hPeak := diamond_peak hBranchWidth
  unfold diamondWallaceNumerator wallaceNumerator3 envelopeArea3 frontierArea3
  rw [hPeak]
  omega

end ForkRaceFoldTheorems
