# Chapter 17 Sleep-Debt Calibration Sources

- Parent README: [README.md](./README.md)
- Sleep-debt homology note: [ch17-sleep-debt-homology-note.md](./ch17-sleep-debt-homology-note.md)
- State-space bridge: [ch17-sleep-debt-state-space-bridge.md](./ch17-sleep-debt-state-space-bridge.md)
- Closure todo: [ch17-closure-todo.md](./ch17-closure-todo.md)
- Gap checklist: [ch17-gap-closure-checklist.md](./ch17-gap-closure-checklist.md)

This note collects the external data commons and calibration papers that can upgrade the current bounded `THM-SLEEP-DEBT` witness into a biologically calibrated evidence package. It is intentionally narrower than a literature review. The goal is to identify the smallest citable source stack that can support a real calibration bridge.

## Verified Source Stack

| Role | Source | What It Contributes | Immediate Use | Boundary |
| --- | --- | --- | --- | --- |
| Sleep data commons | [NSRR repository](https://sleepdata.org/) plus Zhang et al., 2018, [JAMIA](https://academic.oup.com/jamia/article-abstract/25/10/1351/5026200), [PubMed](https://pubmed.ncbi.nlm.nih.gov/29860441/), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6188513/) | Large shared sleep cohorts, PSG/EDF data, cohort metadata, and an explicit data-commons architecture for sleep research | Use as the primary source for analysis-ready PSG, sleep staging, and cohort metadata when building a biological calibration layer | Strong for polysomnography and metadata, not by itself a fatigue-model calibration paper |
| Objective fatigue calibration | McCauley et al., 2013, [Sleep](https://academic.oup.com/sleep/article/36/12/1987/2558971), [PubMed](https://pubmed.ncbi.nlm.nih.gov/24293775/), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3825450/) | Biomathematical calibration/validation framework for sleep-loss effects on waking neurobehavioral performance using PVT datasets | Use as the main bridge from abstract debt/capacity dynamics to PVT-based performance observables | Focused on waking performance under sleep loss, not full PSG signal ingestion |
| Recent adenosinergic and sleep-inertia extension | McCauley et al., 2024, [J Theor Biol](https://doi.org/10.1016/j.jtbi.2024.111851), [PubMed](https://pubmed.ncbi.nlm.nih.gov/38782198/), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11179995/) | Extends a biomathematical fatigue model to sleep inertia, ties the model to an adenosinergic framework, and calibrates/validates against PVT and KSS outcomes | Use as the strongest currently verified source for mapping the bounded recovery witness toward sleep-inertia observables and an adenosine-linked interpretation | The recent verified paper here is McCauley et al. 2024, not the user-supplied Rusterholz attribution |
| Open physiological signal corpus and tooling | Goldberger et al., 2000, [PubMed](https://pubmed.ncbi.nlm.nih.gov/10851218/), [PhysioNet](https://physionet.org/), plus [Sleep-EDF](https://physionet.org/content/sleep-edf/) and [Sleep-EDF Expanded](https://physionet.org/content/sleep-edfx/) | Public physiological time-series archive, open tooling, and open PSG/EDF sleep corpora that can serve as smoke-test or portability surfaces | Use for open EDF parsing, staging/toolchain tests, and public PSG sanity checks while higher-friction cohort access is being arranged | I verified open PSG corpora on PhysioNet, but not a public sleep-restriction-plus-PVT dataset there |

## Provisional Variable Mapping

The table below is the current best disciplined bridge from the bounded abstract variables in `SleepDebt.tla` / `SleepDebt.lean` to external observables.

| Abstract Variable | Candidate Observable | Source Family | Why It Fits | Boundary |
| --- | --- | --- | --- | --- |
| `wakePressure` | elapsed wake time, prior sleep/wake history, circadian phase | McCauley 2013, McCauley 2024 | These papers explicitly model fatigue as a dynamic function of sleep/wake history and circadian modulation | Still a model-side proxy, not a direct biochemical measurement |
| `serviceCapacity` | PVT lapses, PVT response speed, neurobehavioral effectiveness | McCauley 2013, McCauley 2024 | This is the clearest objective performance target for next-cycle capacity loss | Capacity here is behavioral throughput, not a direct neural resource count |
| `subjectiveBurden` | KSS sleepiness | McCauley 2024 | Provides a subjective output surface parallel to PVT | KSS behaves differently from PVT in some restriction regimes and should not replace objective capacity measures |
| `intrusionCount` | lapse bursts, microsleep-like events, immediate post-awakening impairment | McCauley 2024 plus future targeted datasets | Closest operational analog to intrusion-style local venting in the bounded witness | A direct microsleep annotation layer is still missing from the current companion package |
| `ventedWaste` | sleep opportunity, total sleep time, recovery interval | NSRR, PSG cohorts, McCauley calibration studies | Best current operational proxy for how much recovery opportunity the system received | This is not a direct glymphatic or adenosine-clearance measurement |
| `repairDebt` | residual next-day deficit relative to baseline after partial recovery | McCauley 2013, McCauley 2024 | Matches the bounded theorem story: incomplete recovery carries forward degraded performance | Still an inferred latent variable rather than a directly measured biomarker |

For the literature-side state equations these observables are formalized further in [ch17-sleep-debt-state-space-bridge.md](./ch17-sleep-debt-state-space-bridge.md).

## What These Sources Actually Close

- They close the data-discovery gap for PSG and sleep metadata.
- They close the calibration-framework gap for mapping abstract recovery dynamics onto PVT and KSS outcomes.
- They provide a recent verified paper that explicitly extends fatigue modeling into sleep inertia with an adenosinergic interpretation.
- They provide an open EDF/PSG portability corpus for toolchain and parser validation.

## What Still Remains Open

- None of these sources, by themselves, prove that adenosine is literally the same object as `repairDebt` or `ventedWaste`.
- The current verified PhysioNet surfaces are strong for PSG/EDF access, but I did not verify an open PhysioNet dataset that already bundles sustained sleep restriction with PVT in the exact form needed for the full calibration bridge.
- NSRR is the strongest path for cohort-scale biological calibration, but some datasets still require approvals and data-use steps rather than immediate anonymous download.
- The companion package still needs a concrete external dataset selection and a predeclared calibration/validation protocol before the manuscript can make more than the current bounded claim.

## Recommended Acquisition Order

1. Use NSRR as the primary cohort-discovery and PSG/metadata source.
2. Use McCauley 2013 as the core calibration template for objective capacity loss via PVT.
3. Use McCauley 2024 as the recent sleep-inertia and adenosinergic-extension bridge, especially for PVT/KSS dual-output calibration.
4. Use PhysioNet Sleep-EDF as the open public smoke-test corpus for EDF parsing, sleep-stage handling, and portability checks while the higher-value cohort data path is assembled.

## Immediate Next Deliverable

The next honest artifact is not broader prose. It is a predeclared calibration protocol that names:

- one primary cohort source,
- one objective capacity metric,
- one subjective auxiliary metric,
- one residual-debt definition,
- one intrusion proxy,
- and one train/validation split policy.

That protocol can then be attached to the existing bounded `SleepDebt` theorem family instead of floating beside it.
