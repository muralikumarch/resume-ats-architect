import { Layers, ArrowRight, Zap, FolderPlus, AlertCircle, CheckCircle2, Plus, ShieldCheck } from 'lucide-react';
import { useJdStore } from '../../store/jdStore';
import { useResumeStore } from '../../store/resumeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { PRESET_JDS } from '../../data/presetJds';
import { heuristicTailor, injectKeywordIntoSkills, injectAllMissingKeywords } from '../../engine/tailoring/fallbackRuleTailorer';
import type { JdAnalysisState } from '../../types/ats';

interface JdInputPanelProps {
  jdAnalysis: JdAnalysisState;
}

export default function JdInputPanel({ jdAnalysis }: JdInputPanelProps) {
  const { jdInput, jdRoleTitle, jdCompany, highlightMatches,
    setJdInput, setJdRoleTitle, setJdCompany, setHighlightMatches, loadPreset } = useJdStore();
  const { resume, setResume, saveVersion, newVersionName } = useResumeStore();
  const { showToast } = useSettingsStore();

  const handleAutoTailor = () => {
    const tailored = heuristicTailor(
      resume, jdInput, jdRoleTitle, jdCompany,
      jdAnalysis.matched, jdAnalysis.allKeywords
    );
    setResume(tailored);
    showToast('Tailored headline, summary & prioritized JD-matching bullets!');
  };

  const handleSaveVersion = () => {
    const title = newVersionName.trim() || `${jdRoleTitle || resume.header.title} (${jdCompany || 'Custom JD'})`;
    saveVersion(title, jdAnalysis.score, jdCompany);
    showToast(`Saved resume version: "${title}"`);
  };

  const handleInjectOne = (kw: string) => {
    const updated = injectKeywordIntoSkills(resume.skillGroups, kw);
    setResume({ ...resume, skillGroups: updated });
    showToast(`Added "${kw}" to Backend & AI Engineering skills!`);
  };

  const handleInjectAll = () => {
    const updated = injectAllMissingKeywords(resume.skillGroups, jdAnalysis.missing);
    setResume({ ...resume, skillGroups: updated });
    showToast(`Injected ${jdAnalysis.missing.length} missing keywords into Skills!`);
  };

  return (
    <div className="space-y-4">
      {/* Preset JDs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" /> Sample Target JDs
          </span>
          <span className="text-[11px] text-slate-500">1-Click Load</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESET_JDS.map((p) => (
            <button key={p.id} onClick={() => { loadPreset(p.id); showToast(`Loaded "${p.title}" JD`); }}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition flex items-center justify-between ${
                jdInput === p.text
                  ? 'bg-blue-600/15 border-blue-500/50 text-blue-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}>
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-[11px] text-slate-400">{p.company}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* JD Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Role Title</label>
            <input type="text" value={jdRoleTitle} onChange={(e) => setJdRoleTitle(e.target.value)}
              placeholder="e.g. Principal Solution Architect"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Company</label>
            <input type="text" value={jdCompany} onChange={(e) => setJdCompany(e.target.value)}
              placeholder="e.g. JPMorgan / Microsoft"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-slate-400">Paste Job Description</label>
            <button onClick={() => setJdInput('')} className="text-[11px] text-slate-500 hover:text-slate-300">Clear JD</button>
          </div>
          <textarea rows={5} value={jdInput} onChange={(e) => setJdInput(e.target.value)}
            placeholder="Paste any Job Description here to extract ATS keywords, calculate match score, and auto-tailor your resume..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={handleAutoTailor}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 transition">
            <Zap className="w-4 h-4" /> Auto-Tailor Summary, Title & Reorder Bullets
          </button>
          <button onClick={handleSaveVersion}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs py-2.5 px-3 rounded-lg border border-slate-700 flex items-center gap-1.5 transition">
            <FolderPlus className="w-4 h-4 text-blue-400" /> Save Version
          </button>
        </div>
      </div>

      {/* ATS Keyword Gap Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> ATS Keyword Match
          </h3>
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={highlightMatches} onChange={(e) => setHighlightMatches(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-0" />
            Highlight on Resume
          </label>
        </div>

        {/* Missing */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Missing ({jdAnalysis.missing.length})
            </span>
            {jdAnalysis.missing.length > 0 && (
              <button onClick={handleInjectAll}
                className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded font-medium transition">
                + Inject All into Skills
              </button>
            )}
          </div>
          {jdAnalysis.missing.length === 0 ? (
            <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-2">
              100% of JD keywords are in your resume!
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {jdAnalysis.missing.map((kw) => (
                <button key={kw} onClick={() => handleInjectOne(kw)}
                  className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-1 transition"
                  title="Click to inject into Skills">
                  <Plus className="w-3 h-3" /> {kw}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Matched */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Matched ({jdAnalysis.matched.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {jdAnalysis.matched.map((kw) => (
              <span key={kw} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px]">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
