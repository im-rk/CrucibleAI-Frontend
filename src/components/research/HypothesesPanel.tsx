import React from 'react';
import { Confidence, Grounding, Hypothesis } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { AlertTriangle, ExternalLink, FlaskConical, ShieldCheck, ShieldAlert, Info } from 'lucide-react';

interface HypothesesPanelProps {
  hypotheses: Hypothesis[];
  grounding: Grounding;
}

const CONFIDENCE_VARIANT: Record<Confidence, 'emerald' | 'amber' | 'rose'> = {
  high: 'emerald',
  medium: 'amber',
  low: 'rose',
};

function evidenceHref(source: { doi: string; source_id: string }): string | null {
  if (source.doi) return source.doi.startsWith('http') ? source.doi : `https://doi.org/${source.doi}`;
  if (/^\d/.test(source.source_id)) return `https://arxiv.org/abs/${source.source_id}`;
  return null;
}

export const HypothesesPanel: React.FC<HypothesesPanelProps> = ({ hypotheses, grounding }) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<FlaskConical className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>
          Hypotheses
        </CardTitle>
        <Badge
          variant={grounding.is_grounded ? 'emerald' : 'rose'}
          size="sm"
          icon={grounding.is_grounded ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
        >
          {grounding.checked === 0
            ? 'nothing to verify'
            : grounding.is_grounded
              ? `grounded ${Math.round(grounding.score * 100)}% (${grounding.method})`
              : `${grounding.unsupported} unsupported`}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {hypotheses.length === 0 && (
          <p className="text-sm text-slate-500 font-sans">
            No hypotheses could be generated from the available evidence. The knowledge gaps list what was missing.
          </p>
        )}

        {hypotheses.map((h, i) => (
          <article
            key={i}
            className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-500">H{i + 1}</span>
              <Badge variant={CONFIDENCE_VARIANT[h.confidence]} size="sm">{h.confidence} confidence</Badge>
              {h.origin === 'template' && (
                <Badge variant="slate" size="sm" icon={<Info className="w-3 h-3" />}>template, not model reasoning</Badge>
              )}
              {h.grounded === false && (
                <Badge variant="rose" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>not supported by its evidence</Badge>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-sans leading-relaxed">{h.statement}</p>

            <div className="text-xs font-sans space-y-1">
              <p className="text-slate-500 uppercase text-[10px] tracking-wide">Evidence</p>
              {h.evidence.length === 0 ? (
                <p className="text-rose-600 dark:text-rose-400">No cited evidence.</p>
              ) : (
                <ul className="space-y-1">
                  {h.evidence.map((e) => {
                    const href = evidenceHref(e);
                    return (
                      <li key={e.id} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="font-mono text-cyan-700 dark:text-cyan-400 shrink-0">{e.id}</span>
                        <span className="line-clamp-2">{e.snippet}</span>
                        {href && (
                          <a href={href} target="_blank" rel="noreferrer" className="shrink-0 text-cyan-600 dark:text-cyan-400 hover:underline" aria-label={`Open source for ${e.id}`}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {h.unsupported_ids && h.unsupported_ids.length > 0 && (
                <p className="text-amber-700 dark:text-amber-400">
                  Cited unknown evidence ({h.unsupported_ids.join(', ')}); ignored.
                </p>
              )}
            </div>

            <div className="text-xs font-sans p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <span className="font-mono text-[10px] uppercase tracking-wide text-cyan-700 dark:text-cyan-400">Suggested experiment</span>
              <p className="mt-1 text-slate-800 dark:text-slate-200">{h.suggested_experiment}</p>
            </div>

            {h.grounding_note && <p className="text-[11px] text-slate-500">Grounding: {h.grounding_note}</p>}
          </article>
        ))}
      </CardContent>
    </Card>
  );
};
