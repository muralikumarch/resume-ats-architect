import { Plus, Trash2 } from 'lucide-react';
import { useResumeStore } from '../../store/resumeStore';
import { useSettingsStore } from '../../store/settingsStore';

export default function VersionManager() {
  const { savedVersions, loadVersion, deleteVersion, newVersionName, setNewVersionName, saveVersion } = useResumeStore();
  const { showToast } = useSettingsStore();

  const handleSave = () => {
    const name = newVersionName.trim() || `Resume Snapshot ${new Date().toLocaleDateString()}`;
    saveVersion(name, 0, '');
    showToast(`Saved: "${name}"`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Save Current Snapshot</h3>
        <div className="flex gap-2">
          <input type="text" value={newVersionName} onChange={(e) => setNewVersionName(e.target.value)}
            placeholder="e.g. JPMorgan Principal Architect v1"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
          <button onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {savedVersions.map((ver) => (
          <div key={ver.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">{ver.name}</div>
              <div className="text-[11px] text-slate-400">Target: {ver.targetCompany} • {ver.updatedAt}</div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                ATS: {ver.score}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { loadVersion(ver.id); showToast(`Loaded "${ver.name}"`); }}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium">
                Load
              </button>
              {ver.id !== 'v-master' && (
                <button onClick={() => deleteVersion(ver.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
