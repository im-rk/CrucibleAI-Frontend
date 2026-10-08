import React from 'react';
import { Investigation } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';

/** How the investigator agent tried to close evidence gaps: each tool it chose, and what came back. */
export const InvestigationPanel: React.FC<{ investigation: Investigation }> = ({ investigation }) => {
  const steps = investigation.steps ?? [];
  if (investigation.targets.length === 0 && steps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence gaps investigated</CardTitle>
        <Badge variant={investigation.mode === 'agent' ? 'emerald' : 'slate'} size="sm">
          {investigation.mode === 'agent' ? 'agent chose its own tool calls' : 'fixed search workflow'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-slate-700 dark:text-slate-300">
          Candidates with no literature behind them or a missing value: <strong>{investigation.targets.join(', ')}</strong>.
          {' '}Found {investigation.new_passages ?? 0} new passage(s) and {investigation.new_records ?? 0} new value(s)
          {investigation.supported && investigation.supported.length > 0
            ? `; literature now supports ${investigation.supported.join(', ')}, so they were screened again.`
            : '; nothing new for these candidates.'}
        </p>

        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.n} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4">
              <p className="text-slate-600 dark:text-slate-400 italic">{s.thought}</p>
              <p className="mt-1">
                <span className="font-mono text-xs text-cyan-700 dark:text-cyan-400">
                  {s.action}({Object.values(s.arguments).join(', ')})
                </span>
                {s.ok === false && <span className="ml-2 text-xs text-rose-600 dark:text-rose-400">failed</span>}
              </p>
              {s.observation && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 whitespace-pre-line">{s.observation}</p>
              )}
            </li>
          ))}
        </ol>

        {investigation.answer && (
          <p className="text-slate-700 dark:text-slate-300">
            <span className="text-xs uppercase tracking-wide text-slate-500">Agent's summary: </span>
            {investigation.answer}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
