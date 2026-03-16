# Chapter 17 External Replication

- Label: `ch17-external-replication-v1`
- Root command: `cd open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests && bun run test:ch17-external-replication`
- Total duration ms: `146119`
- Approx runtime: `146.119 s`
- Slowest step: `Run Chapter 17 reproduction surface` (`59081 ms`)
- Manifest stable: `yes`
- All hashes match: `yes`
- Overall result: `pass`

## Steps

| Step | Result | Duration ms | Command |
| --- | --- | ---: | --- |
| Install workspace dependencies | `ok` | 27223 | `bun install --frozen-lockfile` |
| Build Gnosis | `ok` | 3080 | `bun run build` |
| Test Gnosis fold training | `ok` | 358 | `bun run test:fold-training` |
| Test Gnosis negative controls | `ok` | 151 | `bun run test:negative-controls` |
| Test Gnosis near-control sweep | `ok` | 3188 | `bun run test:near-control-sweep` |
| Test Gnosis regime sweep | `ok` | 1644 | `bun run test:regime-sweep` |
| Test Gnosis adversarial controls | `ok` | 253 | `bun run test:adversarial-controls` |
| Test Gnosis mini-MoE routing | `ok` | 3159 | `bun run test:mini-moe-routing` |
| Test Gnosis MoA transformer evidence | `ok` | 6126 | `bun run test:gnosis-moa-transformer-evidence` |
| Export formal witness catalog | `ok` | 3930 | `bun run test:formal:witnesses` |
| Export formal adaptive witness catalog | `ok` | 35037 | `bun run test:formal:adaptive-witnesses` |
| Verify Gnosis theorem workspace | `ok` | 2856 | `bun run test:formal:gnosis` |
| Run Chapter 17 reproduction surface | `ok` | 59081 | `bun run test:ch17-reproduction-surface` |
| Refresh replication manifest | `ok` | 33 | `bun run test:ch17-replication-pack` |

## Hash Checks

