import ForkRaceFoldTheorems.Axioms
import ForkRaceFoldTheorems.Claims

namespace ForkRaceFoldTheorems

/--
Track Zeta: Monoidal Coherence

Proves the pentagon, triangle, and hexagon identities for the fork/race/fold
monoidal category, then bundles them into monoidal-category and
symmetric-monoidal-category theorems.  The final coherence theorem
(Mac Lane): every well-typed diagram of associators, unitors, and braidings
commutes — follows from pentagon + triangle as generators.

Objects are types, tensor is `Prod`, unit is `PUnit`, morphisms are functions.
-/

-- ─── Categorical primitives (self-contained, mirroring GnosisProofs) ──

abbrev GHom (α β : Type) := α → β

def gid : GHom α α := fun v => v

def gcomp (f : GHom α β) (g : GHom β γ) : GHom α γ :=
  fun v => g (f v)

def tensorHom (f : GHom α β) (g : GHom γ δ) : GHom (α × γ) (β × δ) :=
  fun | (l, r) => (f l, g r)

abbrev tensorUnit : Type := PUnit

-- ─── Associator ───────────────────────────────────────────────────────

def assocLR : GHom ((α × β) × γ) (α × (β × γ)) :=
  fun | ((a, b), c) => (a, (b, c))

def assocRL : GHom (α × (β × γ)) ((α × β) × γ) :=
  fun | (a, (b, c)) => ((a, b), c)

-- ─── Unitors ──────────────────────────────────────────────────────────

def leftUnitor : GHom (tensorUnit × α) α :=
  fun | (_, v) => v

def leftUnitorInv : GHom α (tensorUnit × α) :=
  fun v => (PUnit.unit, v)

def rightUnitor : GHom (α × tensorUnit) α :=
  fun | (v, _) => v

def rightUnitorInv : GHom α (α × tensorUnit) :=
  fun v => (v, PUnit.unit)

-- ─── Braiding ─────────────────────────────────────────────────────────

def braid : GHom (α × β) (β × α) :=
  fun | (l, r) => (r, l)

-- ═══════════════════════════════════════════════════════════════════════
-- THM-PENTAGON
--
-- Path 1: ((A×B)×C)×D --assocLR--> (A×B)×(C×D) --assocLR--> A×(B×(C×D))
-- Path 2: ((A×B)×C)×D --assocLR×id--> (A×(B×C))×D --assocLR--> A×((B×C)×D)
--                                                    --id×assocLR--> A×(B×(C×D))
-- ═══════════════════════════════════════════════════════════════════════

/-- Pentagon identity: the two canonical paths from `((A×B)×C)×D` to
    `A×(B×(C×D))` built from the associator are definitionally equal. -/
theorem pentagon (A B C D : Type) :
    ∀ v : ((A × B) × C) × D,
      gcomp (@assocLR (A × B) C D)
        (@assocLR A B (C × D)) v =
      gcomp (tensorHom (@assocLR A B C) (@gid D))
        (gcomp (@assocLR A (B × C) D)
          (tensorHom (@gid A) (@assocLR B C D))) v := by
  intro ⟨⟨⟨a, b⟩, c⟩, d⟩
  rfl

-- ═══════════════════════════════════════════════════════════════════════
-- THM-TRIANGLE
--
-- (A × PUnit) × B --assocLR--> A × (PUnit × B) --id×leftUnitor--> A × B
-- (A × PUnit) × B --rightUnitor×id--> A × B
-- ═══════════════════════════════════════════════════════════════════════

/-- Triangle identity: associator composed with `id ⊗ leftUnitor` equals
    `rightUnitor ⊗ id`. -/
theorem triangle (A B : Type) :
    ∀ v : (A × tensorUnit) × B,
      gcomp (@assocLR A tensorUnit B)
        (tensorHom (@gid A) (@leftUnitor B)) v =
      tensorHom (@rightUnitor A) (@gid B) v := by
  intro ⟨⟨a, u⟩, b⟩
  cases u
  rfl

-- ═══════════════════════════════════════════════════════════════════════
-- THM-HEXAGON (first hexagon axiom for symmetric monoidal categories)
--
-- Path 1: (A×B)×C --assocLR--> A×(B×C) --braid--> (B×C)×A --assocLR--> B×(C×A)
-- Path 2: (A×B)×C --braid×id--> (B×A)×C --assocLR--> B×(A×C) --id×braid--> B×(C×A)
-- ═══════════════════════════════════════════════════════════════════════

/-- Hexagon identity: two braiding paths from `(A×B)×C` to `B×(C×A)` agree. -/
theorem hexagon (A B C : Type) :
    ∀ v : (A × B) × C,
      gcomp (@assocLR A B C)
        (gcomp (@braid A (B × C))
          (@assocLR B C A)) v =
      gcomp (tensorHom (@braid A B) (@gid C))
        (gcomp (@assocLR B A C)
          (tensorHom (@gid B) (@braid A C))) v := by
  intro ⟨⟨a, b⟩, c⟩
  rfl

-- ═══════════════════════════════════════════════════════════════════════
-- Monoidal category bundle
-- ═══════════════════════════════════════════════════════════════════════

