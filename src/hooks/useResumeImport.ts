/**
 * useResumeImport — orchestrates file parsing for PDF and DOCX uploads.
 * Extracts plain text and merges parsed contact/summary into the existing ResumeData.
 */

import { useState, useCallback } from 'react';
import * as mammoth from 'mammoth';
import type { ResumeData } from '../types/resume';
import { useResumeStore } from '../store/resumeStore';

interface ImportResult {
  success: boolean;
  error?: string;
  text?: string;
}

// ── heuristic text → partial ResumeData ──────────────────────────────────────

function parseTextToPartial(text: string, existing: ResumeData): Partial<ResumeData> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const nameLine = lines[0] ?? existing.header.name;
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);

  // Extract summary: paragraph between contact block and "Experience"
  const expIdx = lines.findIndex(l => /experience|work history/i.test(l));
  const summaryLines: string[] = [];
  for (let i = 2; i < Math.min(expIdx === -1 ? 10 : expIdx, 10); i++) {
    const line = lines[i];
    if (line && line.length > 40 && !/^\d/.test(line)) {
      summaryLines.push(line);
      if (summaryLines.length >= 3) break;
    }
  }

  return {
    header: {
      ...existing.header,
      name: nameLine,
      email: emailMatch ? emailMatch[0] : existing.header.email,
      phone: phoneMatch ? phoneMatch[0] : existing.header.phone,
      linkedin: linkedinMatch ? linkedinMatch[0] : existing.header.linkedin,
    },
    summary: summaryLines.join(' ') || existing.summary,
  };
}

// ── PDF extraction via pdf.js ─────────────────────────────────────────────────

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const texts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as Array<{ str?: string }>)
      .map(item => item.str ?? '')
      .join(' ');
    texts.push(pageText);
  }

  return texts.join('\n');
}

// ── DOCX extraction via mammoth ───────────────────────────────────────────────

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useResumeImport() {
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);

  const resume = useResumeStore(s => s.resume);
  const setResume = useResumeStore(s => s.setResume);

  const importFile = useCallback(
    async (file: File): Promise<ImportResult> => {
      setImporting(true);
      setImportError(null);

      try {
        let text = '';

        if (file.name.toLowerCase().endsWith('.pdf')) {
          text = await extractPdfText(file);
        } else if (
          file.name.toLowerCase().endsWith('.docx') ||
          file.name.toLowerCase().endsWith('.doc')
        ) {
          text = await extractDocxText(file);
        } else if (file.name.toLowerCase().endsWith('.txt')) {
          text = await file.text();
        } else {
          throw new Error('Unsupported file type. Upload a PDF, DOCX, or TXT file.');
        }

        setRawText(text);
        const partial = parseTextToPartial(text, resume);
        setResume({ ...resume, ...partial });

        setImporting(false);
        return { success: true, text };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown import error';
        setImportError(message);
        setImporting(false);
        return { success: false, error: message };
      }
    },
    [resume, setResume],
  );

  const clearError = useCallback(() => setImportError(null), []);

  return { importFile, importing, importError, rawText, clearError };
}
