/**
 * ResumeDropzone — drag-and-drop / click-to-upload resume import component.
 * Accepts .pdf, .docx, .doc, .txt files and delegates parsing to useResumeImport.
 */

import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useResumeImport } from '../../hooks/useResumeImport';

const ACCEPT = '.pdf,.docx,.doc,.txt';
const MAX_MB = 10;

export function ResumeDropzone() {
  const { importFile, importing, importError, clearError } = useResumeImport();
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setSuccess(false);
      clearError();

      if (file.size > MAX_MB * 1024 * 1024) {
        alert(`File is too large (max ${MAX_MB} MB).`);
        return;
      }

      const result = await importFile(file);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    },
    [importFile, clearError],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';   // reset so same file can be re-uploaded
    },
    [handleFile],
  );

  return (
    <div className="w-full">
      <label htmlFor="resume-file-input">
        <div
          role="button"
          tabIndex={0}
          className={[
            'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed',
            'p-8 cursor-pointer transition-all duration-200 select-none',
            dragging
              ? 'border-blue-400 bg-blue-950/40 scale-[1.01]'
              : 'border-slate-600 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800',
            importing ? 'pointer-events-none opacity-70' : '',
          ].join(' ')}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('resume-file-input')?.click(); }}
        >
          {/* Icon */}
          <div className="rounded-full bg-slate-700 p-3">
            {importing ? (
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            ) : success ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <Upload className="w-6 h-6 text-slate-300" />
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            {importing ? (
              <p className="text-sm text-blue-300 font-medium">Parsing resume…</p>
            ) : success ? (
              <p className="text-sm text-emerald-400 font-medium">Resume imported successfully!</p>
            ) : (
              <>
                <p className="text-sm text-slate-200 font-medium">
                  Drop your resume here or{' '}
                  <span className="text-blue-400 underline underline-offset-2">browse</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">PDF, DOCX, DOC, TXT — max {MAX_MB} MB</p>
              </>
            )}
          </div>

          {/* File type chips */}
          {!importing && !success && (
            <div className="flex gap-2">
              {['PDF', 'DOCX', 'TXT'].map(fmt => (
                <span
                  key={fmt}
                  className="flex items-center gap-1 rounded px-2 py-0.5 bg-slate-700 text-xs text-slate-300"
                >
                  <FileText className="w-3 h-3" />
                  {fmt}
                </span>
              ))}
            </div>
          )}
        </div>
      </label>

      {/* Hidden file input */}
      <input
        id="resume-file-input"
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={onInputChange}
        disabled={importing}
      />

      {/* Error message */}
      {importError && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-900/40 border border-red-700/60 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{importError}</span>
        </div>
      )}
    </div>
  );
}

