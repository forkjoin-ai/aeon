# Chapter 29: Buleyean Reinforcement Learning

*Training language models from what is NOT*

## 29.1 The Inversion

Every reinforcement learning system since Sutton and Barto (1998) has trained on what went right. Reward models score good behavior. RLHF (Christiano et al., 2017) maximizes a learned reward function via PPO. DPO (Rafailov et al., 2023) sidesteps the reward model but still requires *preference pairs* -- a chosen response and a rejected response, yoked together. Remove either half and the method collapses.

Buleyean RL inverts the signal. The training target is derived entirely from what the model should *not* do. The chosen column is discarded. There is no reward model. There are no preference pairs. There is only a void boundary -- the accumulated record of rejected outputs -- and the complement distribution that emerges from it.

The theoretical foundation was established in §15.17 (Buleyean probability), §15.1 (void boundary as sufficient statistic), and §15.18 (subsumption of Solomonoff induction). This chapter reports the first empirical validation: open-source language models fine-tuned with rejection data alone, using the complement distribution as the training target.

## 29.2 Why Rejection Is More Informative Than Selection

Consider a fork with $N$ parallel paths. Selection picks one path and discards $N - 1$. The selection event carries $\log_2 N$ bits. But the rejection event -- the $N - 1$ discarded paths -- carries $(N-1) \cdot \log_2 N / N$ bits per rejected path, and there are $N - 1$ of them.

The failure information ratio (§15.17, `failure_strictly_more_informative`):

$$R_{\text{failure}} = N - 1$$

For a vocabulary of 49,152 tokens (SmolLM2), each rejection provides 49,151 bits of information about what the model should not produce. Each selection provides 1 bit about what it should. Standard training uses the 1-bit signal. Buleyean RL uses the 49,151-bit signal.

This is not a clever reframing. It is a measurable information-theoretic asymmetry. The void dominates the signal by a factor of $N - 1$ at every step.

## 29.3 The Loss Function

### 29.3.1 Buleyean KL Loss

The primary loss is the KL divergence from the model's output distribution to the Buleyean complement distribution:

$$L_{\text{Buleyean}} = D_{\text{KL}}(P_{\text{Bule}} \| P_{\text{model}}) = \sum_{i=1}^{V} P_{\text{Bule}}(i) \cdot \log \frac{P_{\text{Bule}}(i)}{P_{\text{model}}(i)}$$

where the target distribution is:

$$P_{\text{Bule}}(i) = \frac{T - \min(v_i, T) + 1}{\sum_{j=1}^{V} (T - \min(v_j, T) + 1)}$$

$v_i$ is the rejection count for token $i$ at this position, $T$ is the total rejection rounds, and $V$ is the vocabulary size.

**Forward KL, not reverse KL.** Forward KL ($P_{\text{target}} \| P_{\text{model}}$) is mode-covering: the model must assign probability everywhere the target does. This preserves the sliver -- the structural guarantee that every token retains positive probability. Reverse KL would be mode-seeking and could collapse the distribution to a single token, violating Axiom 1 (positivity).

**Why not cross-entropy?** Standard cross-entropy trains against a one-hot label (the "correct" next token). But Buleyean RL has no correct next token. It has a *distribution* derived from rejection. The correct loss is KL divergence against a full distribution, not cross-entropy against a point.

### 29.3.2 Rejection Contrast Loss

An auxiliary loss that directly penalizes probability assigned to heavily-rejected tokens:

$$L_{\text{contrast}} = -\sum_{i=1}^{V} \frac{v_i}{T} \cdot \log P_{\text{model}}(i)$$

This is the negative of cross-entropy weighted by rejection rate. Tokens rejected many times ($v_i / T \approx 1$) contribute large penalties when the model assigns them probability. Tokens never rejected ($v_i = 0$) contribute nothing.

### 29.3.3 Combined Loss

$$L = \alpha \cdot L_{\text{Buleyean}} + (1 - \alpha) \cdot L_{\text{contrast}}$$

Default $\alpha = 0.7$. The Buleyean KL term provides the directional signal (move toward the complement distribution). The contrast term provides the sharp signal (move *away from* specific rejected tokens).

## 29.4 Data Pipeline

### 29.4.1 The Key Move: Discard the Chosen Column

Existing DPO datasets contain preference pairs: `(prompt, chosen, rejected)`. Buleyean RL discards `chosen` entirely and keeps only `(prompt, rejected)`. This is the philosophical crux: you do not need to know what is right. You only need to know what is wrong.

For 63,506 UltraFeedback preference pairs, the conversion discards 63,506 chosen responses and retains 63,506 rejected responses. The resulting rejection JSONL has the format:

```json
{
  "prompt": "How do you handle conflict?",
  "rejected_responses": ["Just ignore it.", "Fight back harder.", "..."],
  "rejection_counts": [45, 12, 3],
  "total_rounds": 60
}
```

