import { useMemo } from 'react';
import { useResumeStore } from './store/resumeStore';
import { useJdStore } from './store/jdStore';
import { useSettingsStore } from './store/settingsStore';
import { useAtsAudit } from './hooks/useAtsAudit';
import { useExport } from './hooks/useExport';
import AppHeader from './components/app/AppHeader';
import Toast from './components/app/Toast';
import EditorTabs from './components/editor/EditorTabs';
import PreviewPane from './components/preview/PreviewPane';

export default function App() {
  const resume = useResumeStore((s) => s.resume);
  const { jdInput } = useJdStore();
  const { toast } = useSettingsStore();

  const { jdAnalysis, atsAudit } = useAtsAudit(resume, jdInput);
  const { latexSource, handleCopyLatex, handleDownloadLatex, handleDownloadDocx, handleDownloadAtsDocx, handlePrint } =
    useExport();

  const densityMetrics = useMemo(() => {
    const totalBullets = resume.experience.reduce((acc, e) => acc + e.bullets.length, 0);
    const charCount = [
      resume.summary,
      ...resume.experience.flatMap((e) => e.bullets),
      ...resume.skillGroups.flatMap((s) => s.lines),
    ].join(' ').length;
    const pct = Math.min(108, Math.round((charCount / 5900) * 100));
    return { totalBullets, pct };
  }, [resume]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {toast && <Toast message={toast} />}

      <AppHeader
        atsScore={atsAudit.overallScore}
        densityPct={densityMetrics.pct}
        totalBullets={densityMetrics.totalBullets}
        onCopyLatex={handleCopyLatex}
        onDownloadLatex={handleDownloadLatex}
        onDownloadDocx={handleDownloadDocx}
        onDownloadAtsDocx={handleDownloadAtsDocx}
        onPrint={handlePrint}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <EditorTabs jdAnalysis={jdAnalysis} atsAudit={atsAudit} />
        <PreviewPane
          resume={resume}
          latexSource={latexSource}
          matchedKeywords={jdAnalysis.matched}
          onCopyLatex={handleCopyLatex}
          onDownloadLatex={handleDownloadLatex}
          onDownloadDocx={handleDownloadDocx}
        />
      </div>
    </div>
  );
}