| Path | Matches | SHA-256 |
| --- | --- | --- |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/ch17-arxiv-manuscript.md` | `yes` | `26dcf1dad6f09e86e8308ea06924e4c1050adc59b4142da73bec77ff1edd76b2` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/README.md` | `yes` | `031b559cef069241c59df30e8c403e4565785dae82a55d067a172d93b6bf31c9` |
| `.github/workflows/ch17-evidence.yml` | `yes` | `737235df866defea29f4440f1cd5bcd6a065c776b51846472090ae21b653019f` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/quantum-recombination-ablation.json` | `yes` | `6920d51512b943fc9a5e1aa1292dcce92ef1a30f83be89392f929e2e8b336181` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/toy-attention-fold-ablation.json` | `yes` | `589310d63767500cc0cde8d707da02889173f9943b220c886d8ae40ab92ae8d3` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-fold-training-benchmark.json` | `yes` | `b63ba10a3805b1f2cad3d632983a3b12124a48bc2ce9765abb7d259bc353fb29` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-negative-controls.json` | `yes` | `1462b8d8588b534b4eac6fa655684a8aee903402f377f0f8aa6b1eaeef423071` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-near-control-sweep.json` | `yes` | `8ddb8a42708867c0cab816e29cc9f3a1487abe8b6cd6721c3a83324ddcfe171e` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-fold-boundary-regime-sweep.json` | `yes` | `9a65c3d14dcfa47381b2e8a395c2e7a3a89342d0ea88d3ba481884eb164b40ae` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-adversarial-controls-benchmark.json` | `yes` | `1331f43bc78e2e20b2d2cc34b83342f81e1a780b69e4a2f6ab0f5946db68a227` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-moe-routing-benchmark.json` | `yes` | `81887e82d84566e6792443a8dcda8c6d18e5c21ed396c15439750108502ba42e` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/gnosis-moa-transformer-evidence-benchmark.json` | `yes` | `d121f9f43d40823596ee1d3a87226e58afaee289db6d8f1b9de5df8dccea7e9c` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/formal-witness-catalog.json` | `yes` | `bed334cb6a13a0d27a9831f93b45a3d97299eee9d744bf4c9f0c5808fe093c2f` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/formal-adaptive-witness-catalog.json` | `yes` | `472dc476a483d9c5874fd4d7c428e819934726486d01c25ad6aed6a52e28349a` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/adaptive-supremum-witness.json` | `yes` | `99f474b8e51b06b2dda0334bf290198dd338c895f9fdaa491d41b70b6f514d49` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/adaptive-supremum-family-sweep.json` | `yes` | `d39d0c1e2199a12c84fc23a3c9a9742943f4a5958cbd569adb17300f2e80e961` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/sleep-debt-bounded-witness.json` | `yes` | `46b46a5b2a798df4a7109ea78785f6fb39b7c71c27887c0f9ca8d8ff0897bd53` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/sleep-debt-schedule-threshold-witness.json` | `yes` | `5189585fbb7ef29164d545e69b0a0bb709f2df32505f52e1fe2fefbac71b31ab` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate1-wallclock-figure.svg` | `yes` | `a40d28f819dd2462beb6df9ef71f84623fc5499d85299500235b28a170220b63` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate2-protocol-corpus-figure.svg` | `yes` | `9638c1fef5af41ac261a2b4af2b3d8d6c55574e6cc44151e541c27a42518e704` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate3-compression-corpus-figure.svg` | `yes` | `16f4e241c428be1e7e96b1efdbd071a3edd4121565f25ddba99d120cb1cf8e48` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate4-rqr-holdout-figure.svg` | `yes` | `9b61524aac933b3ca0defd6d9f11b1dac0c9220fb4c494357b32ac86b20432e4` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-gate5-bio-effect-size-figure.svg` | `yes` | `350c74fbd9162d7d5133adf96b0b87da251925e7d5fb858e6d8df3f7c6bfa438` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-inverted-scaling-reynolds-figure.svg` | `yes` | `624144e98f4f7e15ad92b89c5ae96486332672d0413060f8298216040c2eb24d` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-correspondence-boundary-figure.svg` | `yes` | `360d4b9a0db0d9a6da13874703e0007f1412a984d90b248b679b42bfe1d4a679` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-boundary-expansion-figure.svg` | `yes` | `030f732ce53d1598c69b9228fd57145c1ad672f15892df68d44dd37a88ce67f2` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-moa-topology-figure.svg` | `yes` | `d9033c38a8095627efda0778ea66fad777f308df54534822ee06ac35cef07b54` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-moa-whip-curvature-figure.svg` | `yes` | `e509b9a6d770ce29f3a8c11db8ac162057102d85249a479be2a64f51bd2e7fe0` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/artifacts/ch17-moa-transformer-figure.svg` | `yes` | `666c8c6f756ffce018e772857db57f3b6a00a54ac48826eb350ad7317219f658` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-replication-pack.ts` | `yes` | `6f4a7adaa41f29430d08851aab7410fc63abe51502cc6b153734a45513030e58` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate1-wallclock-figure.ts` | `yes` | `75e564d4428a0e14dce5802041d9de61d42bdb5c3f5c63f269c8ea1755c91705` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate2-protocol-corpus-figure.ts` | `yes` | `e01efaab280da2538f178616e1651bafedc6586ccc7e30c821cd97eeba49e780` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate3-compression-corpus-figure.ts` | `yes` | `01539f7d52da32903ea1f03cab0fce0fa278fc44a38c020d361605b7b7957e61` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate4-rqr-holdout-figure.ts` | `yes` | `7fa9def59f1ca2fedcce690ebe33fa5ef2a5c696270fc3c29f1423bb6ba8b514` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-gate5-bio-effect-size-figure.ts` | `yes` | `1b171b270a75d414ea3ae96913f5f228cd04386e30066b0d14d5e9859b88c4ea` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-inverted-scaling-reynolds-figure.ts` | `yes` | `0135cd5970361bc99a74646d84506b2009d70a2a7daf14eda332c21bab5e1fee` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-negative-controls-benchmark.ts` | `yes` | `db7d2326aece58a6ddb0444d6551d02e64eb1e88a57a705cefdc48a34ea62fe8` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-near-control-sweep-benchmark.ts` | `yes` | `5dc3d08d061694a544d197c3a6e309f73105c5bb3052f2820571704268a759d0` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-regime-sweep-benchmark.ts` | `yes` | `bcc288289201aba15c407610c72da75337557752134a0167d620b0f4858e40e6` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-adversarial-controls-benchmark.ts` | `yes` | `019884b3ccf6a92e0daddec7fd2c5561bdf9feeee32cd42a3601b2f369902fac` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/gnosis-moa-transformer-evidence-benchmark.ts` | `yes` | `53f7820db5f78b2570844a1fd8cb2f9ca553436683dfd5aa12e5a9b1273cf4e8` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/formal-witness-catalog.ts` | `yes` | `d323f121a5d082d8afc2c2193bea1ab5ff7283d52b8dc82b0fc821f075522b02` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/formal-adaptive-witness-catalog.ts` | `yes` | `7131487d0e13d446cc8fd74875c3fcab64f7049852b837b76132543d9293cc45` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/adaptive-supremum-witness.ts` | `yes` | `9f109f175040fca9eebb8495c4074e7d0d7050509b81b8985d5902ba41cab239` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/adaptive-supremum-family-sweep.ts` | `yes` | `e5d04297716175f59321fca1ec9fa60c30bb3ab27180f3865a90ef31032bbd07` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/sleep-debt-bounded-witness.ts` | `yes` | `304e812f4fb9648c07bcc5078d61202e3df4881e0f108d486bd8c77d981c59a6` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/sleep-debt-schedule-threshold-witness.ts` | `yes` | `7b354ca7670b94f6c93c2cb71f416b0033028e2d4f64857d48163785404097b7` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-boundary-expansion-figure.ts` | `yes` | `ff2e2671e2ad1cbc6b327b18dfca5cee52f5f08e929c0d798bef14dc4c3a932f` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-moa-topology-figure.ts` | `yes` | `ffba9267b833a329981ddbdcf8da08e3a3d939756394b5f8de91aa5a26c57bd3` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-moa-whip-curvature-figure.ts` | `yes` | `07e71ba5e3267d73ecf0dd230d713cb057788cde6b8d2d054e878d4e2b44d77c` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-moa-transformer-figure.ts` | `yes` | `cebeb2a7fac4458a6b216b4114970f719b3139853259fdd29132315e4f63cb29` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/scripts/ch17-external-replication.ts` | `yes` | `7bb8fb22fce5b3754a0021a356baec0416a81a240d1bc936d45e59dc81ebf690` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/Claims.lean` | `yes` | `6c426f5736691e81f4d199321d7d86b04240f45b9391cfe447c06763b441f3b1` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/Witnesses.lean` | `yes` | `3a10680a28eaab8ae9cba391848341bb1c167c41d9267a25ba65e26e9637f7d1` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/AdaptiveWitnesses.lean` | `yes` | `6eafe2bb1078c82152b3c5010832eb20ba45de8522050c59a2eb586ad63668aa` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/THEOREM_LEDGER.md` | `yes` | `34e68aa7879df0a77692717eda9ffb5e3f99b85c98b898d9fbdbe9ba9c3c9480` |
| `open-source/gnosis/GnosisProofs.lean` | `yes` | `26449307d4054b231df16b0347b4cd2f8243653aa0cdc0c2beba7630453cbe43` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/SleepDebt.tla` | `yes` | `e99b5ea2e86101aa515b081686c02b79bf08b6c54f2748c5673732a97f177088` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/SleepDebtScheduleThreshold.tla` | `yes` | `ac8a4a88565fafabe5480fcb4a26e8a0f7c7048943c576799b853c96cb65ee78` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebt.lean` | `yes` | `10e47394008e685ab791418b22ffea542188a6d2ddca0afb26e7231136506afb` |
| `open-source/aeon/docs/ebooks/145-log-rolling-pipelined-prefill/companion-tests/formal/lean/Lean/ForkRaceFoldTheorems/SleepDebtSchedule.lean` | `yes` | `bcb9db064bdf32d84dcd6b49b29c9aad65fdbbdaa76a16b88b0e751354f7d74a` |
| `open-source/gnosis/examples/benchmarks/fold-training.test.gg` | `yes` | `cd0734e4dc96534ed442a0a38456af68005aeb72c40f853438eda8d21d93e43b` |
| `open-source/gnosis/examples/benchmarks/moe-routing.test.gg` | `yes` | `282621a787b783cfde5dceaba5cad909de0824ac9f5989b51a50a13e88671a2d` |
| `open-source/gnosis/examples/benchmarks/moa-transformer.test.gg` | `yes` | `afbf38a2956103adf958d9dc231ee164777713a303db2b0475e843c2fad4a13e` |
| `open-source/gnosis/examples/benchmarks/moa-transformer-moa.gg` | `yes` | `8509bfd80a9f4358f90eb7fcd341b741e21774b1835bf59410f276ab43b41940` |

Interpretation: this report is the outside-rerun summary for the checked Chapter 17 evidence bundle only. It executes the Gnosis build/benchmarks, the shared Gnosis theorem workspace, and the Chapter 17 artifact/witness/manuscript reproduction surface, does not rebuild the TeX/PDF layer, and then independently recomputes the replication-pack hashes to verify that the checked-in evidence bundle still matches the files on disk.

