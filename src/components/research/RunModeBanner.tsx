import React, { useState } from 'react';
import { RunMode } from '../../types/api';
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface RunModeBannerProps {
  mode: RunMode;
  warnings: string[];
}

/**
 * Says plainly what the run used. Heuristic mode (no LLM) and the offline materials table are
 * degraded modes, and the results should not be read as if they came from the full pipeline.
 */
export const RunModeBanner: React.FC<RunModeBannerProps> = ({ mode, warnings }) => {
  const [open, setOpen] = useState(false);
  const degraded = mode.llm === null || mode.materials_project === 'offline';

  return (
    <Card className={degraded ? 'border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'}>
      <CardContent className="py-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {degraded ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          )}
          <span className="font-semibold text-slate-900 dark:text-slate-100">Run mode</span>
          <Badge variant={mode.llm ? 'emerald' : 'amber'} size="sm">
            {mode.llm ? `LLM: ${mode.llm}` : 'No LLM: heuristic mode'}
          </Badge>
          <Badge variant={mode.materials_project === 'live' ? 'emerald' : 'amber'} size="sm">
            {mode.materials_project === 'live' ? 'Materials Project: live' : 'Materials data: offline reference table'}
          </Badge>
          {warnings.length > 0 && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-auto flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline"
              aria-expanded={open}
            >
              {warnings.length} warning{warnings.length === 1 ? '' : 's'}
              {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {degraded && (
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
            {mode.llm === null && 'Extraction, criteria parsing and hypotheses used simple rules instead of a language model, so they are less complete and lower confidence. '}
            {mode.materials_project === 'offline' && 'Only a small table of well-known band gaps was available for database cross-checks. '}
            Add <code className="font-mono">ANTHROPIC_API_KEY</code> and <code className="font-mono">MATERIALS_PROJECT_API_KEY</code> to the backend to enable the full pipeline.
          </p>
        )}

        {open && warnings.length > 0 && (
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-sans list-disc pl-5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
