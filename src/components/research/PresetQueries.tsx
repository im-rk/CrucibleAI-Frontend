import React from 'react';
import { PRESET_QUERIES } from '../../utils/constants';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PresetQueriesProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

export const PresetQueries: React.FC<PresetQueriesProps> = ({
  onSelectQuery,
  disabled = false,
}) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle icon={<Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}>
          Preset Scientific Research Goals & Materials Workflows
        </CardTitle>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Click any preset to launch pipeline
        </span>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => {
                sounds.playClick();
                onSelectQuery(preset.query);
              }}
              className="text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-850/80 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 transition-all duration-200 group flex flex-col justify-between space-y-3 disabled:opacity-50 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold">
                    {preset.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                  {preset.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans line-clamp-2 mt-1">
                  {preset.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px] font-mono text-slate-500 truncate">
                Target: "{preset.query}"
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
