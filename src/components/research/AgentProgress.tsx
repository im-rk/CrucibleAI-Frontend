import React from 'react';
import { SSEProgressEvent, AgentLogEntry } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Activity, CheckCircle2, Loader2, Terminal, Database, Cpu, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface AgentProgressProps {
  progress: number;
  currentMessage?: string;
  sseEvents?: SSEProgressEvent[];
  agentLogs?: AgentLogEntry[];
  isCompleted?: boolean;
}

const PHASES = [
  { id: 'LITERATURE_SEARCH', label: '1. Vector Retrieval', icon: Database, progressThreshold: 25 },
  { id: 'MATERIALS_PROJECT_LOOKUP', label: '2. Materials Project DB', icon: Activity, progressThreshold: 50 },
  { id: 'KRR_PREDICTION', label: '3. KRR ML Prediction', icon: Cpu, progressThreshold: 75 },
  { id: 'SYNTHESIS', label: '4. Synthesis & Hypothesis', icon: Sparkles, progressThreshold: 100 },
];

export const AgentProgress: React.FC<AgentProgressProps> = ({
  progress,
  currentMessage,
  sseEvents = [],
  agentLogs = [],
  isCompleted = false,
}) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
      <CardHeader>
        <CardTitle icon={<Activity className="w-5 h-5 animate-pulse text-cyan-600 dark:text-cyan-400" />}>
          Agent Execution Pipeline
        </CardTitle>
        <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30 font-semibold">
          {isCompleted ? 'COMPLETED (100%)' : `${progress}% IN PROGRESS`}
        </span>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 shadow-inner">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-300 bg-gradient-to-r',
                isCompleted
                  ? 'from-emerald-500 to-cyan-400'
                  : 'from-cyan-500 via-indigo-500 to-cyan-400 animate-pulse'
              )}
              style={{ width: `${Math.max(5, progress)}%` }}
            />
          </div>
          {currentMessage && (
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              {currentMessage}
            </p>
          )}
        </div>

        {/* Phase Timeline Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const isPhaseDone = isCompleted || progress >= phase.progressThreshold;
            const isPhaseActive = !isCompleted && progress >= phase.progressThreshold - 25 && progress < phase.progressThreshold;

            return (
              <div
                key={phase.id}
                className={clsx(
                  'p-3 rounded-xl border transition-all duration-200 flex items-center gap-3',
                  isPhaseDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : isPhaseActive
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-700 dark:text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                )}
              >
                <div className="shrink-0">
                  {isPhaseDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isPhaseActive ? (
                    <Loader2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  )}
                </div>
                <span className="text-xs font-semibold font-mono tracking-tight">
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Agent Log */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-700 dark:border-slate-800 p-4 font-mono text-xs text-slate-200 dark:text-slate-300 space-y-2 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-700 dark:border-slate-800/80 pb-2 mb-2">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Live Agent Execution Output
            </span>
            <span className="text-[10px] text-slate-500">Real-time Stream</span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
            {/* Backend agent logs if present */}
            {agentLogs.length > 0
              ? agentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-emerald-400">
                    <span className="text-slate-500 select-none">[{idx + 1}]</span>
                    <span className="text-cyan-400 font-semibold font-mono">[{log.step}]</span>
                    <span className="text-slate-200">{log.details}</span>
                  </div>
                ))
              : sseEvents.length > 0
              ? sseEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 select-none">[{idx + 1}]</span>
                    <span className="text-cyan-400 font-semibold font-mono">[{event.step}]</span>
                    <span className="text-slate-200">{event.message}</span>
                  </div>
                ))
              : (
                <div className="text-slate-500 italic">Connecting to agent streaming events...</div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
