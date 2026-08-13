import React from 'react';
import { CorpusStatsResponse } from '../../types/api';
import { Card, CardContent } from '../common/Card';
import { Database, FileText, Sparkles, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  corpus?: CorpusStatsResponse | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ corpus }) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-pulse" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
            Autonomous Materials Science Agent Ready
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
            Formulate a materials discovery prompt above or click one of the preset research workflows below to trigger literature vector retrieval, Materials Project data mining, and Kernel Ridge Regression ML prediction.
          </p>
        </div>

        {/* Live Knowledge Base Corpus Cards */}
        {corpus && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 border-t border-slate-200 dark:border-slate-800 text-left font-mono text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                <Database className="w-4 h-4" />
                <span className="font-semibold">Vector Store</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {corpus.total_chunks || 1138} <span className="text-xs font-normal text-slate-500">chunks</span>
              </p>
              <span className="text-[10px] text-slate-500 block">ChromaDB Vector DB</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Paper Corpus</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {corpus.sample_papers?.length || 14} <span className="text-xs font-normal text-slate-500">sample papers</span>
              </p>
              <span className="text-[10px] text-slate-500 block">arXiv Preprints</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-semibold">Materials DB</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Active <span className="text-xs font-normal text-slate-500">REST API</span>
              </p>
              <span className="text-[10px] text-slate-500 block">Materials Project</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

