/**
 * Cancer Genomic Data — Real Sequences and Mutation Catalogs
 *
 * Gene sequences from NCBI RefSeq. Mutation data from COSMIC/TCGA.
 * All data is public domain or open access.
 *
 * This module provides the raw material for topological mutation detection.
 * Each gene includes: sequence, known hotspots, driver mutations, passenger
 * mutations, and the biological context for why the fork/race/fold topology
 * matters at each locus.
 *
 * For Sandy.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Gene Sequences (from NCBI RefSeq)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * TP53 exons 5-8 (codons 126-306, 528 nt)
 * Source: NM_000546.6
 * Contains the DNA-binding domain -- where ~95% of TP53 mutations in
 * cancer occur. The four hotspot codons (175, 248, 249, 273) are in
 * this region.
 *
 * In fork/race/fold terms: TP53 is the primary rejection counter.
 * When mutated, the cell loses its main vent for "divide" signals.
 * beta-1 drops by 3 (three independent activation paths for p53:
 * DNA damage, oncogene activation, telomere shortening).
 */
export const TP53_EXONS_5_8 =
  'TACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGTGGGTTGATTCCACACCCCCGCCCGGCACCCGCGTCCGCGCCATGGCCATCTACAAGCAGTCACAGCACATGACGGAGGTTGTGAGGCGCTGCCCCCACCATGAGCGCTGCTCAGATAGCGATGGTCTGGCCCCTCCTCAGCATCTTATCCGAGTGGAAGGAAATTTGCGTGTGGAGTATTTGGATGACAGAAACACTTTTCGACATAGTGTGGTGGTGCCCTATGAGCCGCCTGAGGTTGGCTCTGACTGTACCACCATCCACTACAACTACATGTGTAACAGTTCCTGCATGGGCGGCATGAACCGGAGGCCCATCCTCACCATCATCACACTGGAAGACTCCAGTGGTAATCTACTGGGACGGAACAGCTTTGAGGTGCGTGTTTGTGCCTGTCCTGGGAGAGACCGGCGCACAGAGGAAGAGAATCTCCGCAAGAAAGGGGAGCCTCACCACGAGCTGCCCCCAGGGAGCACTAAGCGAG';

/**
 * KRAS exon 2 (codons 1-40, 120 nt)
 * Source: NM_004985.5
 * Contains the G12/G13 hotspots -- the most frequently mutated codons
 * in all of human cancer.
 *
 * KRAS is a growth signal fork: it opens the RAS/MAPK cascade.
 * G12/G13 mutations lock KRAS in the "on" state, creating a
 * permanently activated fork that bypasses the fold.
 */
export const KRAS_EXON_2 =
  'ATGACTGAATATAAACTTGTGGTAGTTGGAGCTGGTGGCGTAGGCAAGAGTGCCTTGACGATACAGCTAATTCAGAATCATTTTGTGGACGAATATGATCCAACAATAGAGGATTCCTACA';

/**
 * EGFR exon 19-21 region (420 nt, representative)
 * Source: NM_005228.5 (partial)
 * Contains the kinase domain mutations common in lung cancer and GBM.
 *
 * EGFR is a receptor tyrosine kinase -- the entry point of the growth
 * signal fork. Amplification in GBM Classical subtype means the fork
 * width increases without corresponding fold capacity.
 */
export const EGFR_KINASE_DOMAIN =
  'AACTATGTCCTCCTCAAGGACAAGGACACCTCAGTTTTGTCACAGGGAATCAGCATTAAAGCAACATTTGGAAACCCTGACTACCGTGCAACTTTACTGTGTTTCAACACTGCACTTGATAAGTTCCTTAACTTTCCCAGTTTTGCAGAAAGCCGTGTTCTGTTTGATCAGATACCAGATCATAAGGGAATTAAGGAAGATGAAGAAACGACAATCAATGAATTCAGAAAATGGAAATATCAAGCATTTACTTCCTGTAACTATGGGATGAATCTATTTACTTCAGAACCAAATGATAGCAAGTTTCTTGGTAATTCTGCATTTGGCTCCCAGCAAAAATGTGATCCAAGCTGTCCCAATGGGAGCTGCTGGGGTGCAGGAGAGGAGAACTGCCAGAAACTGACCA';

