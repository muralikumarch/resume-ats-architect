import { useCallback } from 'react';
import { generateLatexCode } from '../engine/exporters/latexGenerator';
import { useResumeStore } from '../store/resumeStore';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Provides all export action handlers used by AppHeader.
 */
export function useExport() {
  const resume = useResumeStore((s) => s.resume);
  const showToast = useSettingsStore((s) => s.showToast);

  const latexSource = generateLatexCode(resume);
  const cleanRole = resume.header.title.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanName = resume.header.name.split(' ').slice(0, 3).join('_');
  const baseFilename = `${cleanName}_${cleanRole}`;

  const handleCopyLatex = useCallback(() => {
    try {
      navigator.clipboard.writeText(latexSource);
      showToast('Copied LaTeX (.tex) code to clipboard!');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = latexSource;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied LaTeX (.tex) code to clipboard!');
    }
  }, [latexSource, showToast]);

  const handleDownloadLatex = useCallback(() => {
    const blob = new Blob([latexSource], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFilename}.tex`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded tailored .tex file!');
  }, [latexSource, baseFilename, showToast]);

  const handleDownloadDocx = useCallback(async () => {
    try {
      const { buildDocxFromResume } = await import('../engine/exporters/docxTwoColumn');
      const blob = buildDocxFromResume(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFilename}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded tailored .docx Word file!');
    } catch {
      showToast('Error generating .docx file');
    }
  }, [resume, baseFilename, showToast]);

  const handleDownloadAtsDocx = useCallback(async () => {
    try {
      const { buildAtsSingleColumnDocx } = await import('../engine/exporters/docxSingleColumn');
      const blob = buildAtsSingleColumnDocx(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFilename}_ATS.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded ATS single-column .docx file!');
    } catch {
      showToast('Error generating ATS .docx file');
    }
  }, [resume, baseFilename, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { latexSource, handleCopyLatex, handleDownloadLatex, handleDownloadDocx, handleDownloadAtsDocx, handlePrint };
}

