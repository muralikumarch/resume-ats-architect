import type { ResumeData } from '../../types/resume';
import type { AtsAuditResult, Suggestion } from '../../types/ats';
import { extractJdKeywords } from './keywordExtractor';
import { termInText } from './taxonomy';
import { analyzeAllBullets } from './bulletAnalyzer';

/**
 * Master 5-pillar ATS scoring engine.
 * Returns a composite score 0–100 with full diagnostic breakdown.
 */
export function evaluateResumeAts(
  resume: ResumeData,
  jdText: string
): AtsAuditResult {
  const extracted = extractJdKeywords(jdText);
  const allJdKeywords = extracted.allKeywords;

  // Flatten all resume text for global matching
  const flatExpText = resume.experience
    .flatMap((e) => [...e.bullets, e.role])
    .join(' ');
  const flatSkillsText = resume.skillGroups.flatMap((sg) => sg.lines).join(' ');
  // fullText available for future global-scope matching if needed
  void [resume.header.title, resume.summary, flatExpText, flatSkillsText, ...resume.certifications];

  // ─── PILLAR 2: Keyword Match (40%) ──────────────────────────────────────
  let kwMatchedScore = 0;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const criticalMissing: string[] = [];

  allJdKeywords.forEach((kw) => {
    const inExperience = termInText(kw, flatExpText);
    const inSkills = termInText(kw, flatSkillsText);
    const inSummary = termInText(kw, resume.summary);

    if (inExperience) {
      kwMatchedScore += 1.0;
      matchedKeywords.push(kw);
    } else if (inSkills || inSummary) {
      kwMatchedScore += 0.65;
      matchedKeywords.push(kw + ' *');
    } else {
      missingKeywords.push(kw);
      if (extracted.required.some((r) => r.toLowerCase() === kw.toLowerCase())) {
        criticalMissing.push(kw);
      }
    }
  });

  const keywordScore =
    allJdKeywords.length > 0
      ? Math.round((kwMatchedScore / allJdKeywords.length) * 100)
      : 100;

  // ─── PILLAR 3: Bullet Impact (25%) ──────────────────────────────────────
  const bulletScores = analyzeAllBullets(resume.experience, allJdKeywords);
  const avgBullet =
    bulletScores.length > 0
      ? bulletScores.reduce((s, b) => s + b.score, 0) / bulletScores.length
      : 100;
  const bulletImpact = Math.round(avgBullet);

  // ─── PILLAR 1: Parseability (20%) ───────────────────────────────────────
  const formattingWarnings: string[] = [];
  let parseability = 100;

  if (!resume.header.email) { parseability -= 25; formattingWarnings.push('Email address missing from header.'); }
  if (!resume.header.phone) { parseability -= 20; formattingWarnings.push('Phone number missing from header.'); }
  if (!resume.header.linkedin) { parseability -= 10; formattingWarnings.push('LinkedIn URL not included.'); }
  if (!resume.summary || resume.summary.length < 80) { parseability -= 20; formattingWarnings.push('Professional Summary is too short or missing (min 80 chars).'); }
  if (resume.experience.length === 0) { parseability -= 35; formattingWarnings.push('No work experience entries found.'); }
  if (resume.skillGroups.length === 0) { parseability -= 15; formattingWarnings.push('No skills section found.'); }
  if (resume.education.length === 0) { parseability -= 10; formattingWarnings.push('No education section found.'); }

  parseability = Math.max(0, parseability);

  // ─── PILLAR 4: Date & Contact Hygiene (10%) ─────────────────────────────
  let hygiene = 100;
  resume.experience.forEach((exp) => {
    if (!exp.startDate && !exp.period) {
      hygiene -= 10;
      formattingWarnings.push(`Missing dates for role: ${exp.role} at ${exp.company}`);
    }
  });
  hygiene = Math.max(0, hygiene);

  // ─── PILLAR 5: Structure (5%) ────────────────────────────────────────────
  const totalBullets = resume.experience.reduce((a, e) => a + e.bullets.length, 0);
  const structure = totalBullets >= 8 && totalBullets <= 30 ? 100 : totalBullets < 8 ? 60 : 80;

  // ─── COMPOSITE SCORE ────────────────────────────────────────────────────
  const overallScore = Math.min(
    100,
    Math.round(
      keywordScore * 0.40 +
      bulletImpact * 0.25 +
      parseability * 0.20 +
      hygiene * 0.10 +
      structure * 0.05
    )
  );

  const suggestions = generateSuggestions(
    criticalMissing,
    missingKeywords,
    bulletScores,
    formattingWarnings
  );

  return {
    overallScore,
    pillarScores: {
      parseability,
      keywords: keywordScore,
      bulletImpact,
      hygiene,
      structure,
    },
    matchedKeywords,
    missingKeywords,
    criticalMissing,
    bulletScores,
    formattingWarnings,
    suggestions,
    totalJdKeywords: allJdKeywords.length,
    matchedCount: matchedKeywords.length,
  };
}

function generateSuggestions(
  criticalMissing: string[],
  _missingKeywords: string[],
  bulletScores: ReturnType<typeof analyzeAllBullets>,
  formattingWarnings: string[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (criticalMissing.length > 0) {
    suggestions.push({
      type: 'keyword',
      severity: 'critical',
      message: `${criticalMissing.length} required JD keywords are missing from your resume.`,
      action: `Add ${criticalMissing.slice(0, 3).join(', ')} to your experience bullets.`,
    });
  }

  const bulletsWithoutMetrics = bulletScores.filter((b) => !b.hasMetric);
  if (bulletsWithoutMetrics.length > bulletScores.length * 0.5) {
    suggestions.push({
      type: 'bullet',
      severity: 'warning',
      message: `${bulletsWithoutMetrics.length} bullets lack quantifiable metrics (%, $, team size, etc.).`,
      action: 'Add impact numbers to bullets: "reduced latency by 40%", "led a team of 8 engineers".',
    });
  }

  const bulletsWithoutVerb = bulletScores.filter((b) => !b.hasActionVerb);
  if (bulletsWithoutVerb.length > 0) {
    suggestions.push({
      type: 'bullet',
      severity: 'warning',
      message: `${bulletsWithoutVerb.length} bullets do not start with a strong action verb.`,
      action: 'Begin each bullet with: Architected, Spearheaded, Engineered, Delivered, etc.',
    });
  }

  formattingWarnings.forEach((w) => {
    suggestions.push({ type: 'format', severity: 'warning', message: w });
  });

  return suggestions;
}
