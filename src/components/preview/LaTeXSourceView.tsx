import { Code2, Copy, Download, FileText } from 'lucide-react';

interface LaTeXSourceViewProps {
  latexSource: string;
  onCopy: () => void;
  onDownload: () => void;
  onDownloadDocx: () => void;
}

export default function LaTeXSourceView({ latexSource, onCopy, onDownload, onDownloadDocx }: LaTeXSourceViewProps) {
  return (
    <div className="w-full max-w-[880px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">
            Synchronized LaTeX (.tex) — Ready for Overleaf / LuaLaTeX / XeLaTeX
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCopy}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1">
            <Copy className="w-3 h-3" /> Copy
          </button>
          <button onClick={onDownload}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1">
            <Download className="w-3 h-3" /> Download .tex
          </button>
          <button onClick={onDownloadDocx}
            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" /> Download .docx
          </button>
        </div>
      </div>
      <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed select-all whitespace-pre-wrap">
        {latexSource}
      </pre>
    </div>
  );
}
