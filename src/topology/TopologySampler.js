/**
 * TopologySampler — Runtime sampling of topological deficit
 *
 * Instruments a live system by recording fork/race/fold/vent events
 * and periodically computing the topological deficit. Produces a
 * time-series of Betti numbers and deficit measurements.
 *
 * Usage:
 *   const sampler = new TopologySampler({ intrinsicBeta1: 7 });
 *   sampler.fork('request-1', ['path-a', 'path-b', 'path-c']);
 *   sampler.race('request-1', 'path-a');  // path-a won
 *   sampler.vent('request-1', 'path-b');
 *   sampler.vent('request-1', 'path-c');
 *   sampler.fold('request-1');
 *   const report = sampler.report();
 *
 * Zero dependencies. Works everywhere.
 */
// ============================================================================
// Implementation
// ============================================================================
export class TopologySampler {
    config;
    activeForks = new Map();
    samples = [];
    totalForks = 0;
    totalFolds = 0;
    totalVents = 0;
    totalRaces = 0;
    constructor(config) {
        this.config = {
            maxSamples: 1000,
            ...config,
        };
    }
    /**
     * Record a fork event: one computation splits into N parallel paths.
     */
    fork(id, paths) {
        this.activeForks.set(id, {
            id,
            paths: new Set(paths),
            startTime: Date.now(),
        });
        this.totalForks++;
        this.recordSample();
    }
    /**
     * Record a race result: one path won.
     */
    race(id, winnerPath) {
        const fork = this.activeForks.get(id);
        if (fork) {
            fork.raceWinner = winnerPath;
        }
        this.totalRaces++;
        this.recordSample();
    }
    /**
     * Record a vent: a path was released (didn't win, errored, timed out).
     */
    vent(id, path) {
        const fork = this.activeForks.get(id);
        if (fork) {
            fork.paths.delete(path);
        }
        this.totalVents++;
        this.recordSample();
    }
    /**
     * Record a fold: computation merged to a single result.
     */
    fold(id) {
        this.activeForks.delete(id);
        this.totalFolds++;
        this.recordSample();
    }
    /**
     * Take a snapshot without recording an event (for periodic sampling).
     */
    sample() {
        return this.recordSample();
    }
    /**
     * Get the current instantaneous deficit.
     */
    currentDeficit() {
        const beta1 = this.currentBeta1();
        return this.config.intrinsicBeta1 - beta1;
    }
    /**
     * Get the current instantaneous β₁.
     */
    currentBeta1() {
        let beta1 = 0;
        for (const fork of this.activeForks.values()) {
            beta1 += Math.max(0, fork.paths.size - 1);
        }
        return beta1;
    }
    /**
     * Generate the aggregate report.
     */
    report() {
        const samples = this.samples;
        const n = samples.length;
        if (n === 0) {
            return {
                intrinsicBeta1: this.config.intrinsicBeta1,
                sampleCount: 0,
                meanBeta1: 0,
                peakBeta1: 0,
                meanDeficit: this.config.intrinsicBeta1,
                meanUtilization: 0,
                peakUtilization: 0,
                totals: { forks: 0, folds: 0, vents: 0, races: 0 },
                ventRatio: 0,
                efficiency: 0,
                assessment: 'No samples collected',
                samples: [],
            };
        }
        // Time-weighted averages
        let sumBeta1 = 0;
        let sumDeficit = 0;
        let sumUtilization = 0;
        let peakBeta1 = 0;
        let peakUtilization = 0;
        for (let i = 0; i < n; i++) {
            const s = samples[i];
            const weight = i < n - 1 ? samples[i + 1].timestamp - s.timestamp : 1;
            const w = Math.max(weight, 1); // avoid zero-weight for same-ms samples
            sumBeta1 += s.beta1 * w;
            sumDeficit += s.deficit * w;
            sumUtilization += s.utilization * w;
            if (s.beta1 > peakBeta1)
                peakBeta1 = s.beta1;
            if (s.utilization > peakUtilization)
                peakUtilization = s.utilization;
        }
        const totalWeight = n > 1
            ? samples[n - 1].timestamp - samples[0].timestamp + 1
            : 1;
        const meanBeta1 = sumBeta1 / totalWeight;
        const meanDeficit = sumDeficit / totalWeight;
        const meanUtilization = sumUtilization / totalWeight;
        const totalEvents = this.totalRaces + this.totalVents;
        const ventRatio = totalEvents > 0 ? this.totalVents / totalEvents : 0;
        const efficiency = totalEvents > 0 ? this.totalRaces / totalEvents : 0;
        let assessment;
        if (meanUtilization >= 0.95) {
            assessment = `Topology-matched: mean utilization ${(meanUtilization * 100).toFixed(1)}%, mean Δβ = ${meanDeficit.toFixed(1)}`;
        }
        else if (meanUtilization >= 0.7) {
            assessment = `Near-matched: mean utilization ${(meanUtilization * 100).toFixed(1)}%, mean Δβ = ${meanDeficit.toFixed(1)}. Peak β₁ = ${peakBeta1} shows the system CAN reach higher parallelism`;
        }
        else if (meanUtilization >= 0.3) {
            assessment = `Underutilized: mean utilization ${(meanUtilization * 100).toFixed(1)}%, mean Δβ = ${meanDeficit.toFixed(1)}. The system is forcing a β₁* = ${this.config.intrinsicBeta1} problem through a β₁ ≈ ${meanBeta1.toFixed(1)} pipe`;
        }
        else {
            assessment = `Sequential bottleneck: mean utilization ${(meanUtilization * 100).toFixed(1)}%, mean Δβ = ${meanDeficit.toFixed(1)}. Almost all natural parallelism is wasted`;
        }
        return {
            intrinsicBeta1: this.config.intrinsicBeta1,
            sampleCount: n,
            meanBeta1,
            peakBeta1,
            meanDeficit,
            meanUtilization,
            peakUtilization,
            totals: {
                forks: this.totalForks,
                folds: this.totalFolds,
                vents: this.totalVents,
                races: this.totalRaces,
            },
            ventRatio,
            efficiency,
            assessment,
            samples: [...samples],
        };
    }
    /**
     * Reset all state.
     */
    reset() {
        this.activeForks.clear();
        this.samples.length = 0;
        this.totalForks = 0;
        this.totalFolds = 0;
        this.totalVents = 0;
        this.totalRaces = 0;
    }
    // ──────────────────────────────────────────────────────────────────────────
    // Internal
    // ──────────────────────────────────────────────────────────────────────────
    recordSample() {
        let activeParallelPaths = 0;
        let beta1 = 0;
        for (const fork of this.activeForks.values()) {
            activeParallelPaths += fork.paths.size;
            beta1 += Math.max(0, fork.paths.size - 1);
        }
        const intrinsic = this.config.intrinsicBeta1;
        const deficit = intrinsic - beta1;
        const utilization = intrinsic === 0 ? 1.0 : Math.min(1.0, beta1 / intrinsic);
        const sample = {
            timestamp: Date.now(),
            activeForks: this.activeForks.size,
            activeParallelPaths,
            beta1,
            deficit,
            utilization,
            totalForks: this.totalForks,
            totalFolds: this.totalFolds,
            totalVents: this.totalVents,
            totalRaces: this.totalRaces,
        };
        this.samples.push(sample);
        // Ring buffer
        if (this.samples.length > this.config.maxSamples) {
            this.samples.shift();
        }
        return sample;
    }
}
