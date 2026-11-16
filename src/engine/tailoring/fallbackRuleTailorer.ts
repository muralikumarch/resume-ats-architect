import type { ResumeData } from '../../types/resume';
import { PRESET_JDS } from '../../data/presetJds';

/**
 * Offline heuristic tailoring engine — no API key required.
 * Reorders bullets and generates a summary based on keyword matching.
 */
export function heuristicTailor(
  resume: ResumeData,
  jdInput: string,
  jdRoleTitle: string,
  jdCompany: string,
  matchedKeywords: string[],
  allJdKeywords: string[]
): ResumeData {
  // 1. Check if JD matches a preset (use pre-written tailored summary if so)
  const matchingPreset = PRESET_JDS.find((p) => p.text === jdInput);
  const updatedSummary = matchingPreset
    ? matchingPreset.tailoredSummary
    : buildGenericSummary(jdRoleTitle, jdCompany, matchedKeywords);

  // 2. Reorder bullets: most JD-relevant first within each role
  const reorderedExperience = resume.experience.map((exp) => {
    const scored = exp.bullets.map((b) => {
      const hits = allJdKeywords.filter((k) =>
        b.toLowerCase().includes(k.toLowerCase())
      ).length;
      return { text: b, hits };
    });
    scored.sort((a, b) => b.hits - a.hits);
    return { ...exp, bullets: scored.map((s) => s.text) };
  });

  return {
    ...resume,
    header: {
      ...resume.header,
      title: jdRoleTitle || resume.header.title,
    },
    summary: updatedSummary,
    experience: reorderedExperience,
  };
}

function buildGenericSummary(
  targetRole: string,
  company: string,
  matchedKeywords: string[]
): string {
  const top8 = matchedKeywords.slice(0, 8).join(', ') ||
    'cloud-native microservices, AI engineering, and enterprise architecture';
  const companyPhrase = company ? ` targeting ${company}` : '';

  return `Highly accomplished ${targetRole || 'Solution Architect / Technical Lead'}${companyPhrase} with 16+ years of software engineering experience, including 7+ years architecting enterprise-grade platforms across Banking, Payments, Fintech, and Healthcare domains. Proven expertise in ${top8}, delivering resilient, high-availability microservices and AI-enabled solutions at scale.`;
}

/**
 * Inject a missing keyword into the most relevant skill group.
 * Returns a new skillGroups array.
 */
export function injectKeywordIntoSkills(
  skillGroups: ResumeData['skillGroups'],
  keyword: string
): ResumeData['skillGroups'] {
  return skillGroups.map((sg, idx) => {
    if (idx === 1) {
      const lastLine = sg.lines[sg.lines.length - 1] ?? '';
      if (!lastLine.toLowerCase().includes(keyword.toLowerCase())) {
        const newLines = [...sg.lines];
        newLines[newLines.length - 1] = `${lastLine}, ${keyword}`;
        return { ...sg, lines: newLines };
      }
    }
    return sg;
  });
}

/**
 * Inject all missing keywords at once into skills.
 */
export function injectAllMissingKeywords(
  skillGroups: ResumeData['skillGroups'],
  missing: string[]
): ResumeData['skillGroups'] {
  if (missing.length === 0) return skillGroups;
  let updated = skillGroups;
  missing.forEach((kw) => {
    updated = injectKeywordIntoSkills(updated, kw);
  });
  return updated;
}
