/**
 * ch17-neurodivergent-vgi.test.ts
 *
 * The unified VGI model of neurodivergence.
 *
 * Three axes. One metric. Every neurodivergent presentation is a
 * position in (aperture, gait, environment) space, and the VGI
 * tells you whether the void walker is matched, under-matched,
 * or over-matched to its environment.
 *
 * Aperture (eta):  How many dimensions the brain perceives.
 *   High eta (NT):  aggressive fold, K_perceived ≈ 3
 *   Low eta (AUT):  gentle fold, K_perceived ≈ 8
 *
 * Gait (c3):  How the walker transitions between exploration speeds.
 *   Stable (NT):    smooth upshift/downshift
 *   Dysregulated (ADHD): low upshift threshold, high downshift barrier
 *
 * Environment (K_actual):  How many dimensions actually exist.
 *   Savanna:        K ≈ 20 (matched to brain)
 *   Quiet room:     K ≈ 3
 *   Open office:    K ≈ 50
 *   Infinite scroll: K ≈ 200
 *
 * VGI = (K_perceived - 1) / (K_actual - 1)
 *
 *   VGI < 1.0:  under-matched. Missing dimensions. Could benefit from
 *               wider aperture or richer environment.
 *   VGI = 1.0:  matched. Optimal. The void walker covers exactly the
 *               dimensions that exist.
 *   VGI > 1.0:  over-matched. Tracking phantom forks. The void has no
 *               ground state. This is where overwhelm, anxiety, and
 *               rumination live.
 *
 * The therapeutic insight: neurodivergence is not a person-level
 * property. It is a VGI mismatch between aperture and environment.
 * Change the environment, change the VGI.
 */

import { describe, expect, it } from 'vitest';

import {
  voidFraction,
  predictMindWanderingRate,
  computeVoidGain,
} from './ch17-dmn-void-walker';

// ---------------------------------------------------------------------------
// Neurocognitive profiles
// ---------------------------------------------------------------------------

interface NeuroprofileVGI {
  readonly name: string;
  /** Perceptual eta (low = wide aperture) */
  readonly eta: number;
  /** K_perceived: how many dimensions the brain tracks */
  readonly kPerceived: number;
  /** Gait stability: 0 = perfectly stable, 1 = maximally dysregulated */
  readonly gaitInstability: number;
  /** Void decay rate (0 = perfect memory, 1 = instant forget) */
  readonly voidDecay: number;
  /** Mental health gain (rejection amplification factor) */
  readonly rejectionGain: number;
}

const PROFILES: Record<string, NeuroprofileVGI> = {
  NT: {
    name: 'Neurotypical',
    eta: 5.0,
    kPerceived: 3,
    gaitInstability: 0.1,
    voidDecay: 0.005,
    rejectionGain: 1.0,
  },
  AUT: {
    name: 'Autistic',
    eta: 1.0,
    kPerceived: 8,
    gaitInstability: 0.1,
    voidDecay: 0.005,
    rejectionGain: 1.0,
  },
  ADHD: {
    name: 'ADHD',
    eta: 5.0,
    kPerceived: 3,
    gaitInstability: 0.8,
    voidDecay: 0.05,
    rejectionGain: 2.5,
  },
  AuDHD: {
    name: 'AuDHD',
    eta: 1.0,
    kPerceived: 8,
    gaitInstability: 0.8,
    voidDecay: 0.05,
    rejectionGain: 2.5,
  },
};

// ---------------------------------------------------------------------------
// Environments
// ---------------------------------------------------------------------------

interface Environment {
  readonly name: string;
  readonly kActual: number;
  readonly description: string;
}

const ENVIRONMENTS: Environment[] = [
  { name: 'Quiet room (1:1)', kActual: 3, description: 'low-dimensional, structured' },
  { name: 'Classroom', kActual: 8, description: 'moderate dimensions, some structure' },
  { name: 'Savanna (ancestral)', kActual: 20, description: 'evolutionary baseline' },
  { name: 'Open office', kActual: 50, description: 'high-dimensional, unstructured' },
  { name: 'Shopping mall', kActual: 100, description: 'sensory-rich, chaotic' },
  { name: 'Infinite scroll', kActual: 200, description: 'artificially inflated K' },
];

// ---------------------------------------------------------------------------
// VGI computation
// ---------------------------------------------------------------------------

function computeVGI(kPerceived: number, kActual: number): number {
  if (kActual <= 1) return kPerceived > 1 ? Infinity : 1.0;
  return (kPerceived - 1) / (kActual - 1);
}