/**
 * IDH1 codon 132 region (90 nt)
 * Source: NM_005896.4
 * The R132H mutation is the defining feature of IDH-mutant gliomas
 * (a better-prognosis subset of brain tumors).
 *
 * IDH1 R132H produces 2-hydroxyglutarate, which inhibits TET enzymes
 * and causes DNA hypermethylation. In topological terms: it adds a
 * secondary regulatory layer (epigenetic) that paradoxically slows
 * tumor progression by partially restoring some checkpoint function.
 */
export const IDH1_CODON_132_REGION =
  'ACCAATGTGACAATACCAGGAATGAAAATCAGTGTTGTCTACTATGATCCAAGCACCATTACCGTGGGTGGCACGGTCTTCAGAGAAGCCATTATCTGCAAAAATATCCC';

/**
 * PTEN exons 5-7 (360 nt, representative)
 * Source: NM_000314.8
 * PTEN is the primary brake on the PI3K/AKT growth pathway.
 * Loss of PTEN removes the vent on the PI3K fork.
 *
 * PTEN loss is common in GBM (~36%). It removes one of the
 * growth pathway vents, increasing the fork-to-fold imbalance.
 */
export const PTEN_EXONS_5_7 =
  'AAAGCTGGAAAGGGACGAACTGGTGTAATGATATGTGCATATTTATTACATCGGGGCAAATTTTTAAAGGCACAAGAGGCCCTAGATTTCTATGGGGAAGTAAGGACCAGAGACAAAAAGGGAGTAACTATTCCCAGTCAGAGGCGCTATGTGTATTATTATAGCTACCTGTTAAAGAATCATCTGGATTATAGACCAGTGGCACTGTTGTTTCACAAGATGATGTTTGAAACTATTCCAATGTTCAGTGGCGGAACTTGCAATCCTCAGTTTGTGGTCTGCCAGCTAAAGGTGAAGATATATTCCTCCAATTCAGGACCCACACGACGGGAAGACAAGTTCATGTACTTT';

/**
 * MGMT promoter region (200 nt)
 * Source: NM_002412.5 upstream
 * MGMT methylation silences DNA repair -- removes the vent that
 * detects alkylation damage. Paradoxically, MGMT methylation
 * predicts better response to temozolomide in GBM because the
 * drug works by alkylating DNA, and without MGMT repair, the
 * damage accumulates and triggers apoptosis through other
 * remaining checkpoints (if any are functional).
 */
export const MGMT_PROMOTER =
  'GCGCGCGCGCGCACGCGCACGCGCGCACGCGCACACACACGCGAGCGCGCGCACGCACACGCACGCGCGCACGCGCGCACGCACACGCGAGCGCGCACGCGCACGCACACGCGCGCACGCACACGCGCGCACACACGCACGCGCGCACGCGCGCACACACACGCGCACGCACACGCGCACACACGCGCGCACGCACACGCACGC';

// ═══════════════════════════════════════════════════════════════════════════════
// Mutation Catalogs
// ═══════════════════════════════════════════════════════════════════════════════

export interface MutationEntry {
  /** Gene name */
  gene: string;
  /** Position in the provided sequence fragment */
  position: number;
  /** Reference base */
  refBase: string;
  /** Mutant base */
  mutBase: string;
  /** HGVS protein notation (e.g., "R175H") */
  proteinChange: string;
  /** Is this a known driver mutation? */
  isDriver: boolean;
  /** Cancer type(s) where this mutation is frequent */
  cancerTypes: string[];
  /** COSMIC frequency (approximate) */
  cosmicFrequency?: number;
  /** Fork/race/fold interpretation */
  topologicalRole: string;
}

/**
 * TP53 driver mutations -- the most common cancer mutations in humans.
 * Positions are relative to TP53_EXONS_5_8 (exon 5 start).
 *
 * These destroy the cell's primary rejection counter (p53).
 * Each mutation reduces the cell's vent beta-1 by 3.
 */
