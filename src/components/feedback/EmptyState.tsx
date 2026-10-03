import React from 'react';
import { CorpusStatsResponse, HealthResponse } from '../../types/api';

interface EmptyStateProps {
  corpus?: CorpusStatsResponse | null;
  health?: HealthResponse | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ corpus, health }) => {
  const llmOn = !!health?.llm && !health.llm.startsWith('not configured');
  const rows: [string, string][] = [
    ['Papers', corpus ? `${corpus.total_papers ?? '—'} arXiv papers, ${corpus.total_chunks} indexed passages` : 'Unknown'],
    ['Language model', llmOn ? String(health?.llm) : 'Not configured. Rules are used instead, with lower confidence'],
    ['Property database', health?.materials_project_api ?? 'Unknown'],
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 text-slate-700 dark:text-slate-300">
      <p className="leading-relaxed">
        State what you want to find, with numeric limits where you have them. The app searches the paper corpus,
        pulls property values out of the text, checks them against Materials Project, screens the materials
        against your limits and proposes hypotheses. Each hypothesis lists the evidence it rests on.
      </p>
      <dl className="text-sm divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 py-2">
            <dt className="w-32 shrink-0 text-slate-500 dark:text-slate-400">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