### 29.4.2 Per-Token Void Boundary Construction

Each rejected response is tokenized. At each sequence position, the rejection count for the token at that position is incremented in a sparse void boundary. For $K$ rejected responses with average length $L$, this produces a sparse tensor of shape `(L, max_rejections_per_position)` rather than a dense tensor of shape `(L, vocab_size)`.

The sparse representation is critical for large-vocabulary models. For Qwen2.5 (151,936 tokens), a dense rejection tensor per sample would require 512 * 151,936 * 4 bytes = 295 MB. The sparse representation stores only non-zero entries: typically fewer than 256 per position, requiring 512 * 256 * 8 bytes = 1 MB. A 295x memory reduction.

### 29.4.3 Data Sources

Three strategies for sourcing rejection data:

1. **DPO conversion**: Take any DPO/preference dataset. Discard chosen. Keep rejected. Instant, zero-cost, leverages existing data.

2. **Rejection mining**: Generate $N$ completions per prompt from a base model. A judge (human, model, or heuristic) marks rejections. The rejected completions become the void boundary.

3. **Iterative void walking**: Train model $M_k$. Generate from $M_k$. Judge rejects bad outputs. Train $M_{k+1}$ on the cumulative void boundary $V_0 \cup \cdots \cup V_k$. Repeat. This is the c0-c3 metacognitive loop (§15.4) applied to training.

## 29.5 Implementation

### 29.5.1 Architecture

The library is structured in two layers:

**TypeScript core** (`@a0n/buleyean-rl`): Type-safe rejection record handling, per-token void boundary construction, complement distribution computation, inverse Bule metric, and DPO-to-Buleyean data conversion. Imports `VoidBoundary` from `@a0n/gnosis` and `buleyeanDistribution` from `@a0n/maybe` -- the same primitives used by the void walking engine (§15), negotiation equilibrium (ch25), and cancer genomics (Aunt Sandy). The training pipeline shares the same mathematical substrate as the theory.

**Python training** (`buleyean_rl`): `BuleyeanKLLoss` and `RejectionContrastLoss` as PyTorch modules. `BuleyeanTrainer` extending HuggingFace Trainer with custom `compute_loss` and `_prepare_inputs` overrides. `SparseRejectionDataset` for memory-efficient rejection tensor handling. Cloud Build pipeline for parallel training across 12 base models.

### 29.5.2 The Sparse-Dense Bridge

The `_prepare_inputs` override in `BuleyeanTrainer` handles the key challenge: HuggingFace Trainer strips dictionary keys not in the model's `forward()` signature. Buleyean-specific keys (`total_rounds`, `rejected_token_ids`, `rejected_token_counts`, `num_rejected_tokens`) are stashed before Trainer processes the inputs and restored after device placement.

The `sparse_to_dense_rejections` function converts the sparse representation to dense at batch time via `scatter_add_`. This materializes the full `(batch, seq_len, vocab_size)` tensor only when needed for loss computation, not during data loading or collation.

### 29.5.3 Training Configuration

- **Base models**: SmolLM2-360M-Instruct, Qwen2.5-0.5B-Instruct, TinyLlama-1.1B-Chat
- **Fine-tuning**: LoRA (rank 16, $\alpha = 32$, dropout 0.05, target modules: q/k/v/o/gate/up/down projections)
- **Trainable parameters**: 2.3% of total (8.7M of 370M for SmolLM2)
- **Training data**: 63,506 UltraFeedback rejection records (~115 MB)
- **Optimization**: AdamW, cosine schedule, warmup 100 steps, $\text{lr} = 2 \times 10^{-4}$
- **Buleyean hyperparameters**: $\alpha = 0.7$, temperature $= 1.0$

## 29.6 Preliminary Results

Training on SmolLM2-360M-Instruct, 63,506 rejection records, CPU (E2_HIGHCPU_32):

| Step | Total Loss | Buleyean KL | Contrast Loss | Epoch |
|------|-----------|-------------|---------------|-------|
| 10 | 11.13 | 8.932 | 16.27 | 0.003 |
| 20 | 9.38 | 7.212 | 14.44 | 0.006 |
| 30 | 6.54 | 4.248 | 11.90 | 0.008 |
| 40 | 4.83 | 2.568 | 10.11 | 0.011 |
| 50 | 3.77 | 1.576 | 8.88 | 0.014 |

**Buleyean KL: 8.93 to 1.58 in 50 steps (5.7x reduction).** The model is converging toward the complement distribution. The gradient norm stabilizes from 7.1 to 0.3, indicating smooth optimization.

The contrast loss decreases more slowly (16.27 to 8.88, 1.8x), consistent with the expected behavior: the KL term provides the bulk of the learning signal (how to redistribute probability) while the contrast term provides the fine-grained signal (which specific tokens to suppress).

