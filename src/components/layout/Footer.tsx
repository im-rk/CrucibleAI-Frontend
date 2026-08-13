import React from 'react';
import { HealthResponse } from '../../types/api';
import { Cpu, ShieldCheck, Database } from 'lucide-react';

interface FooterProps {
  health?: HealthResponse | null;
}

export const Footer: React.FC<FooterProps> = ({ health }) => {
  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30">
            <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span>CrucibleAI Materials Science Autonomous Agent Workstation</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Chunks: <strong className="text-slate-900 dark:text-slate-200">{health?.vector_store_chunks ?? 1138}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Engine: <strong className="text-slate-900 dark:text-slate-200">FastAPI + Vite React</strong>
          </span>
        </div>
      </div>
    </footer>
  );
};
