import { TECH_KEYWORDS_DICTIONARY, IGNORE_WORDS } from '../../data/techKeywords';
import type { ExtractedJdKeywords } from '../../types/ats';

/**
 * Extract structured keywords from a raw Job Description text.
 * - Identifies required vs. preferred qualifications
 * - Expands custom capitalized tech terms from the JD
 * - Deduplicates all terms
 */
export function extractJdKeywords(jdText: string): ExtractedJdKeywords {
  if (!jdText.trim()) {
    return { required: [], preferred: [], rawTerms: [], allKeywords: [] };
  }

  const jdLower = jdText.toLowerCase();

  // Step 1: Match terms from dictionary
  const fromDict = new Set<string>();
  TECH_KEYWORDS_DICTIONARY.forEach((kw) => {
    if (jdLower.includes(kw.toLowerCase())) {
      fromDict.add(kw);
    }
  });

  // Step 2: Extract capitalized tech tokens not already in dictionary
  const customTokenRegex = /\b[A-Z][A-Za-z0-9+.#/-]{2,20}\b/g;
  const customTokens = jdText.match(customTokenRegex) ?? [];
  customTokens.forEach((tok) => {
    if (!IGNORE_WORDS.has(tok) && tok.length > 2) {
      const alreadyInDict = Array.from(fromDict).some(
        (k) => k.toLowerCase() === tok.toLowerCase()
      );
      if (!alreadyInDict) fromDict.add(tok);
    }
  });

  const allKeywords = Array.from(fromDict);

  // Step 3: Heuristically separate required vs preferred
  // Look for explicit sections; otherwise treat all as required
  const requiredSection = extractSection(jdText, [
    'required', 'must have', 'requirements', 'qualifications', 'key requirements',
    'mandatory', 'essential',
  ]);
  const preferredSection = extractSection(jdText, [
    'preferred', 'nice to have', 'bonus', 'ideal', 'plus', 'advantageous',
  ]);

  const required: string[] = [];
  const preferred: string[] = [];

  allKeywords.forEach((kw) => {
    if (preferredSection && preferredSection.toLowerCase().includes(kw.toLowerCase())) {
      preferred.push(kw);
    } else if (requiredSection && requiredSection.toLowerCase().includes(kw.toLowerCase())) {
      required.push(kw);
    } else {
      // Default to required if no section distinction found
      required.push(kw);
    }
  });

  return { required, preferred, rawTerms: allKeywords, allKeywords };
}

/**
 * Extract a section of the JD text that follows one of the given heading patterns.
 */
function extractSection(text: string, headings: string[]): string {
  const lower = text.toLowerCase();
  for (const heading of headings) {
    const idx = lower.indexOf(heading);
    if (idx !== -1) {
      return text.slice(idx, idx + 800);
    }
  }
  return '';
}
