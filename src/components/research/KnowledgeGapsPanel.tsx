import React from 'react';
import { Criterion } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { HelpCircle, ListChecks } from 'lucide-react';

interface KnowledgeGapsPanelProps {
  gaps: string[];
  criteria: Criterion[];
  queries: string[];
  retrievalAttempts: number;
}

export const KnowledgeGapsPanel: React.FC<KnowledgeGapsPanelProps> = ({ gaps, criteria, queries, retrievalAttempts }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}>Knowledge Gaps</CardTitle>
        <span className="text-xs text-slate-500">{gaps.length}</span>
      </CardHeader>
      <CardContent>
        {gaps.length === 0 ? (
          <p className="text-sm text-slate-500 font-sans">No gaps detected for the top candidates.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-300 font-sans list-disc pl-5">
            {gaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>

    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<ListChecks className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>What was screened</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div>
          <p className="text-slate-500 uppercase text-[10px] mb-1">Criteria parsed from your goal</p>
          {criteria.length === 0 ? (
            <p className="text-amber-700 dark:text-amber-400 font-sans">No criteria could be parsed, so candidates are unscreened.</p>
          ) : (
            <ul className="space-y-1 text-slate-800 dark:text-slate-200 font-sans">
              {criteria.map((c, i) => (
                <li key={i}>
                  {c.label}
                  {c.kind === 'qualitative' && <span className="text-slate-500"> (cannot be verified from data)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[10px] mb-1">
            Search queries ({retrievalAttempts} retrieval pass{retrievalAttempts === 1 ? '' : 'es'})
          </p>
          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
            {queries.map((q, i) => (
              <li key={i}>“{q}”</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);
