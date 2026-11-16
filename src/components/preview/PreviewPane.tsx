import { Eye, Code2, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useJdStore } from '../../store/jdStore';
import type { ResumeData } from '../../types/resume';
import ExecutiveTwoColumnSheet from './ExecutiveTwoColumnSheet';
import LaTeXSourceView from './LaTeXSourceView';

interface PreviewPaneProps {
  resume: ResumeData;
  latexSource: string;
  matchedKeywords: string[];
  onCopyLatex: () => void;
  onDownloadLatex: () => void;
  onDownloadDocx: () => void;
}

export default function PreviewPane({
  resume, latexSource, matchedKeywords,
  onCopyLatex, onDownloadLatex, onDownloadDocx,
}: PreviewPaneProps) {
  const { rightView, setRightView } = useSettingsStore();
  const { highlightMatches } = useJdStore();

  const renderHighlightedText = (text: string): React.ReactNode => {
    if (!highlightMatches || matchedKeywords.length === 0) return text;
    const sorted = [...matchedKeywords].sort((a, b) => b.length - a.length);
    const escaped = sorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const isMatch = sorted.some((k) => k.toLowerCase() === part.toLowerCase());
      return isMatch
        ? <mark key={i} className="bg-amber-200/80 text-slate-900 px-0.5 rounded font-semibold print:bg-transparent">{part}</mark>
        : part;
    });
  };

  return (
    <div className="lg:col-span-7 bg-slate-950 flex flex-col h-full overflow-hidden">
      {/* Toggle bar */}
      <div className="bg-slate-900/70 border-b border-slate-800 px-4 py-2 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <ViewBtn icon={<Eye className="w-3.5 h-3.5" />} label="Executive 2-Col" view="preview-executive" current={rightView} onClick={() => setRightView('preview-executive')} />
          <ViewBtn icon={<ShieldCheck className="w-3.5 h-3.5" />} label="ATS Single-Col" view="preview-ats" current={rightView} onClick={() => setRightView('preview-ats')} />
          <ViewBtn icon={<Code2 className="w-3.5 h-3.5" />} label="LaTeX Source" view="latex" current={rightView} onClick={() => setRightView('latex')} />
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
          <span>Geometry: 1.1cm margin</span><span>•</span>
          <span>Column Ratio: 72% / 28%</span><span>•</span>
          <span>Font: Noto Sans</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950 print:p-0 print:bg-white">
        {rightView === 'preview-executive' && (
          <ExecutiveTwoColumnSheet resume={resume} renderHighlightedText={renderHighlightedText} />
        )}
        {rightView === 'preview-ats' && (
          <AtsSafePreview resume={resume} renderHighlightedText={renderHighlightedText} />
        )}
        {rightView === 'latex' && (
          <LaTeXSourceView
            latexSource={latexSource}
            onCopy={onCopyLatex}
            onDownload={onDownloadLatex}
            onDownloadDocx={onDownloadDocx}
          />
        )}
      </div>
    </div>
  );
}

function ViewBtn({ icon, label, view, current, onClick }: {
  icon: React.ReactNode; label: string; view: string; current: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
        current === view ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
      }`}>
      {icon}{label}
    </button>
  );
}

function AtsSafePreview({ resume, renderHighlightedText }: {
  resume: ResumeData;
  renderHighlightedText: (text: string) => React.ReactNode;
}) {
  const { header, summary, experience, education, skillGroups, certifications } = resume;
  return (
    <div className="w-full max-w-[750px] bg-white text-[#1a1a1a] shadow-2xl rounded-sm px-12 py-10 print:shadow-none"
      style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', lineHeight: 1.4 }}>
      <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="text-2xl font-bold text-black">{header.name}</h1>
        <div className="text-sm font-bold text-gray-700 mt-0.5">{header.title}</div>
        <div className="text-xs text-gray-600 mt-1">
          {header.location} · {header.phone} · {header.email} · {header.linkedin}
        </div>
      </div>

      <AtsSection title="PROFESSIONAL SUMMARY">
        <p className="text-sm text-justify">{renderHighlightedText(summary)}</p>
      </AtsSection>

      <AtsSection title="WORK EXPERIENCE">
        {experience.map((job) => (
          <div key={job.id} className="mb-3">
            <div className="flex justify-between">
              <strong className="text-sm">{job.role}</strong>
              <span className="text-xs text-gray-600">{job.period}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">{job.company}</span>
              <span className="text-xs text-gray-500">{job.location}</span>
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {job.bullets.map((b, i) => (
                <li key={i} className="text-xs text-justify">{renderHighlightedText(b)}</li>
              ))}
            </ul>
          </div>
        ))}
      </AtsSection>

      <AtsSection title="SKILLS">
        {skillGroups.map((sg) => (
          <div key={sg.id} className="mb-1 text-xs">
            <strong>{sg.category}: </strong>{sg.lines.join(' | ')}
          </div>
        ))}
      </AtsSection>

      <AtsSection title="EDUCATION">
        {education.map((ed) => (
          <div key={ed.id} className="mb-1 text-sm">
            <strong>{ed.degree}</strong> — {ed.school} {ed.year && `(${ed.year})`}
          </div>
        ))}
      </AtsSection>

      <AtsSection title="CERTIFICATIONS">
        <ul className="list-disc pl-5 space-y-0.5">
          {certifications.map((c, i) => <li key={i} className="text-xs">{c}</li>)}
        </ul>
      </AtsSection>
    </div>
  );
}

function AtsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-black uppercase border-b border-black mb-1 tracking-wide">{title}</h2>
      {children}
    </div>
  );
}
