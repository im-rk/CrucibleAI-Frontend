import React, { useMemo, useState } from 'react';
import {
  Candidate, CandidateStatus, CriterionResult, CriterionStatus, KRRPrediction, MaterialProperty,
} from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  ArrowDown, ArrowUp, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, HelpCircle, Layers,
  MinusCircle, Info, XCircle,
} from 'lucide-react';
import { SortKey, sortCandidates } from '../../utils/candidates';

interface CandidatesTableProps {
  candidates: Candidate[];
  propertyRecords: Record<string, MaterialProperty[]>;
  krrPredictions: Record<string, KRRPrediction>;
}

const STATUS_BADGE: Record<CandidateStatus, { variant: 'emerald' | 'amber' | 'rose' | 'slate'; label: string }> = {
  qualified: { variant: 'emerald', label: 'Qualified' },
  partial: { variant: 'amber', label: 'Partial' },
  rejected: { variant: 'rose', label: 'Rejected' },
  unscreened: { variant: 'slate', label: 'Unscreened' },
};
const CRITERION_ICON: Record<CriterionStatus, { icon: React.ElementType; className: string; text: string }> = {
  met: { icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400', text: 'Met' },
  not_met: { icon: XCircle, className: 'text-rose-600 dark:text-rose-400', text: 'Not met' },
  missing: { icon: HelpCircle, className: 'text-slate-500', text: 'No data' },
  predicted_met: { icon: Info, className: 'text-indigo-600 dark:text-indigo-400', text: 'Predicted to meet (ML estimate)' },
  predicted_not_met: { icon: Info, className: 'text-rose-500', text: 'Predicted not to meet (ML estimate)' },
  unverified: { icon: MinusCircle, className: 'text-slate-500', text: 'Cannot be verified from data' },
};

function formatValue(value: number | null, unit: string): string {
  if (value === null) return '—';
  const text = Math.abs(value) > 0 && Math.abs(value) < 0.01 ? value.toExponential(2) : String(Math.round(value * 1e4) / 1e4);
  return `${text} ${unit}`.trim();
}

const CriterionIcon: React.FC<{ result: CriterionResult }> = ({ result }) => {
  const { icon: Icon, className, text } = CRITERION_ICON[result.status];
  return (
    <span title={`${result.label}: ${text}`} aria-label={`${result.label}: ${text}`}>
      <Icon className={`w-4 h-4 ${className}`} />
    </span>
  );
};

export const CandidatesTable: React.FC<CandidatesTableProps> = ({ candidates, propertyRecords, krrPredictions }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [ascending, setAscending] = useState(true);

  const rows = useMemo(() => sortCandidates(candidates, sortKey, ascending), [candidates, sortKey, ascending]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAscending((a) => !a);
    else {
      setSortKey(key);
      setAscending(key !== 'score');
    }
  };

  const header = (key: SortKey, label: string) => (
    <th className="py-3.5 px-4" aria-sort={sortKey === key ? (ascending ? 'ascending' : 'descending') : 'none'}>
      <button onClick={() => toggleSort(key)} className="flex items-center gap-1 uppercase tracking-wider hover:text-cyan-600 dark:hover:text-cyan-400">
        {label}
        {sortKey === key && (ascending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </button>
    </th>
  );

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}>
          Candidates
        </CardTitle>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {candidates.filter((c) => c.status === 'qualified').length} qualified of {candidates.length} screened
        </span>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {candidates.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 font-sans">
            No materials with reported values for the requested properties were found. See the knowledge gaps for what was missing.
          </p>
        ) : (
          <table className="w-full text-left text-sm text-slate-800 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {header('rank', '#')}
                {header('name', 'Material')}
                {header('status', 'Status')}
                <th className="py-3.5 px-4 uppercase tracking-wider">Criteria</th>
                {header('score', 'Score')}
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {rows.map((cand) => {
                const key = cand.formula ?? cand.name;
                const isOpen = expanded === key;
                const status = STATUS_BADGE[cand.status];
                const props = propertyRecords[key] ?? [];
                const krr = krrPredictions[key];
                return (
                  <React.Fragment key={key}>
                    <tr
                      onClick={() => {
                        setExpanded(isOpen ? null : key);
                      }}
                      className="hover:bg-slate-100 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-500">{cand.rank}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {key}
                          </span>
                          {cand.origin === 'database' && (
                            <Badge variant="slate" size="sm">database only</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={status.variant} size="sm">{status.label}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {cand.criteria.length === 0 ? <span className="text-slate-500 text-xs">none</span> : cand.criteria.map((r, i) => <CriterionIcon key={i} result={r} />)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-16 h-2 rounded-sm bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-cyan-600" style={{ width: `${Math.round(cand.score * 100)}%` }} />
                          </div>
                          {cand.score.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {isOpen ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-slate-50 dark:bg-slate-950/90">
                        <td colSpan={6} className="p-4">
                          <div className="space-y-4 text-xs">
                            <table className="w-full">
                              <thead className="text-slate-500 text-[10px] uppercase">
                                <tr>
                                  <th className="text-left py-1 pr-3">Criterion</th>
                                  <th className="text-left py-1 pr-3">Result</th>
                                  <th className="text-left py-1 pr-3">Value</th>
                                  <th className="text-left py-1">Evidence</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {cand.criteria.map((r, i) => (
                                  <tr key={i}>
                                    <td className="py-1.5 pr-3 text-slate-800 dark:text-slate-200 font-sans">{r.label}</td>
                                    <td className="py-1.5 pr-3 whitespace-nowrap">
                                      <span className="inline-flex items-center gap-1"><CriterionIcon result={r} />{CRITERION_ICON[r.status].text}</span>
                                    </td>
                                    <td className="py-1.5 pr-3 whitespace-nowrap">{formatValue(r.value, r.unit)}</td>
                                    <td className="py-1.5 text-slate-500 dark:text-slate-400 font-sans">
                                      {[r.source, r.detail].filter(Boolean).join(': ')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {cand.flags.length > 0 && (
                              <p className="text-amber-700 dark:text-amber-400 font-sans">
                                Flags: {cand.flags.join(', ')}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                                <span className="text-slate-500 uppercase text-[10px]">Reported properties</span>
                                {props.length === 0 && <p className="text-slate-500">none</p>}
                                {props.map((p, i) => (
                                  <p key={i} className="text-slate-800 dark:text-slate-200">
                                    {p.property_name}: {p.value} {p.unit}
                                    {p.is_direct_gap != null && ` (${p.is_direct_gap ? 'direct' : 'indirect'} gap)`}
                                    <span className="text-slate-500"> · {p.source}</span>
                                  </p>
                                ))}
                                {krr && (
                                  <p className="text-indigo-700 dark:text-indigo-300">
                                    KRR band gap: {krr.predicted_value} {krr.unit}
                                    {krr.uncertainty != null && ` ±${krr.uncertainty}`} (estimate)
                                  </p>
                                )}
                              </div>
                              <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                                <span className="text-slate-500 uppercase text-[10px]">Supporting literature</span>
                                {cand.sources.length === 0 && <p className="text-slate-500">none in the retrieved papers</p>}
                                {cand.sources.map((s, i) => (
                                  <p key={i} className="text-slate-800 dark:text-slate-200 font-sans">
                                    {s.title || s.source_id}
                                    {s.source_id && (
                                      <a
                                        href={s.doi ? (s.doi.startsWith('http') ? s.doi : `https://doi.org/${s.doi}`) : `https://arxiv.org/abs/${s.source_id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="ml-2 inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                                      >
                                        open <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};
