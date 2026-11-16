import { SYNONYM_MAP } from '../../data/techKeywords';

/**
 * Given a term, return all known synonyms/acronyms for it.
 * Used to prevent false negatives in ATS keyword matching.
 */
export function getSynonyms(term: string): string[] {
  const direct = SYNONYM_MAP[term] ?? [];

  // Also check reverse lookup: if resume has "AWS" but JD says "Amazon Web Services"
  const reverse: string[] = [];
  Object.entries(SYNONYM_MAP).forEach(([key, values]) => {
    if (values.some((v) => v.toLowerCase() === term.toLowerCase())) {
      reverse.push(key);
    }
  });

  return [...new Set([...direct, ...reverse])];
}

/**
 * Check if a term (or any of its synonyms) appears in a body of text.
 */
export function termInText(term: string, text: string): boolean {
  const lowerText = text.toLowerCase();
  const syns = [term, ...getSynonyms(term)];
  return syns.some((s) => lowerText.includes(s.toLowerCase()));
}
