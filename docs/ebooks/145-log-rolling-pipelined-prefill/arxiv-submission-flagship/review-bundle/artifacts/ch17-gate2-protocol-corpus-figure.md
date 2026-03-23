# Chapter 17 Gate 2 Protocol-Corpus Figure

- Label: `ch17-gate2-protocol-corpus-figure-v1`
- Source: `gate2-protocol-corpus-v1`
- Corpus: `144` sites, `12371` resources, median `73` resources/site
- Primary cells passed: `6/6`
- Framing gain range: `72.252%` to `72.252%`
- Completion median gain range: `23.47 ms` to `192 ms`
- Completion p95 gain range: `23.61 ms` to `254.5 ms`
- Minimum primary-cell CI lows: `72.19%`, `20.24 ms`, `19.99 ms`

## Cells

| Cell | Environment | Primary | Framing Median Gain % (95% CI) | Completion Median Gain ms (95% CI) | Completion p95 Gain ms (95% CI) |
|---|---|---|---:|---:|---:|
| rtt4-bw120-loss0 | RTT 4 ms • BW 120 Mbps • loss 0% | no | 72.252% (72.195% to 72.334%) | 23.47 (19.32 to 26.07) | 23.61 (19.53 to 26) |
| rtt12-bw80-loss0 | RTT 12 ms • BW 80 Mbps • loss 0% | yes | 72.252% (72.195% to 72.334%) | 23.62 (20.24 to 26.46) | 23.79 (19.99 to 25.98) |
| rtt24-bw40-loss0.2pct | RTT 24 ms • BW 40 Mbps • loss 0.2% | yes | 72.252% (72.19% to 72.331%) | 25.07 (21.37 to 27.34) | 24.79 (21.56 to 28.01) |
| rtt35-bw28-loss0.5pct | RTT 35 ms • BW 28 Mbps • loss 0.5% | yes | 72.252% (72.195% to 72.335%) | 28.24 (25.46 to 30.63) | 29.12 (25.91 to 31.36) |
| rtt48-bw18-loss1pct | RTT 48 ms • BW 18 Mbps • loss 1% | yes | 72.252% (72.195% to 72.334%) | 37.88 (34.33 to 42.56) | 40.79 (36.44 to 47.39) |
| rtt75-bw10-loss1.5pct | RTT 75 ms • BW 10 Mbps • loss 1.5% | yes | 72.252% (72.195% to 72.334%) | 60.36 (54.83 to 66.97) | 71.13 (63.88 to 78.49) |
| rtt110-bw7-loss2pct | RTT 110 ms • BW 7 Mbps • loss 2% | yes | 72.252% (72.195% to 72.335%) | 92.39 (83.38 to 104.4) | 110.5 (98.22 to 126) |
| rtt150-bw4-loss3pct | RTT 150 ms • BW 4 Mbps • loss 3% | no | 72.252% (72.192% to 72.334%) | 192 (172.4 to 231) | 254.5 (215 to 277.3) |

Interpretation: the figure separates the nearly invariant framing advantage from the latency gains that widen as impairment increases, making the protocol story legible without collapsing the corpus matrix into one scalar.
