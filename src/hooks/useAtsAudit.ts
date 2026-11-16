import { useMemo } from 'react';
import type { ResumeData } from '../types/resume';
import type { JdAnalysisState, AtsAuditResult } from '../types/ats';
import { extractJdKeywords } from '../engine/ats/keywordExtractor';
import { evaluateResumeAts } from '../engine/ats/scorer';
import { termInText } from '../engine/ats/taxonomy';

/**
 * Hook: compute legacy jdAnalysis (for keyword pills) and full ATS audit.
 */
export function useAtsAudit(
  resume: ResumeData,
  jdInput: string
): { jdAnalysis: JdAnalysisState; atsAudit: AtsAuditResult } {
  const fullResumeText = useMemo(() => {
    return [
      resume.header.title,
      resume.summary,
      ...resume.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
      ...resume.skillGroups.flatMap((s) => [s.category, ...s.lines]),
      ...resume.certifications,
    ]
      .join(' ')
      .toLowerCase();
  }, [resume]);

  const jdAnalysis: JdAnalysisState = useMemo(() => {
    if (!jdInput.trim()) {
      return { score: 100, matched: [], missing: [], allKeywords: [], bulletScores: {} };
    }

    const extracted = extractJdKeywords(jdInput);
    const allKeywords = extracted.allKeywords;
    const matched: string[] = [];
    const missing: string[] = [];

    allKeywords.forEach((kw) => {
      if (termInText(kw, fullResumeText)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const score =
      allKeywords.length > 0
        ? Math.round((matched.length / allKeywords.length) * 100)
        : 100;

    const bulletScores: Record<string, number[]> = {};
    resume.experience.forEach((exp) => {
      bulletScores[exp.id] = exp.bullets.map((b) => {
        const bLower = b.toLowerCase();
        return allKeywords.filter((k) => bLower.includes(k.toLowerCase())).length;
      });
    });

    return { score, matched, missing, allKeywords, bulletScores };
  }, [jdInput, fullResumeText, resume.experience]);

  const atsAudit: AtsAuditResult = useMemo(() => {
    return evaluateResumeAts(resume, jdInput);
  }, [resume, jdInput]);

  return { jdAnalysis, atsAudit };
}
