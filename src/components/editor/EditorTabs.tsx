import { Sparkles, Sliders, BookmarkCheck } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { JdAnalysisState, AtsAuditResult } from '../../types/ats';
import JdInputPanel from '../tailoring/JdInputPanel';
import AtsScoreGauge from '../audit/AtsScoreGauge';
import VersionManager from '../versions/VersionManager';
import SectionEditor from './SectionEditor';
import { useResumeStore } from '../../store/resumeStore';

interface EditorTabsProps {
  jdAnalysis: JdAnalysisState;
  atsAudit: AtsAuditResult;
}

export default function EditorTabs({ jdAnalysis, atsAudit }: EditorTabsProps) {
  const { activeTab, setActiveTab } = useSettingsStore();
  const { savedVersions } = useResumeStore();

  const tabs = [
    { id: 'jd-agent' as const, label: 'JD Tailoring Agent', icon: Sparkles },
    { id: 'editor' as const, label: 'Resume Editor', icon: Sliders },
    { id: 'versions' as const, label: `Saved JDs (${savedVersions.length})`, icon: BookmarkCheck },
  ];

  return (
    <div className="lg:col-span-5 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full overflow-hidden print:hidden">
      {/* Tab bar */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/60 border-b border-slate-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === id
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'jd-agent' && (
          <>
            <AtsScoreGauge audit={atsAudit} />
            <JdInputPanel jdAnalysis={jdAnalysis} />
          </>
        )}
        {activeTab === 'editor' && <SectionEditor />}
        {activeTab === 'versions' && <VersionManager />}
      </div>
    </div>
  );
}
