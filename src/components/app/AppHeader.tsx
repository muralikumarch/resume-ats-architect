import { Sparkles, RefreshCw, Copy, Download, FileText, Printer } from 'lucide-react';
import { useResumeStore } from '../../store/resumeStore';
import { useSettingsStore } from '../../store/settingsStore';

interface AppHeaderProps {
  atsScore: number;
  densityPct: number;
  totalBullets: number;
  onCopyLatex: () => void;
  onDownloadLatex: () => void;
  onDownloadDocx: () => void;
  onDownloadAtsDocx: () => void;
  onPrint: () => void;
}

export default function AppHeader({
  atsScore, densityPct, totalBullets,
  onCopyLatex, onDownloadLatex, onDownloadDocx, onDownloadAtsDocx, onPrint,
}: AppHeaderProps) {
  const resetToInitial = useResumeStore((s) => s.resetToInitial);
  const showToast = useSettingsStore((s) => s.showToast);

  const scoreColor =
    atsScore >= 85 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : atsScore >= 65 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 print:hidden">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white">
              Resume ATS Architect
            </h1>
            <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            100% ATS Compliance · Dual Export · AI-Powered Tailoring
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-950/90 border border-slate-800 px-3.5 py-1.5 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">ATS Score:</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-md border ${scoreColor}`}>
            {atsScore}%
          </span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Page Fit:</span>
          <span className={`text-xs font-semibold ${densityPct <= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {densityPct}% ({totalBullets} bullets)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => { resetToInitial(); showToast('Reset to original baseline resume'); }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition">
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
        <button onClick={onCopyLatex}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition">
          <Copy className="w-3.5 h-3.5 text-blue-400" /> Copy .tex
        </button>
        <button onClick={onDownloadLatex}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition">
          <Download className="w-3.5 h-3.5" /> Export .tex
        </button>
        <button onClick={onDownloadDocx}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition"
          title="Download executive two-column DOCX">
          <FileText className="w-3.5 h-3.5" /> Exec .docx
        </button>
        <button onClick={onDownloadAtsDocx}
          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-teal-600/25 transition"
          title="Download ATS-safe single-column DOCX">
          <FileText className="w-3.5 h-3.5" /> ATS .docx
        </button>
        <button onClick={onPrint}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition">
          <Printer className="w-3.5 h-3.5" /> Print / PDF
        </button>
      </div>
    </header>
  );
}
