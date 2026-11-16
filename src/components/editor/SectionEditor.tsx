import { User, FileText, Briefcase, Settings, Award, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useResumeStore } from '../../store/resumeStore';
import { PRESET_JDS } from '../../data/presetJds';

export default function SectionEditor() {
  const { editorSection, setEditorSection } = useSettingsStore();
  const { resume, updateHeader, updateSummary, updateExperience, updateSkillGroups, updateEducation, updateCertifications } = useResumeStore();
  const { showToast } = useSettingsStore();

  const sectionTabs = [
    { id: 'header' as const, label: 'Header', icon: User },
    { id: 'summary' as const, label: 'Summary', icon: FileText },
    { id: 'experience' as const, label: 'Experience', icon: Briefcase },
    { id: 'skills' as const, label: 'Skills', icon: Settings },
    { id: 'edu-certs' as const, label: 'Edu & Certs', icon: Award },
  ];

  return (
    <div className="space-y-4">
      {/* Section nav */}
      <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
        {sectionTabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setEditorSection(id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              editorSection === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Header */}
      {editorSection === 'header' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Header & Contact</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { label: 'Full Name', field: 'name' as const },
              { label: 'Target Role Headline', field: 'title' as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
                <input type="text" value={resume.header[field]} onChange={(e) => updateHeader({ [field]: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Location', field: 'location' as const },
                { label: 'Phone', field: 'phone' as const },
                { label: 'Email', field: 'email' as const },
                { label: 'LinkedIn Handle', field: 'linkedin' as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
                  <input type="text" value={resume.header[field]} onChange={(e) => updateHeader({ [field]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {editorSection === 'summary' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Professional Summary</h3>
            <span className="text-[11px] text-slate-400">{resume.summary.length} chars</span>
          </div>
          <textarea rows={8} value={resume.summary} onChange={(e) => updateSummary(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500" />
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400">Quick Preset Summaries:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_JDS.map((p) => (
                <button key={p.id} onClick={() => {
                  updateSummary(p.tailoredSummary);
                  updateHeader({ title: p.targetRole });
                  showToast(`Applied ${p.title} summary`);
                }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 transition">
                  {p.title.split(' ')[0]} Summary
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Experience */}
      {editorSection === 'experience' && (
        <div className="space-y-3">
          {resume.experience.map((exp, expIdx) => (
            <div key={exp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: exp.role, field: 'role', cls: 'font-semibold text-white', ph: 'Role Title' },
                  { val: exp.period, field: 'period', cls: 'text-slate-300', ph: 'Period' },
                  { val: exp.company, field: 'company', cls: 'text-blue-300', ph: 'Company' },
                  { val: exp.location, field: 'location', cls: 'text-slate-400', ph: 'Location' },
                ].map(({ val, field, cls, ph }) => (
                  <input key={field} type="text" value={val}
                    onChange={(e) => {
                      const next = [...resume.experience];
                      next[expIdx] = { ...exp, [field]: e.target.value };
                      updateExperience(next);
                    }}
                    className={`bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs ${cls} focus:outline-none focus:border-blue-500`}
                    placeholder={ph} />
                ))}
              </div>
              <div className="space-y-2 pt-1">
                {exp.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-1.5">
                    <textarea rows={2} value={b}
                      onChange={(e) => {
                        const next = [...resume.experience];
                        const nextBullets = [...exp.bullets];
                        nextBullets[bIdx] = e.target.value;
                        next[expIdx] = { ...exp, bullets: nextBullets };
                        updateExperience(next);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 leading-snug focus:outline-none focus:border-blue-500" />
                    <div className="flex flex-col gap-1">
                      <button onClick={() => {
                        if (bIdx === 0) return;
                        const next = [...resume.experience];
                        const nb = [...exp.bullets]; [nb[bIdx - 1], nb[bIdx]] = [nb[bIdx], nb[bIdx - 1]];
                        next[expIdx] = { ...exp, bullets: nb }; updateExperience(next);
                      }} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400" title="Move Up">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => {
                        if (bIdx === exp.bullets.length - 1) return;
                        const next = [...resume.experience];
                        const nb = [...exp.bullets]; [nb[bIdx + 1], nb[bIdx]] = [nb[bIdx], nb[bIdx + 1]];
                        next[expIdx] = { ...exp, bullets: nb }; updateExperience(next);
                      }} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400" title="Move Down">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button onClick={() => {
                        const next = [...resume.experience];
                        next[expIdx] = { ...exp, bullets: exp.bullets.filter((_, i) => i !== bIdx) };
                        updateExperience(next);
                      }} className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300" title="Remove">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                  const next = [...resume.experience];
                  next[expIdx] = { ...exp, bullets: [...exp.bullets, 'Architected scalable enterprise modules aligned with target JD requirements.'] };
                  updateExperience(next);
                }} className="w-full py-1.5 rounded-lg border border-dashed border-slate-700 hover:border-blue-500 text-xs text-blue-400 flex items-center justify-center gap-1 transition">
                  <Plus className="w-3.5 h-3.5" /> Add Achievement Bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {editorSection === 'skills' && (
        <div className="space-y-3">
          {resume.skillGroups.map((sg, sgIdx) => (
            <div key={sg.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
              <input type="text" value={sg.category}
                onChange={(e) => {
                  const next = [...resume.skillGroups]; next[sgIdx] = { ...sg, category: e.target.value };
                  updateSkillGroups(next);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-bold text-blue-300 focus:outline-none focus:border-blue-500" />
              <textarea rows={sg.lines.length > 1 ? 3 : 2} value={sg.lines.join('\n')}
                onChange={(e) => {
                  const next = [...resume.skillGroups]; next[sgIdx] = { ...sg, lines: e.target.value.split('\n') };
                  updateSkillGroups(next);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 leading-snug focus:outline-none focus:border-blue-500"
                placeholder="One line per LaTeX line break (\)" />
            </div>
          ))}
        </div>
      )}

      {/* Education & Certs */}
      {editorSection === 'edu-certs' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Education</h3>
            {resume.education.map((ed, idx) => (
              <div key={ed.id} className="grid grid-cols-1 gap-1.5">
                <input type="text" value={ed.degree}
                  onChange={(e) => { const next = [...resume.education]; next[idx] = { ...ed, degree: e.target.value }; updateEducation(next); }}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-blue-500" />
                <input type="text" value={ed.school}
                  onChange={(e) => { const next = [...resume.education]; next[idx] = { ...ed, school: e.target.value }; updateEducation(next); }}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Certifications (one per line)</h3>
            <textarea rows={10} value={resume.certifications.join('\n')}
              onChange={(e) => updateCertifications(e.target.value.split('\n'))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}
