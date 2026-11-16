import type { AtsAuditResult } from '../../types/ats';

interface AtsScoreGaugeProps {
  audit: AtsAuditResult;
}

export default function AtsScoreGauge({ audit }: AtsScoreGaugeProps) {
  const { overallScore, pillarScores } = audit;

  const scoreColor =
    overallScore >= 85 ? 'text-emerald-400' :
    overallScore >= 65 ? 'text-amber-400' : 'text-rose-400';

  const pillars = [
    { label: 'Keyword Match', score: pillarScores.keywords, weight: '40%' },
    { label: 'Bullet Impact', score: pillarScores.bulletImpact, weight: '25%' },
    { label: 'Parseability', score: pillarScores.parseability, weight: '20%' },
    { label: 'Date Hygiene', score: pillarScores.hygiene, weight: '10%' },
    { label: 'Structure', score: pillarScores.structure, weight: '5%' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">ATS Compliance Score</h3>
        <span className={`text-2xl font-black ${scoreColor}`}>{overallScore}<span className="text-sm font-normal text-slate-400">/100</span></span>
      </div>

      <div className="space-y-2">
        {pillars.map((p) => {
          const pColor = p.score >= 80 ? 'bg-emerald-500' : p.score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
          return (
            <div key={p.label}>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">{p.label}</span>
                <span className="text-slate-400">{p.score}% <span className="text-slate-600">({p.weight})</span></span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pColor}`} style={{ width: `${p.score}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {audit.suggestions.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Top Suggestions</span>
          {audit.suggestions.slice(0, 3).map((s, i) => (
            <div key={i} className={`text-[11px] px-2 py-1.5 rounded-lg border ${
              s.severity === 'critical' ? 'bg-rose-950/40 border-rose-800/50 text-rose-300' :
              s.severity === 'warning' ? 'bg-amber-950/40 border-amber-800/50 text-amber-300' :
              'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              {s.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
