import type { BulletScore } from '../../types/ats';

const STRONG_ACTION_VERBS = new Set([
  'architected', 'spearheaded', 'engineered', 'orchestrated', 'deployed',
  'modernized', 'accelerated', 'delivered', 'designed', 'implemented',
  'reduced', 'increased', 'built', 'led', 'launched', 'transformed',
  'optimized', 'established', 'created', 'developed', 'drove', 'directed',
  'championed', 'mentored', 'governed', 'elevated', 'pioneered',
  'streamlined', 'automated', 'integrated', 'migrated', 'restructured',
  'consolidated', 'secured', 'enhanced', 'managed', 'authored',
]);

const METRIC_REGEX =
  /\b(\d+(\.\d+)?\s*%|\$\d+([kmb]|\s*(million|billion|thousand))?|\d+\+?\s*(users|teams|microservices|ms|milliseconds|seconds|nodes|pods|services|apis|engineers|developers|projects|countries|lines|requests|tps))\b/i;

/**
 * Analyze a bullet point for STAR formula compliance.
 * Returns a score 0–100 and diagnostic flags.
 */
export function analyzeBullet(bullet: string, jdKeywords: string[] = []): BulletScore {
  const trimmed = bullet.trim();
  const words = trimmed.split(/\s+/);
  const firstWord = words[0]?.replace(/[^a-zA-Z]/g, '').toLowerCase() ?? '';

  const hasActionVerb = STRONG_ACTION_VERBS.has(firstWord);
  const hasMetric = METRIC_REGEX.test(trimmed);

  const jdHits = jdKeywords.filter((kw) =>
    trimmed.toLowerCase().includes(kw.toLowerCase())
  ).length;

  const wordCount = words.length;
  const lengthScore = wordCount >= 15 && wordCount <= 45 ? 20 : wordCount < 15 ? 5 : 10;

  const score = Math.min(
    100,
    (hasActionVerb ? 30 : 0) +
      (hasMetric ? 30 : 0) +
      Math.min(jdHits * 8, 20) +
      lengthScore
  );

  return { text: trimmed, hasActionVerb, hasMetric, jdHits, wordCount, score };
}

/**
 * Analyze all bullets across all experience entries.
 */
export function analyzeAllBullets(
  experience: Array<{ id: string; bullets: string[] }>,
  jdKeywords: string[]
): BulletScore[] {
  return experience.flatMap((exp) =>
    exp.bullets.map((b) => analyzeBullet(b, jdKeywords))
  );
}