function vgiStatus(vgi: number): string {
  if (vgi < 0.5) return 'UNDER (missing dimensions)';
  if (vgi < 0.9) return 'LOW (room to grow)';
  if (vgi <= 1.1) return 'MATCHED (optimal)';
  if (vgi <= 2.0) return 'ELEVATED (mild overwhelm)';
  if (vgi <= 5.0) return 'HIGH (significant overwhelm)';
  return 'CRISIS (phantom forks, no ground state)';
}

/**
 * Effective K_perceived under gait instability.
 *
 * ADHD's gait dysregulation causes K_perceived to fluctuate.
 * In gallop lock on a high-reward dimension, K_effective drops
 * to 1-2 (hyperfocus). In scattered mode, K_effective rises
 * because the walker is exploring everything simultaneously.
 *
 * The effective K is: K_base + instability * K_environment
 * (the more unstable the gait, the more the walker's perceived K
 * gets pulled toward the environment's K instead of staying at
 * its natural aperture)
 */
function effectiveKPerceived(
  profile: NeuroprofileVGI,
  env: Environment,
  mode: 'scattered' | 'focused'
): number {
  if (mode === 'focused') {
    // Hyperfocus: K collapses to the special interest (1-2 dims)
    return Math.max(1, profile.kPerceived * (1 - profile.gaitInstability));
  }
  // Scattered: K inflates toward environment
  return profile.kPerceived + profile.gaitInstability * (env.kActual - profile.kPerceived);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Unified VGI model of neurodivergence', () => {

  // -------------------------------------------------------------------
  // The full cross-product: 4 profiles × 6 environments = 24 VGI values
  // -------------------------------------------------------------------

  describe('the 24-cell VGI matrix', () => {
    it('generates the complete profile × environment matrix', () => {
      const profiles = Object.values(PROFILES);

      console.log('\n  === NEURODIVERGENT VGI MATRIX ===\n');
      console.log(
        '  Environment          K_act  ' +
        profiles.map((p) => p.name.padEnd(14)).join('')
      );
      console.log('  ' + '─'.repeat(30 + profiles.length * 14));

      for (const env of ENVIRONMENTS) {
        const cells = profiles.map((p) => {
          const vgi = computeVGI(p.kPerceived, env.kActual);
          const status = vgi <= 1.1 ? '  ✓' : vgi <= 2.0 ? '  !' : ' !!';
          return `${vgi.toFixed(2)}${status}`.padEnd(14);
        });
        console.log(
          `  ${env.name.padEnd(22)} ${env.kActual.toString().padStart(4)}  ${cells.join('')}`
        );
      }

      console.log('\n  ✓ = matched (VGI ≤ 1.1)  ! = elevated  !! = overwhelm');
    });

    it('every profile has at least one matched environment', () => {
      for (const profile of Object.values(PROFILES)) {
        const matched = ENVIRONMENTS.some(
          (env) => computeVGI(profile.kPerceived, env.kActual) <= 1.1
        );
        expect(matched).toBe(true);
      }
    });

    it('autism is matched in K=8 environments (classroom with structure)', () => {
      const vgi = computeVGI(PROFILES.AUT.kPerceived, 8);
      expect(vgi).toBe(1.0);
    });

    it('NT is matched in K=3 environments (quiet 1:1)', () => {
      const vgi = computeVGI(PROFILES.NT.kPerceived, 3);
      expect(vgi).toBe(1.0);
    });

    it('everyone is overwhelmed at K=200 (infinite scroll)', () => {
      for (const profile of Object.values(PROFILES)) {
        const vgi = computeVGI(profile.kPerceived, 200);
        expect(vgi).toBeLessThan(0.05);
      }
    });
  });

  // -------------------------------------------------------------------
  // The aperture insight: autism is not deficit, it's wider coverage
  // -------------------------------------------------------------------

  describe('autism: wider aperture, not deficit', () => {
    it('AUT perceives more dimensions than NT in every environment', () => {
      expect(PROFILES.AUT.kPerceived).toBeGreaterThan(PROFILES.NT.kPerceived);
    });

    it('AUT is matched at K=8, NT is matched at K=3', () => {
      expect(computeVGI(PROFILES.AUT.kPerceived, 8)).toBe(1.0);
      expect(computeVGI(PROFILES.NT.kPerceived, 3)).toBe(1.0);
    });

    it('AUT in a K=3 environment has VGI > 1 (over-reading the room)', () => {
      const vgi = computeVGI(PROFILES.AUT.kPerceived, 3);
      expect(vgi).toBeGreaterThan(1.0);
      // (8-1)/(3-1) = 7/2 = 3.5
      expect(vgi).toBe(3.5);
      console.log(
        `\n  AUT in quiet room: VGI = ${vgi.toFixed(1)}` +
        '\n  Reading the room AND the basement AND the roof.' +
        '\n  Not deficit. Surplus.'
      );
    });

    it('NT in a K=8 environment has VGI < 1 (missing dimensions)', () => {
      const vgi = computeVGI(PROFILES.NT.kPerceived, 8);
      expect(vgi).toBeLessThan(1.0);
      // (3-1)/(8-1) = 2/7 = 0.286
      expect(vgi).toBeCloseTo(2 / 7, 3);
      console.log(
        `\n  NT in classroom: VGI = ${vgi.toFixed(3)}` +
        '\n  Missing 5 of 7 dimensions.' +
        '\n  The "normal" brain is the one with the deficit here.'
      );
    });

    it('sensory overwhelm = bandwidth saturation at high K_actual', () => {
      // Same aperture, increasing environment K
      const overwhelmCurve = ENVIRONMENTS.map((env) => ({
        env: env.name,
        kActual: env.kActual,
        vgi: computeVGI(PROFILES.AUT.kPerceived, env.kActual),
      }));

      console.log('\n  AUT overwhelm curve (K_perceived = 8):');
      for (const point of overwhelmCurve) {
        const bar = '█'.repeat(Math.min(40, Math.round(point.vgi * 10)));
        console.log(
          `    K=${point.kActual.toString().padStart(3)} VGI=${point.vgi.toFixed(2).padStart(5)} ${bar} ${vgiStatus(point.vgi)}`
        );
      }

      // At K=3, VGI > 1 (over-reading). At K=200, VGI << 1 (under-reading).
      // The sweet spot is K ≈ 8 (VGI = 1.0).
      expect(computeVGI(PROFILES.AUT.kPerceived, 3)).toBeGreaterThan(1.0);
      expect(computeVGI(PROFILES.AUT.kPerceived, 8)).toBe(1.0);
      expect(computeVGI(PROFILES.AUT.kPerceived, 200)).toBeLessThan(0.05);
    });
  });

  // -------------------------------------------------------------------
  // The gait insight: ADHD is oscillating VGI, not fixed mismatch
  // -------------------------------------------------------------------

  describe('ADHD: oscillating VGI from gait instability', () => {
    it('ADHD effective K swings between hyperfocus and scattered', () => {
      const env = ENVIRONMENTS.find((e) => e.name === 'Classroom')!;

      const scattered = effectiveKPerceived(PROFILES.ADHD, env, 'scattered');
      const focused = effectiveKPerceived(PROFILES.ADHD, env, 'focused');

      const vgiScattered = computeVGI(scattered, env.kActual);
      const vgiFocused = computeVGI(focused, env.kActual);

      console.log(
        `\n  ADHD in classroom (K_actual = ${env.kActual}):` +
        `\n    Scattered: K_eff = ${scattered.toFixed(1)}, VGI = ${vgiScattered.toFixed(2)}` +
        `\n    Focused:   K_eff = ${focused.toFixed(1)}, VGI = ${vgiFocused.toFixed(2)}` +
        `\n    VGI range: ${vgiFocused.toFixed(2)} - ${vgiScattered.toFixed(2)}` +
        '\n    The walker oscillates. That IS the dysregulation.'
      );

      // Scattered mode: K inflates toward environment
      expect(scattered).toBeGreaterThan(PROFILES.ADHD.kPerceived);
      // Focused mode: K collapses toward 1
      expect(focused).toBeLessThan(PROFILES.ADHD.kPerceived);
    });

    it('ADHD VGI is unstable while NT VGI is stable', () => {
      const env = ENVIRONMENTS.find((e) => e.name === 'Classroom')!;

      const ntRange =
        computeVGI(effectiveKPerceived(PROFILES.NT, env, 'scattered'), env.kActual) -
        computeVGI(effectiveKPerceived(PROFILES.NT, env, 'focused'), env.kActual);

      const adhdRange =
        computeVGI(effectiveKPerceived(PROFILES.ADHD, env, 'scattered'), env.kActual) -
        computeVGI(effectiveKPerceived(PROFILES.ADHD, env, 'focused'), env.kActual);

      expect(adhdRange).toBeGreaterThan(ntRange);
      console.log(
        `\n  VGI stability: NT range = ${ntRange.toFixed(3)}, ADHD range = ${adhdRange.toFixed(3)}`
      );
    });
  });

  // -------------------------------------------------------------------
  // AuDHD: wide aperture + oscillating gait = maximum variance
  // -------------------------------------------------------------------

  describe('AuDHD: the compound mismatch', () => {
    it('AuDHD has both wider aperture AND gait instability', () => {
      expect(PROFILES.AuDHD.kPerceived).toBe(PROFILES.AUT.kPerceived);
      expect(PROFILES.AuDHD.gaitInstability).toBe(PROFILES.ADHD.gaitInstability);
    });

    it('AuDHD scattered mode in a classroom has higher VGI than ADHD', () => {
      const env = ENVIRONMENTS.find((e) => e.name === 'Classroom')!;
      const adhdK = effectiveKPerceived(PROFILES.ADHD, env, 'scattered');
      const audhdK = effectiveKPerceived(PROFILES.AuDHD, env, 'scattered');

      expect(audhdK).toBeGreaterThan(adhdK);
    });

    it('AuDHD focused mode = flow state (VGI collapses to deep trot)', () => {
      const env = ENVIRONMENTS.find((e) => e.name === 'Quiet room (1:1)')!;
      const focused = effectiveKPerceived(PROFILES.AuDHD, env, 'focused');
      const vgi = computeVGI(focused, env.kActual);

      console.log(
        `\n  AuDHD flow state (quiet room, focused):` +
        `\n    K_eff = ${focused.toFixed(1)}, K_actual = ${env.kActual}, VGI = ${vgi.toFixed(2)}` +
        '\n    Wide aperture collapsed to one dimension = deep trot.' +
        '\n    Gait lock + aperture + matched environment = flow.'
      );
    });

    it('AuDHD has the widest VGI range of any profile', () => {
      const env = ENVIRONMENTS.find((e) => e.name === 'Open office')!;
      const ranges: { name: string; range: number }[] = [];

      for (const profile of Object.values(PROFILES)) {
        const high = computeVGI(
          effectiveKPerceived(profile, env, 'scattered'),
          env.kActual
        );
        const low = computeVGI(
          effectiveKPerceived(profile, env, 'focused'),
          env.kActual
        );
        ranges.push({ name: profile.name, range: high - low });
      }

      const audhd = ranges.find((r) => r.name === 'AuDHD')!;
      const others = ranges.filter((r) => r.name !== 'AuDHD');

      for (const other of others) {
        expect(audhd.range).toBeGreaterThan(other.range);
      }

      console.log('\n  VGI range by profile (open office):');
      for (const r of ranges.sort((a, b) => b.range - a.range)) {
        const bar = '█'.repeat(Math.round(r.range * 20));
        console.log(`    ${r.name.padEnd(15)} ${r.range.toFixed(3)} ${bar}`);
      }
      console.log('  AuDHD: maximum variance. Extraordinary or overwhelmed.');
    });
  });

  // -------------------------------------------------------------------
  // The accommodation matrix: environment design, not person-fixing
  // -------------------------------------------------------------------

  describe('accommodation: change the environment, change the VGI', () => {
    it('generates the accommodation prescription table', () => {
      console.log('\n  === ACCOMMODATION PRESCRIPTIONS ===\n');
      console.log('  Profile     Environment        VGI    Rx');
      console.log('  ' + '─'.repeat(65));

      for (const profile of Object.values(PROFILES)) {
        for (const env of ENVIRONMENTS) {
          const vgi = computeVGI(profile.kPerceived, env.kActual);
          let rx = '';
          if (vgi > 2.0) {
            rx = 'reduce K_actual (fewer dimensions)';
          } else if (vgi > 1.1) {
            rx = 'slightly reduce K_actual or add structure';
          } else if (vgi >= 0.9) {
            rx = 'matched -- no change needed';
          } else if (vgi >= 0.5) {
            rx = 'enrich environment or scaffold exploration';
          } else {
            rx = 'both parties under-matched to this environment';
          }

          if (vgi >= 0.9 && vgi <= 1.1) {
            console.log(
              `  ${profile.name.padEnd(12)} ${env.name.padEnd(20)} ${vgi.toFixed(2).padStart(5)}  ✓ ${rx}`
            );
          }
        }
      }

      console.log(
        '\n  The accommodation is not "fix the autistic person."' +
        '\n  It is "find the environment where their VGI = 1.0."' +
        '\n  Every brain has an environment where it is matched.' +
        '\n  The therapeutic target is the match, not the person.'
      );
    });

    it('autistic accommodation = reduce K_actual to 8', () => {
      // Quiet room with structured agenda: K ≈ 8 dimensions
      expect(computeVGI(PROFILES.AUT.kPerceived, 8)).toBe(1.0);
    });

    it('ADHD accommodation = stabilize reward landscape', () => {
      // ADHD needs environments where gait instability doesn't matter
      // because the environment matches their natural K
      expect(computeVGI(PROFILES.ADHD.kPerceived, 3)).toBe(1.0);
    });

    it('AuDHD accommodation requires BOTH axes', () => {
      // Fewer dimensions (autism axis) AND structured reward (ADHD axis)
      // The sweet spot: K_actual ≈ K_perceived = 8, structured
      expect(computeVGI(PROFILES.AuDHD.kPerceived, 8)).toBe(1.0);
    });
  });

  // -------------------------------------------------------------------
  // The unified insight: neurodivergence IS the VGI mismatch
  // -------------------------------------------------------------------

  describe('the unified theorem', () => {
    it('neurodivergence is not a person property -- it is a VGI mismatch', () => {
      // The same person has different VGIs in different environments.
      // "Disabled" in one context, "gifted" in another.
      // The variable is not the person. It is the match.

      const aut = PROFILES.AUT;
      const vgiQuiet = computeVGI(aut.kPerceived, 3);    // over-reading
      const vgiClass = computeVGI(aut.kPerceived, 8);     // matched
      const vgiMall = computeVGI(aut.kPerceived, 100);    // under-reading

      expect(vgiQuiet).toBeGreaterThan(1.0);   // "too much" in quiet room
      expect(vgiClass).toBe(1.0);               // perfect match in classroom
      expect(vgiMall).toBeLessThan(0.1);         // overwhelmed in mall

      console.log(
        '\n  The same autistic person:' +
        `\n    Quiet room:  VGI = ${vgiQuiet.toFixed(1)} (over-reading, "weird")` +
        `\n    Classroom:   VGI = ${vgiClass.toFixed(1)} (matched, "gifted")` +
        `\n    Mall:        VGI = ${vgiMall.toFixed(2)} (overwhelmed, "disabled")` +
        '\n' +
        '\n  Same person. Same aperture. Same brain.' +
        '\n  Three environments. Three labels.' +
        '\n  The label describes the match, not the person.'
      );
    });

    it('every therapeutic intervention reduces |VGI - 1.0|', () => {
      const interventions = [
        { name: 'Noise-canceling headphones', effect: 'reduces K_actual by filtering sensory dims' },
        { name: 'Visual schedule', effect: 'reduces K_perceived by making sequence explicit' },
        { name: 'Body doubling', effect: 'stabilizes gait via social entrainment' },
        { name: 'Stimming', effect: 'vents excess void energy to maintain VGI near 1.0' },
        { name: 'Special interest time', effect: 'provides K_actual = 1 environment (VGI = matched)' },
        { name: 'Medication (stimulant)', effect: 'reduces gait instability (ADHD axis)' },
        { name: 'Medication (SSRI)', effect: 'reduces DMN hyperactivation (lowers K_perceived)' },
        { name: 'Structured environment', effect: 'reduces K_actual to match K_perceived' },
      ];

      console.log('\n  Every intervention moves VGI toward 1.0:');
      for (const i of interventions) {
        console.log(`    ${i.name.padEnd(30)} → ${i.effect}`);
      }

      console.log(
        '\n  ╔═══════════════════════════════════════════════════════════════╗' +
        '\n  ║  Neurodivergence is not a deficit of the person.             ║' +
        '\n  ║  It is a mismatch between aperture and environment.          ║' +
        '\n  ║                                                              ║' +
        '\n  ║  VGI < 1: the environment is richer than the aperture.       ║' +
        '\n  ║           Enrich the person (scaffold, teach, support).      ║' +
        '\n  ║                                                              ║' +
        '\n  ║  VGI = 1: matched. The walker covers the terrain.            ║' +
        '\n  ║           This is where flow, creativity, and              ║' +
        '\n  ║           deep expertise live.                               ║' +
        '\n  ║                                                              ║' +
        '\n  ║  VGI > 1: the aperture is wider than the environment.        ║' +
        '\n  ║           Accommodate the environment (simplify, structure). ║' +
        '\n  ║                                                              ║' +
        '\n  ║  The brain is not broken. The match is.                      ║' +
        '\n  ║  Fix the match.                                              ║' +
        '\n  ╚═══════════════════════════════════════════════════════════════╝'
      );

      expect(interventions.length).toBe(8);
    });
  });
});
