import Lake
open Lake DSL

package «fork_race_fold_theorems» where
  version := v!"0.1.0"

require mathlib from git
  "https://github.com/leanprover-community/mathlib4.git" @ "v4.28.0"

@[default_target]
lean_lib ForkRaceFoldTheorems where
  srcDir := "Lean"