/-- A monoidal category requires:
    1. Associator natural isomorphism (assocLR / assocRL roundtrip)
    2. Left and right unitor natural isomorphisms
    3. Pentagon identity
    4. Triangle identity -/
theorem monoidal_category (A B C D : Type) :
    -- Associator roundtrips
    (∀ v : (A × B) × C, gcomp (@assocLR A B C) (@assocRL A B C) v = v) ∧
    (∀ v : A × (B × C), gcomp (@assocRL A B C) (@assocLR A B C) v = v) ∧
    -- Left unitor roundtrips
    (∀ v : tensorUnit × A, gcomp (@leftUnitor A) (@leftUnitorInv A) v = v) ∧
    (∀ v : A, gcomp (@leftUnitorInv A) (@leftUnitor A) v = v) ∧
    -- Right unitor roundtrips
    (∀ v : A × tensorUnit, gcomp (@rightUnitor A) (@rightUnitorInv A) v = v) ∧
    (∀ v : A, gcomp (@rightUnitorInv A) (@rightUnitor A) v = v) ∧
    -- Pentagon
    (∀ v : ((A × B) × C) × D,
      gcomp (@assocLR (A × B) C D) (@assocLR A B (C × D)) v =
      gcomp (tensorHom (@assocLR A B C) (@gid D))
        (gcomp (@assocLR A (B × C) D)
          (tensorHom (@gid A) (@assocLR B C D))) v) ∧
    -- Triangle
    (∀ v : (A × tensorUnit) × B,
      gcomp (@assocLR A tensorUnit B) (tensorHom (@gid A) (@leftUnitor B)) v =
      tensorHom (@rightUnitor A) (@gid B) v) := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_⟩
  · intro ⟨⟨a, b⟩, c⟩; rfl
  · intro ⟨a, b, c⟩; rfl
  · intro ⟨u, a⟩; cases u; rfl
  · intro a; rfl
  · intro ⟨a, u⟩; cases u; rfl
  · intro a; rfl
  · exact pentagon A B C D
  · exact triangle A B

-- ═══════════════════════════════════════════════════════════════════════
-- Symmetric monoidal extension
-- ═══════════════════════════════════════════════════════════════════════

/-- A symmetric monoidal category adds:
    1. Braid involution (braid ∘ braid = id)
    2. Hexagon identity
    to the monoidal category axioms. -/
theorem symmetric_monoidal (A B C : Type) :
    -- Braid involution
    (∀ v : A × B, gcomp (@braid A B) (@braid B A) v = v) ∧
    -- Hexagon
    (∀ v : (A × B) × C,
      gcomp (@assocLR A B C)
        (gcomp (@braid A (B × C)) (@assocLR B C A)) v =
      gcomp (tensorHom (@braid A B) (@gid C))
        (gcomp (@assocLR B A C)
          (tensorHom (@gid B) (@braid A C))) v) := by
  refine ⟨?_, ?_⟩
  · intro ⟨a, b⟩; rfl
  · exact hexagon A B C

-- ═══════════════════════════════════════════════════════════════════════
-- Mac Lane coherence theorem
--
-- Every well-typed diagram built from associators, unitors, and braidings
-- in a symmetric monoidal category commutes.  The pentagon and triangle
-- identities generate all coherence relations (Mac Lane 1963, §VII.2).
-- For our concrete category (Type, Prod, PUnit, fun), all these morphisms
-- are definitional equalities, so coherence is immediate.
-- ═══════════════════════════════════════════════════════════════════════

/-- Mac Lane coherence: all diagrams of associators, unitors, and braidings
    commute.  Since our tensor is `Prod`, our unit is `PUnit`, and all
    structural morphisms are definitional, every coherence equation reduces
    to `rfl` after destructuring.

    We witness this by showing pentagon + triangle + hexagon all hold,
    which by Mac Lane's theorem generate all coherence relations. -/
theorem coherence (A B C D : Type) :
    -- Pentagon generates associator coherence
    (∀ v : ((A × B) × C) × D,
      gcomp (@assocLR (A × B) C D) (@assocLR A B (C × D)) v =
      gcomp (tensorHom (@assocLR A B C) (@gid D))
        (gcomp (@assocLR A (B × C) D)
          (tensorHom (@gid A) (@assocLR B C D))) v) ∧
    -- Triangle generates unitor coherence
    (∀ v : (A × tensorUnit) × B,
      gcomp (@assocLR A tensorUnit B) (tensorHom (@gid A) (@leftUnitor B)) v =
      tensorHom (@rightUnitor A) (@gid B) v) ∧
    -- Hexagon generates braiding coherence
    (∀ v : (A × B) × C,
      gcomp (@assocLR A B C)
        (gcomp (@braid A (B × C)) (@assocLR B C A)) v =
      gcomp (tensorHom (@braid A B) (@gid C))
        (gcomp (@assocLR B A C)
          (tensorHom (@gid B) (@braid A C))) v) := by
  exact ⟨pentagon A B C D, triangle A B, hexagon A B C⟩

end ForkRaceFoldTheorems
