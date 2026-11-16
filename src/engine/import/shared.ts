// Shared helpers for resume import parsers (text + JSON paths).

import { TECH_KEYWORDS_DICTIONARY } from '../../data/techKeywords';
import type { ResumeMeta } from '../../types/resume';

export const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/;
export const PHONE_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/;
export const LINKEDIN_REGEX = /linkedin\.com\/in\/[\w-]+/i;

export function extractEmail(text: string): string | null {
  return text.match(EMAIL_REGEX)?.[0] ?? null;
}

export function extractPhone(text: string): string | null {
  return text.match(PHONE_REGEX)?.[0] ?? null;
}

export function extractLinkedIn(text: string): string | null {
  return text.match(LINKEDIN_REGEX)?.[0] ?? null;
}

export function buildMeta(overrides: Partial<ResumeMeta> = {}): ResumeMeta {
  return {
    version: '1.0.0',
    lastModified: new Date().toISOString(),
    schemaVersion: '1.0',
    ...overrides,
  };
}

/**
 * Scan a line for known tech keywords (from TECH_KEYWORDS_DICTIONARY) and return
 * the canonical dictionary entries found (deduped, original case from dictionary).
 */
export function findTechTokens(line: string): string[] {
  if (!line) return [];
  const lower = line.toLowerCase();
  const matched = TECH_KEYWORDS_DICTIONARY.filter((kw) =>
    lower.includes(kw.toLowerCase()),
  );
  // Drop any token that is a substring of a longer matched token
  // (e.g. keep "JavaScript", drop "Java") to avoid noisy overlaps.
  return matched.filter(
    (kw) =>
      !matched.some(
        (other) => other !== kw && other.toLowerCase().includes(kw.toLowerCase()),
      ),
  );
}

export interface SectionRange {
  startIdx: number; // inclusive index of first content line (after heading)
  endIdx: number; // exclusive index (next heading or end)
}

/**
 * Find the index range of a section's *content lines* given the heading regex.
 * Returns null if the heading isn't found. `endIdx` stops at the next line
 * that itself matches any of the provided "any heading" patterns.
 */
export function findSection(
  lines: string[],
  headingPattern: RegExp,
  allHeadingPatterns: RegExp[],
): SectionRange | null {
  const headingIdx = lines.findIndex((l) => headingPattern.test(l));
  if (headingIdx === -1) return null;

  let end = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (allHeadingPatterns.some((p) => p.test(line))) {
      end = i;
      break;
    }
  }
  return { startIdx: headingIdx + 1, endIdx: end };
}

/**
 * Return a monotonically increasing id string for a given kind.
 * Keeps imported resume data stable across renders (no Math.random in render
 * paths) and prefixed so it never collides with `exp-*`, `sg-*`, `edu-*`
 * defaults shipped in initialResume.
 */
let _idCounter = 0;
export function nextId(kind: 'exp' | 'sg' | 'edu' | 'cert'): string {
  _idCounter += 1;
  return `${kind}-imp-${Date.now().toString(36)}-${_idCounter.toString(36)}`;
}

/**
 * Parse a "YYYY-MM" or "YYYY" string into a normalized 'YYYY-MM' or 'YYYY'.
 * Returns null on garbage input.
 */
export function normalizeMonthYear(raw: string | undefined | null): string {
  if (!raw) return '';
  const m = String(raw).trim().match(/^(\d{4})(?:-?(\d{1,2}))?/);
  if (!m) return '';
  const year = m[1];
  const month = m[2];
  if (!month) return year;
  const mm = Number(month);
  if (mm < 1 || mm > 12) return year;
  return `${year}-${String(mm).padStart(2, '0')}`;
}

/**
 * Try to extract a display period like "July 2025 – July 2026" or "Present"
 * from a raw line. Returns null when no plausible date is found.
 */
export function parsePeriod(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // At least one 4-digit year, or the word "Present"/"Now"/"Current"
  if (!/\d{4}/.test(trimmed) && !/present|now|current/i.test(trimmed)) {
    return null;
  }
  return trimmed.replace(/\s+/g, ' ');
}
