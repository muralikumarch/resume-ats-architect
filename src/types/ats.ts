// ATS Evaluation Result Types

export interface ExtractedJdKeywords {
  required: string[];
  preferred: string[];
  rawTerms: string[];
  allKeywords: string[];
}

export interface BulletScore {
  text: string;
  hasActionVerb: boolean;
  hasMetric: boolean;
  jdHits: number;
  wordCount: number;
  score: number; // 0–100
}

export interface PillarScores {
  parseability: number;    // Pillar 1 (20%)
  keywords: number;        // Pillar 2 (40%)
  bulletImpact: number;    // Pillar 3 (25%)
  hygiene: number;         // Pillar 4 (10%)
  structure: number;       // Pillar 5 (5%)
}

export interface Suggestion {
  type: 'keyword' | 'bullet' | 'format' | 'hygiene' | 'structure';
  severity: 'critical' | 'warning' | 'tip';
  message: string;
  action?: string;
}

export interface AtsAuditResult {
  overallScore: number;
  pillarScores: PillarScores;
  matchedKeywords: string[];
  missingKeywords: string[];
  criticalMissing: string[];
  bulletScores: BulletScore[];
  formattingWarnings: string[];
  suggestions: Suggestion[];
  totalJdKeywords: number;
  matchedCount: number;
}

export interface JdAnalysisState {
  score: number;
  matched: string[];
  missing: string[];
  allKeywords: string[];
  bulletScores: Record<string, number[]>;
}
