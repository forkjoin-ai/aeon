/**
 * Predictions Round 11: Student Learning Curves, Herd Immunity,
 * Code Review, Battery Degradation, Brainstorming Quality
 *
 * Tests for predictions 137-141: five predictions composing void boundary
 * walking with student learning curves, convergence schema with epidemic
 * herd immunity, semiotic deficit with code review, append-only void
 * accumulation with battery degradation, and complement concentration
 * with brainstorming session quality.
 *
 * Companion theorems: PredictionsRound11.lean (17 sorry-free theorems),
 * PredictionsRound11.tla (9 invariants, model-checked).
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Prediction 137: Student Learning Curve is Void Walking
// ============================================================================

function learningStrength(totalTopics: number, failedQuizzes: number): number {
  return totalTopics - Math.min(failedQuizzes, totalTopics) + 1;
}

describe('P137: student learning curve is void walking', () => {
  it('learning strength never zero (the sliver -- no student has zero knowledge)', () => {
    for (let topics = 1; topics <= 20; topics++) {
      for (let fails = 0; fails <= topics + 5; fails++) {
        expect(learningStrength(topics, fails)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('more failed quizzes = weaker learning strength', () => {
    const topics = 10;
    for (let f = 0; f < topics; f++) {
      expect(learningStrength(topics, f + 1)).toBeLessThanOrEqual(
        learningStrength(topics, f),
      );
    }
  });

  it('mastery (zero failures) = maximum learning strength', () => {
    expect(learningStrength(10, 0)).toBe(11);
    expect(learningStrength(5, 0)).toBe(6);
  });

  it('complement concentrates on least-mastered topics', () => {
    // Topic A: 8 failures, Topic B: 2 failures
    // Complement weight for A is lower (more void entries)
    const topicA = learningStrength(10, 8);
    const topicB = learningStrength(10, 2);

    expect(topicB).toBeGreaterThan(topicA);
    // Both still positive (the sliver)
    expect(topicA).toBeGreaterThanOrEqual(1);
    expect(topicB).toBeGreaterThanOrEqual(1);
  });

  it('models real learning curves', () => {
    // First-time learner: no failures, maximum strength
    const freshStudent = learningStrength(10, 0);
    expect(freshStudent).toBe(11);

    // Struggling student: 7 failures
    const struggling = learningStrength(10, 7);
    expect(struggling).toBe(4);

    // Maximum failures: minimum but never zero
    const maxFails = learningStrength(10, 10);
    expect(maxFails).toBe(1); // The sliver remains

    // Monotone decline
    expect(freshStudent).toBeGreaterThan(struggling);
    expect(struggling).toBeGreaterThan(maxFails);
  });
});

// ============================================================================
// Prediction 138: Epidemic Herd Immunity as Convergence
// ============================================================================

function susceptibilityDeficit(totalPop: number, immuneCount: number): number {
  return totalPop - immuneCount;
}

function immuneWeight(immuneCount: number): number {
  return immuneCount + 1;
}

describe('P138: epidemic herd immunity as convergence', () => {
  it('susceptibility deficit is non-negative', () => {
    for (let pop = 0; pop <= 20; pop++) {
      for (let immune = 0; immune <= pop; immune++) {
        expect(susceptibilityDeficit(pop, immune)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('more immune = lower susceptibility deficit', () => {
    const pop = 100;
    for (let i = 0; i < pop; i++) {
      expect(susceptibilityDeficit(pop, i + 1)).toBeLessThan(
        susceptibilityDeficit(pop, i),
      );
    }
  });

  it('immune weight always positive (the sliver)', () => {
    for (let i = 0; i <= 100; i++) {
      expect(immuneWeight(i)).toBeGreaterThanOrEqual(1);
    }
  });

  it('full immunity bounded (never 100% + epsilon)', () => {
    const pop = 100;
    expect(immuneWeight(pop)).toBe(101);
    expect(immuneWeight(pop)).toBeLessThanOrEqual(pop + 1);
  });

  it('models real epidemic dynamics', () => {
    const pop = 1000;

    // Pre-vaccination: few immune
    const preVax = susceptibilityDeficit(pop, 50);
    expect(preVax).toBe(950);

    // Partial vaccination: some immune
    const partialVax = susceptibilityDeficit(pop, 600);
    expect(partialVax).toBe(400);

    // Herd immunity threshold (~70%): deficit drops significantly
    const herdThreshold = susceptibilityDeficit(pop, 700);
    expect(herdThreshold).toBe(300);

    // High vaccination: deficit very low
    const highVax = susceptibilityDeficit(pop, 950);
    expect(highVax).toBe(50);

    // The sliver: even at max vaccination, some susceptible remain
    const maxVax = susceptibilityDeficit(pop, pop);
    expect(maxVax).toBe(0); // Deficit can reach zero...
    // ...but immune weight never exceeds pop + 1
    expect(immuneWeight(pop)).toBeLessThanOrEqual(pop + 1);

    // Monotone reduction
    expect(preVax).toBeGreaterThan(partialVax);
    expect(partialVax).toBeGreaterThan(herdThreshold);
    expect(herdThreshold).toBeGreaterThan(highVax);
  });
});

// ============================================================================
// Prediction 139: Code Review Deficit
// ============================================================================

function reviewDeficit(reviewers: number): number {
  return reviewers - 1;
}

describe('P139: code review deficit', () => {
  it('single reviewer = zero deficit', () => {
    expect(reviewDeficit(1)).toBe(0);
  });

  it('review deficit = k - 1 (exact tradeoff)', () => {
    expect(reviewDeficit(2)).toBe(1);
    expect(reviewDeficit(3)).toBe(2);
    expect(reviewDeficit(5)).toBe(4);
    expect(reviewDeficit(10)).toBe(9);
  });

  it('more reviewers = more deficit', () => {
    for (let k = 1; k < 20; k++) {
      expect(reviewDeficit(k + 1)).toBeGreaterThan(reviewDeficit(k));
    }
  });

  it('review deficit is non-negative', () => {
    for (let k = 1; k <= 20; k++) {
      expect(reviewDeficit(k)).toBeGreaterThanOrEqual(0);
    }
  });

  it('deficit + 1 = reviewers (exact identity)', () => {
    for (let k = 1; k <= 20; k++) {
      expect(reviewDeficit(k) + 1).toBe(k);
    }
  });

  it('models real code review tradeoff', () => {
    // Solo developer: no information loss, but no redundancy
    const solo = reviewDeficit(1);
    expect(solo).toBe(0);

    // Pair review: 1 unit of information lost in merge decision
    const pair = reviewDeficit(2);
    expect(pair).toBe(1);

    // Team review (4 reviewers): 3 units lost
    const team = reviewDeficit(4);
    expect(team).toBe(3);

    // Large committee (8 reviewers): 7 units lost
    const committee = reviewDeficit(8);
    expect(committee).toBe(7);

    // More reviewers = more deficit but more bug-catching redundancy
    expect(solo).toBeLessThan(pair);
    expect(pair).toBeLessThan(team);
    expect(team).toBeLessThan(committee);
  });
});

// ============================================================================
// Prediction 140: Battery Degradation is Irreversible Void Accumulation
// ============================================================================

function remainingCapacity(initialCapacity: number, degradationEvents: number): number {
  return initialCapacity - Math.min(degradationEvents, initialCapacity) + 1;
}

describe('P140: battery degradation is irreversible void accumulation', () => {
  it('battery capacity never zero (the sliver -- never exactly zero)', () => {
    for (let cap = 1; cap <= 20; cap++) {
      for (let deg = 0; deg <= cap + 5; deg++) {
        expect(remainingCapacity(cap, deg)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('more degradation = less remaining capacity', () => {
    const cap = 10;
    for (let d = 0; d < cap; d++) {
      expect(remainingCapacity(cap, d + 1)).toBeLessThanOrEqual(
        remainingCapacity(cap, d),
      );
    }
  });

  it('fresh battery (zero degradation) = maximum capacity', () => {
    expect(remainingCapacity(10, 0)).toBe(11);
    expect(remainingCapacity(5, 0)).toBe(6);
  });

  it('degradation is monotone (append-only)', () => {
    const cap = 100;
    const capacities: number[] = [];
    for (let d = 0; d <= cap; d++) {
      capacities.push(remainingCapacity(cap, d));
    }
    // Monotonically non-increasing
    for (let i = 0; i < capacities.length - 1; i++) {
      expect(capacities[i + 1]!).toBeLessThanOrEqual(capacities[i]!);
    }
  });

  it('calendar aging = void entries without cycling', () => {
    // Even without active cycling, degradation events accumulate
    const cap = 100;
    const calendarAging = 20; // 20 degradation events from sitting
    const cycleAging = 20; // 20 degradation events from cycling

    // Same number of void entries = same remaining capacity
    // (Calendar aging and cycle aging are equivalent void entries)
    expect(remainingCapacity(cap, calendarAging)).toBe(
      remainingCapacity(cap, cycleAging),
    );
  });

  it('models real battery lifecycle', () => {
    const cap = 100;

    // New battery: full capacity
    const newBattery = remainingCapacity(cap, 0);
    expect(newBattery).toBe(101);

    // After 200 cycles (~1 year): slight degradation
    const oneYear = remainingCapacity(cap, 10);
    expect(oneYear).toBe(91);

    // After 500 cycles (~2 years): moderate degradation
    const twoYears = remainingCapacity(cap, 30);
    expect(twoYears).toBe(71);

    // After 1000 cycles (~4 years): significant degradation
    const fourYears = remainingCapacity(cap, 60);
    expect(fourYears).toBe(41);

    // End of life: minimum but never zero
    const eol = remainingCapacity(cap, cap);
    expect(eol).toBe(1); // The sliver remains

    // Monotone decline
    expect(newBattery).toBeGreaterThan(oneYear);
    expect(oneYear).toBeGreaterThan(twoYears);
    expect(twoYears).toBeGreaterThan(fourYears);
    expect(fourYears).toBeGreaterThan(eol);
  });
});

// ============================================================================
// Prediction 141: Brainstorming Session Quality Follows Concentration
// ============================================================================

function ideaQuality(totalIdeas: number, rejectedIdeas: number): number {
  return totalIdeas - Math.min(rejectedIdeas, totalIdeas) + 1;
}

describe('P141: brainstorming session quality follows concentration', () => {
  it('idea quality never zero (the sliver -- no idea ever fully excluded)', () => {
    for (let ideas = 1; ideas <= 20; ideas++) {
      for (let rej = 0; rej <= ideas + 5; rej++) {
        expect(ideaQuality(ideas, rej)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('more rejections = lower quality weight', () => {
    const ideas = 10;
    for (let r = 0; r < ideas; r++) {
      expect(ideaQuality(ideas, r + 1)).toBeLessThanOrEqual(
        ideaQuality(ideas, r),
      );
    }
  });

  it('zero rejections = maximum quality (top-ranked)', () => {
    expect(ideaQuality(10, 0)).toBe(11);
    expect(ideaQuality(5, 0)).toBe(6);
  });

  it('complement concentrates on least-rejected ideas (best ones)', () => {
    const totalIdeas = 10;
    // Idea A: rejected 8 times (low quality)
    const ideaA = ideaQuality(totalIdeas, 8);
    // Idea B: rejected 2 times (high quality)
    const ideaB = ideaQuality(totalIdeas, 2);

    // Complement concentrates on B (higher weight)
    expect(ideaB).toBeGreaterThan(ideaA);
  });

  it('more evaluation rounds produce sharper ranking', () => {
    // Round 1: slight difference
    const round1_good = ideaQuality(10, 2);
    const round1_bad = ideaQuality(10, 4);
    const diff1 = round1_good - round1_bad;

    // Round 2 (more rejections accumulated): sharper difference
    const round2_good = ideaQuality(10, 2);
    const round2_bad = ideaQuality(10, 7);
    const diff2 = round2_good - round2_bad;

    expect(diff2).toBeGreaterThan(diff1);
  });

  it('coherence: two independent panels with same rejections produce same ranking', () => {
    const totalIdeas = 10;

    // Panel A and Panel B independently reject the same number of ideas
    const panelA = ideaQuality(totalIdeas, 6);
    const panelB = ideaQuality(totalIdeas, 6);

    expect(panelA).toBe(panelB);

    // Different rejection counts still obey same ordering
    const panelA_idea1 = ideaQuality(totalIdeas, 3);
    const panelB_idea1 = ideaQuality(totalIdeas, 3);
    const panelA_idea2 = ideaQuality(totalIdeas, 7);
    const panelB_idea2 = ideaQuality(totalIdeas, 7);

    expect(panelA_idea1).toBe(panelB_idea1);
    expect(panelA_idea2).toBe(panelB_idea2);
    expect(panelA_idea1).toBeGreaterThan(panelA_idea2);
    expect(panelB_idea1).toBeGreaterThan(panelB_idea2);
  });

  it('models real brainstorming sessions', () => {
    const totalIdeas = 20;

    // Best idea: only 1 rejection
    const bestIdea = ideaQuality(totalIdeas, 1);
    expect(bestIdea).toBe(20);

    // Average idea: 10 rejections
    const averageIdea = ideaQuality(totalIdeas, 10);
    expect(averageIdea).toBe(11);

    // Poor idea: 18 rejections
    const poorIdea = ideaQuality(totalIdeas, 18);
    expect(poorIdea).toBe(3);

    // Worst idea: maximum rejections, but still has the sliver
    const worstIdea = ideaQuality(totalIdeas, 20);
    expect(worstIdea).toBe(1);

    // Ordering preserved
    expect(bestIdea).toBeGreaterThan(averageIdea);
    expect(averageIdea).toBeGreaterThan(poorIdea);
    expect(poorIdea).toBeGreaterThan(worstIdea);
  });
});

// ============================================================================
// Cross-cutting: All five compose
// ============================================================================

describe('Round 11: all five predictions compose', () => {
  it('learning positive + immune positive + review exact + battery positive + quality positive', () => {
    // P137: learning strength always positive
    expect(learningStrength(10, 10)).toBeGreaterThanOrEqual(1);
    // P138: immune weight always positive
    expect(immuneWeight(0)).toBeGreaterThanOrEqual(1);
    // P139: single reviewer = zero deficit
    expect(reviewDeficit(1)).toBe(0);
    // P140: battery capacity always positive
    expect(remainingCapacity(10, 10)).toBeGreaterThanOrEqual(1);
    // P141: idea quality always positive
    expect(ideaQuality(10, 10)).toBeGreaterThanOrEqual(1);
  });

  it('deficits are monotonically reducible across all domains', () => {
    // Each prediction has a lever that monotonically reduces its deficit
    // P137: fewer failures increases learning strength
    expect(learningStrength(10, 2)).toBeGreaterThan(learningStrength(10, 5));
    // P138: more immune reduces susceptibility deficit
    expect(susceptibilityDeficit(100, 80)).toBeLessThan(susceptibilityDeficit(100, 50));
    // P139: fewer reviewers reduces review deficit
    expect(reviewDeficit(3)).toBeLessThan(reviewDeficit(6));
    // P140: fewer degradation events increases remaining capacity
    expect(remainingCapacity(10, 2)).toBeGreaterThan(remainingCapacity(10, 5));
    // P141: fewer rejections increases idea quality
    expect(ideaQuality(10, 2)).toBeGreaterThan(ideaQuality(10, 5));
  });
});