## 29.7 The Headline Claim

**Rejection sufficiency**: you do not need chosen examples. The complement distribution derived from rejection counts alone is a sufficient training target for language model fine-tuning.

This claim rests on three theoretical pillars:

1. **Positivity** (Axiom 1, `buleyean_positivity`): every token retains positive probability. The model cannot collapse to a degenerate distribution. Exploration is guaranteed structurally, not by an entropy bonus that must be tuned.

2. **Monotonicity** (Axiom 3, `buleyean_monotone_nonrejected`): recording a rejection can only decrease the rejected token's weight and increase all others'. The gradient always points away from rejected tokens. There is no ambiguity in the learning signal.

3. **Convergence** (`void_walkers_converge`): two models trained on the same rejection data converge to the same distribution. The training target is deterministic and observer-independent. No prior is needed.

DPO requires both sides of the preference pair because its log-ratio loss is undefined without a chosen response. RLHF requires a reward model to score arbitrary outputs. Buleyean RL requires neither. The void boundary is self-sufficient.

## 29.8 Connections to the Framework

Buleyean RL is the tenth domain in the fork/race/fold stack (§14). The training loop is fork/race/fold:

- **Fork**: Generate $N$ completions per prompt (create parallel paths, $\beta_1 = N - 1$)
- **Race**: Judge evaluates all completions simultaneously
- **Fold**: Rejection data merges into the void boundary ($\beta_1 \to 0$)
- **Vent**: Rejected completions dissipate as Landauer heat

The loss function is the first law of fork/race/fold applied to gradient descent:

$$H_{\text{fork}} = I_{\text{fold}} + H_{\text{vent}}$$

The input entropy ($H_{\text{fork}}$) is the rejection data. The useful information ($I_{\text{fold}}$) is the complement distribution. The waste heat ($H_{\text{vent}}$) is the contrast loss -- the residual probability still assigned to rejected tokens.

The connection to attention (§23, Resonance 6) is direct: attention is race. $QK^T$ computes pairwise similarity (racing all key-query pairs). Softmax is vent (suppressing losing pairs). $V$ projection is fold (committing to the weighted combination). Buleyean RL trains the model to produce attention patterns whose race/vent/fold structure matches the complement distribution of the rejection data. It trains the model's race to avoid the void.

## 29.9 Open Questions

1. **Alpha sweep**: does $\alpha = 0.7$ dominate, or is the optimal $\alpha$ data-dependent?
2. **Temperature**: the sliver (+1) guarantees positivity regardless of temperature. Does temperature matter for training dynamics?
3. **Scale**: does Buleyean RL work better or worse on larger models (1.7B, 3B, 7B)?
4. **Iterative gain**: how many void walking iterations before the inverse Bule plateaus?
5. **Cross-architecture**: does the complement distribution transfer across architectures (train rejections on SmolLM2, apply to Qwen)?
6. **Negative transfer**: can a void boundary from one domain (code) hurt performance in another domain (empathy)?
7. **Formal bridge**: can the Lean4 monotonicity proof be connected to the PyTorch gradient direction to prove that the optimizer never moves *toward* rejected tokens?

## 29.10 Falsifiable Predictions

1. Buleyean RL (rejections only) matches or exceeds DPO (chosen + rejected) on held-out evaluation. Falsification: DPO win-rate exceeds Buleyean by >5pp on 1,000+ prompts.

2. Bule entropy decreases monotonically during training. Falsification: entropy increases for >100 consecutive steps.

3. Each void walking iteration improves over the previous for at least 3 iterations. Falsification: entropy increases between consecutive iterations within the first 5.

4. The sliver produces higher output diversity than a zero-floor variant. Falsification: zero-floor achieves higher distinct-4 on 1,000+ generations.

5. Per-rejection information gain exceeds per-selection gain by $\geq N/2$. Falsification: measured ratio falls below $N/4$ in the first 100 steps.

## 29.11 Companion Artifacts

- **Library**: `github.com/forkjoin-ai/buleyean-rl` (MPL-2.0)
- **Training data**: 63,506 UltraFeedback rejection records
- **Cloud Build**: CPU and GPU configs with parallel fan-out for 12 base models
- **Evaluation**: `evaluate.py` (Bule entropy, rejection avoidance, perplexity, side-by-side comparison)
- **Void walking**: `void_walk.py` (iterative c0-c3 loop with cumulative void boundary)
- **Hyperparameter sweeps**: `launch-sweep.sh` (parallel Cloud Build jobs for alpha/temperature/rank grid)
- **Test prompts**: 50 diverse prompts (emotion, reasoning, instruction, safety, creative)
- **Lean4 proofs**: `BuleyeanProbability.lean` (positivity, normalization, monotonicity -- 0 sorry)
- **TLA+ models**: `BuleyeanEvidence.tla` (five-phase evidence protocol with safety invariants)
