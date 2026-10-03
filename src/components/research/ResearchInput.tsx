import React, { useEffect, useState } from 'react';
import { Button } from '../common/Button';

interface ResearchInputProps {
  onSubmit: (query: string, maxResults: number) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const DEPTHS = [5, 10, 20];

export const ResearchInput: React.FC<ResearchInputProps> = ({ onSubmit, isLoading, initialQuery = '' }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [maxResults, setMaxResults] = useState<number>(10);

  // A preset or palette query starts a run from outside this form: show what is being run.
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) onSubmit(query.trim(), maxResults);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="goal" className="block text-lg font-semibold font-serif">
        Research goal
      </label>
      <input
        id="goal"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
        placeholder="e.g. solid-state electrolytes with ionic conductivity above 1e-3 S/cm and no rare earths"
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2.5 text-base placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-60"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span id="depth-label">Papers to read</span>
          <div role="radiogroup" aria-labelledby="depth-label" className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden">
            {DEPTHS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={maxResults === n}
                disabled={isLoading}
                onClick={() => setMaxResults(n)}
                className={`px-3 py-1 border-r last:border-r-0 border-slate-300 dark:border-slate-700 ${
                  maxResults === n
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" isLoading={isLoading} disabled={!query.trim()}>
          Run research
        </Button>
      </div>
    </form>
  );
};
