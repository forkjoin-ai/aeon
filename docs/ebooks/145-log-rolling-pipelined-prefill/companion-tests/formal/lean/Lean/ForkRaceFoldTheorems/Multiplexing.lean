import Mathlib

namespace ForkRaceFoldTheorems

def multiplexedCapacity (sequentialCapacity recoveredOverlap : Nat) : Nat :=
  sequentialCapacity - recoveredOverlap

def sequentialWallaceNumerator (busyWork sequentialCapacity : Nat) : Nat :=
  sequentialCapacity - busyWork

def multiplexedWallaceNumerator
    (busyWork sequentialCapacity recoveredOverlap : Nat) : Nat :=
  multiplexedCapacity sequentialCapacity recoveredOverlap - busyWork

theorem multiplexed_capacity_ge_busy
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    busyWork <= multiplexedCapacity sequentialCapacity recoveredOverlap := by
  unfold multiplexedCapacity
  omega

theorem multiplexing_wallace_numerator_monotone
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap <=
      sequentialWallaceNumerator busyWork sequentialCapacity := by
  unfold multiplexedWallaceNumerator multiplexedCapacity sequentialWallaceNumerator
  omega

theorem multiplexing_wallace_numerator_drop_equals_overlap
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    sequentialWallaceNumerator busyWork sequentialCapacity -
        multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap =
      recoveredOverlap := by
  unfold multiplexedWallaceNumerator multiplexedCapacity sequentialWallaceNumerator
  omega

theorem multiplexing_fill_monotone
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    busyWork * multiplexedCapacity sequentialCapacity recoveredOverlap <=
      busyWork * sequentialCapacity := by
  unfold multiplexedCapacity
  omega

theorem multiplexing_wallace_ratio_monotone
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork) :
    multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap * sequentialCapacity <=
      sequentialWallaceNumerator busyWork sequentialCapacity *
        multiplexedCapacity sequentialCapacity recoveredOverlap := by
  unfold multiplexedWallaceNumerator multiplexedCapacity sequentialWallaceNumerator
  omega

theorem multiplexing_wallace_ratio_strict
    {busyWork sequentialCapacity recoveredOverlap : Nat}
    (hBusyPositive : 0 < busyWork)
    (hBusyFits : busyWork <= sequentialCapacity)
    (hRecoveredLegal : recoveredOverlap <= sequentialCapacity - busyWork)
    (hRecoveredPositive : 0 < recoveredOverlap) :
    multiplexedWallaceNumerator busyWork sequentialCapacity recoveredOverlap * sequentialCapacity <
      sequentialWallaceNumerator busyWork sequentialCapacity *
        multiplexedCapacity sequentialCapacity recoveredOverlap := by
  unfold multiplexedWallaceNumerator multiplexedCapacity sequentialWallaceNumerator
  omega

end ForkRaceFoldTheorems
