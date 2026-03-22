# Figures for arXiv Submission

The following figures are referenced in the manuscript and should be placed in
this directory before final submission. All figures should be in PDF or
high-resolution PNG format (300 dpi minimum).

## Required Figures

### 1. Loss Curves from Buleyean RL Training
- **Filename**: `buleyean-rl-loss-curves.pdf`
- **Description**: Training loss curves showing convergence of the Buleyean
  reinforcement learning objective across episodes. Should include the void
  boundary entropy descent alongside the standard policy loss, demonstrating
  that topological deficit decreases monotonically during training.
- **Source section**: ch29 (Buleyean Reinforcement Learning)

### 2. Comparison Table: DPO vs RLHF vs Buleyean RL
- **Filename**: `alignment-method-comparison.pdf`
- **Description**: Side-by-side comparison table rendered as a figure showing
  DPO, RLHF, and Buleyean RL across key dimensions: sample efficiency,
  topological deficit at convergence, Landauer heat budget, preference
  stability, and void boundary coverage. Include both numeric values and
  qualitative grades (A/B/C).
- **Source section**: ch29 (Buleyean Reinforcement Learning), Table 29.1

### 3. Optimality Gap Convergence Plot
- **Filename**: `optimality-gap-convergence.pdf`
- **Description**: Plot of the optimality gap (Betti deficit) over
  fold iterations across the nine instantiation domains. Each domain should
  appear as a separate curve, showing convergence toward zero deficit. Log
  scale on the y-axis is recommended to show the geometric convergence rate
  proved in the Daisy Chain theorems.
- **Source section**: ch17 sections 6-15 (nine domain instantiations)

### 4. Cross-Architecture Training Results
- **Filename**: `cross-architecture-results.pdf`
- **Description**: Bar chart or grouped comparison showing Buleyean RL
  training results across different model architectures (transformer,
  Mamba/SSM, mixture-of-experts). Key metrics: final void coverage percentage,
  tokens-to-convergence, and alignment score delta versus the DPO baseline.
  Error bars from multiple seeds required.
- **Source section**: ch29 (Buleyean Reinforcement Learning)

## Figure Guidelines

- Use vector formats (PDF, EPS) where possible for clean scaling.
- Raster figures (PNG) must be at least 300 dpi.
- Maximum width: 6.5 inches (single column) or 3.25 inches (double column).
- All text in figures should be legible at the printed size.
- Use colorblind-safe palettes (avoid red-green distinctions).
- Each figure must have a self-contained caption in main.tex.