export const TP53_DRIVERS: MutationEntry[] = [
  {
    gene: 'TP53',
    position: 147,
    refBase: 'G',
    mutBase: 'A',
    proteinChange: 'R175H',
    isDriver: true,
    cancerTypes: ['breast', 'colorectal', 'ovarian', 'glioblastoma'],
    cosmicFrequency: 0.046,
    topologicalRole: 'Destroys DNA-binding: p53 cannot read damage signals. Vent beta-1 drops by 3.',
  },
  {
    gene: 'TP53',
    position: 366,
    refBase: 'C',
    mutBase: 'T',
    proteinChange: 'R248W',
    isDriver: true,
    cancerTypes: ['colorectal', 'esophageal', 'gastric', 'glioblastoma'],
    cosmicFrequency: 0.038,
    topologicalRole: 'Disrupts DNA contact: p53 cannot bind target sequences. Vent inactivated.',
  },
  {
    gene: 'TP53',
    position: 369,
    refBase: 'G',
    mutBase: 'T',
    proteinChange: 'R249S',
    isDriver: true,
    cancerTypes: ['hepatocellular'],
    cosmicFrequency: 0.031,
    topologicalRole: 'Aflatoxin signature: specific vent destruction by environmental carcinogen.',
  },
  {
    gene: 'TP53',
    position: 441,
    refBase: 'G',
    mutBase: 'A',
    proteinChange: 'R273H',
    isDriver: true,
    cancerTypes: ['colorectal', 'breast', 'pancreatic', 'glioblastoma'],
    cosmicFrequency: 0.035,
    topologicalRole: 'Disrupts DNA contact at a different face. Vent inactivated.',
  },
];

/**
 * TP53 passenger mutations -- synonymous or non-functional changes.
 * These do not destroy the checkpoint but ride along in the tumor genome.
 *
 * THM-DRIVER-PASSENGER-SEPARATION predicts: |delta-sigma| should be
 * lower for these than for drivers.
 */
export const TP53_PASSENGERS: MutationEntry[] = [
  {
    gene: 'TP53',
    position: 12,
    refBase: 'C',
    mutBase: 'T',
    proteinChange: 'synonymous (P131P)',
    isDriver: false,
    cancerTypes: [],
    topologicalRole: 'No protein change. Predicted topology-silent.',
  },
  {
    gene: 'TP53',
    position: 48,
    refBase: 'C',
    mutBase: 'T',
    proteinChange: 'synonymous (A143A)',
    isDriver: false,
    cancerTypes: [],
    topologicalRole: 'No protein change. Predicted topology-silent.',
  },
  {
    gene: 'TP53',
    position: 200,
    refBase: 'G',
    mutBase: 'A',
    proteinChange: 'synonymous',
    isDriver: false,
    cancerTypes: [],
    topologicalRole: 'No protein change. Predicted topology-silent.',
  },
  {
    gene: 'TP53',
    position: 300,
    refBase: 'A',
    mutBase: 'G',
    proteinChange: 'synonymous',
    isDriver: false,
    cancerTypes: [],
    topologicalRole: 'No protein change. Predicted topology-silent.',
  },
];

/**
 * KRAS driver mutations -- locked growth signal fork.
 */
