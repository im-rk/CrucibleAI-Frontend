import React, { useState } from 'react';
import { Search, Sparkles, Sliders } from 'lucide-react';
import { Button } from '../common/Button';
import { sounds } from '../../utils/audio';

interface ResearchInputProps {
  onSubmit: (query: string, maxResults: number) => void;
  isLoading: boolean;
  initialQuery?: string;
}

export const ResearchInput: React.FC<ResearchInputProps> = ({
  onSubmit,
  isLoading,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [maxResults, setMaxResults] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      sounds.playLaunch();
      onSubmit(query.trim(), maxResults);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xl dark:shadow-2xl shadow-cyan-950/10 transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input Field */}
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Enter materials science research goal (e.g. 'solid state electrolyte ionic conductivity lithium garnet')"
            className="w-full bg-slate-50 dark:bg-slate-950/90 border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all font-sans outline-none disabled:opacity-50 shadow-inner"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Max Results Options */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Vector Depth:
            </span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
              {[5, 10, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setMaxResults(num);
                  }}
                  disabled={isLoading}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                    maxResults === num
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {num} papers
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={!query.trim()}
            icon={<Sparkles className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Run Research Pipeline
          </Button>
        </div>
      </form>
    </div>
  );
};