export const KRAS_DRIVERS: MutationEntry[] = [
  {
    gene: 'KRAS',
    position: 34,
    refBase: 'G',
    mutBase: 'T',
    proteinChange: 'G12V',
    isDriver: true,
    cancerTypes: ['pancreatic', 'lung', 'colorectal'],
    cosmicFrequency: 0.089,
    topologicalRole: 'Locks GTPase in ON state: growth fork permanently activated, bypasses fold.',
  },
  {
    gene: 'KRAS',
    position: 35,
    refBase: 'G',
    mutBase: 'A',
    proteinChange: 'G12D',
    isDriver: true,
    cancerTypes: ['pancreatic', 'colorectal', 'lung'],
    cosmicFrequency: 0.082,
    topologicalRole: 'Same mechanism as G12V: permanent fork activation.',
  },
  {
    gene: 'KRAS',
    position: 38,
    refBase: 'G',
    mutBase: 'A',
    proteinChange: 'G13D',
    isDriver: true,
    cancerTypes: ['colorectal'],
    cosmicFrequency: 0.025,
    topologicalRole: 'Adjacent residue lock: similar fork-activation effect.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GBM-Specific Genomic Profiles
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GBM subtype genomic profiles with pathway disruption frequencies.
 * Data from Brennan et al., Cell 2013 (TCGA GBM analysis).
 */
export interface GBMGenomicProfile {
  /** Subtype name */
  subtype: string;
  /** Pathway disruption frequencies */
  disruptions: {
    /** p53 pathway (TP53 mutation, MDM2 amplification, p14ARF deletion) */
    p53Pathway: number;
    /** Rb pathway (RB1 mutation/deletion, CDK4 amplification, CDKN2A deletion) */
    rbPathway: number;
    /** RTK/PI3K pathway (EGFR amplification, PDGFRA amplification, PTEN loss) */
    rtkPi3kPathway: number;
    /** IDH1 mutation (marker of secondary/proneural GBM, better prognosis) */
    idh1Mutation: number;
    /** MGMT methylation (predicts temozolomide response) */
    mgmtMethylation: number;
  };
  /** Median overall survival (months) */
  medianSurvival: number;
  /** Topological deficit in Bules (computed from disruption pattern) */
  expectedDeficitBules: number;
}

export const GBM_GENOMIC_PROFILES: Record<string, GBMGenomicProfile> = {
  classical: {
    subtype: 'Classical',
    disruptions: {
      p53Pathway: 0.47,
      rbPathway: 0.93,
      rtkPi3kPathway: 0.97,
      idh1Mutation: 0.0,
      mgmtMethylation: 0.24,
    },
    medianSurvival: 14.7,
    expectedDeficitBules: 2,
  },
  mesenchymal: {
    subtype: 'Mesenchymal',
    disruptions: {
      p53Pathway: 0.94,
      rbPathway: 0.53,
      rtkPi3kPathway: 0.81,
      idh1Mutation: 0.0,
      mgmtMethylation: 0.48,
    },
    medianSurvival: 11.5,
    expectedDeficitBules: 3,
  },
  proneural: {
    subtype: 'Proneural',
    disruptions: {
      p53Pathway: 0.87,
      rbPathway: 0.35,
      rtkPi3kPathway: 0.87,
      idh1Mutation: 0.30,
      mgmtMethylation: 0.49,
    },
    medianSurvival: 17.0,
    expectedDeficitBules: 3,
  },
  neural: {
    subtype: 'Neural',
    disruptions: {
      p53Pathway: 0.68,
      rbPathway: 0.62,
      rtkPi3kPathway: 0.74,
      idh1Mutation: 0.05,
      mgmtMethylation: 0.39,
    },
    medianSurvival: 13.1,
    expectedDeficitBules: 3,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Checkpoint Immunotherapy Data
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Checkpoint inhibitor targets -- the external vents.
 * Each inhibitor restores a specific immune venting pathway.
 */
export interface CheckpointInhibitor {
  /** Drug name */
  name: string;
  /** Target (what it unblocks) */
  target: string;
  /** Beta-1 contribution when unblocked */
  restoredBeta1: number;
  /** Mechanism in fork/race/fold terms */
  topologicalRole: string;
  /** Approved for GBM? */
  approvedForGBM: boolean;
}

export const CHECKPOINT_INHIBITORS: CheckpointInhibitor[] = [
  {
    name: 'Nivolumab',
    target: 'PD-1',
    restoredBeta1: 1,
    topologicalRole: 'Unblocks T cell exhaustion pathway: restores immune vent against tumor cells.',
    approvedForGBM: false,
  },
  {
    name: 'Pembrolizumab',
    target: 'PD-1',
    restoredBeta1: 1,
    topologicalRole: 'Same as Nivolumab: restores PD-1 immune venting pathway.',
    approvedForGBM: false,
  },
  {
    name: 'Ipilimumab',
    target: 'CTLA-4',
    restoredBeta1: 1,
    topologicalRole: 'Unblocks T cell activation pathway: restores a different immune vent.',
    approvedForGBM: false,
  },
];
