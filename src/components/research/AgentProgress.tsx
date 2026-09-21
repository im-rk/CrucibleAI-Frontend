import React from 'react';
import { AgentLogEntry, AgentName } from '../../types/api';
import { RunProgress, PhaseState } from '../../utils/progress';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import {
  Activity, CheckCircle2, Loader2, Terminal, Database, Cpu, Sparkles, AlertTriangle,
  Search, ShieldCheck, Square,
} from 'lucide-react';
import { clsx } from 'clsx';

interface AgentProgressProps {
  /** Live progress while a run is in flight. */
  progress?: RunProgress;
  /** Finished run: the audit log with per-agent timings. */
  agentLogs?: AgentLogEntry[];
  isCompleted?: boolean;
  onCancel?: () => void;
}

const PHASES: { id: AgentName; label: string; icon: React.ElementType }[] = [
  { id: 'SearchAgent', label: '1. Literature Search', icon: Search },
  { id: 'ExtractionAgent', label: '2. Property Extraction', icon: Database },
  { id: 'ScreeningAgent', label: '3. Screening + KRR', icon: Cpu },
  { id: 'HypothesisAgent', label: '4. Hypotheses', icon: Sparkles },
  { id: 'ReportBuilder', label: '5. Grounding Check', icon: ShieldCheck },
];

const TONE_CLASS = {
  info: 'text-slate-200',
  warn: 'text-amber-300',
  error: 'text-rose-400',
} as const;

function phaseStyle(state: PhaseState): string {
  switch (state) {
    case 'done':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400';
    case 'active':
      return 'bg-cyan-500/10 border-cyan-500/50 text-cyan-700 dark:text-cyan-300 shadow-md shadow-cyan-500/10';
    case 'error':
      return 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400';
    default:
      return 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500';
  }
}

export const AgentProgress: React.FC<AgentProgressProps> = ({
  progress,
  agentLogs = [],
  isCompleted = false,
  onCancel,
}) => {
  const percent = isCompleted ? 100 : progress?.percent ?? 0;
  const phaseOf = (id: AgentName): PhaseState => (isCompleted ? 'done' : progress?.phases[id] ?? 'pending');

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
      <CardHeader>
        <CardTitle icon={<Activity className={clsx('w-5 h-5', !isCompleted && 'animate-pulse')} />}>
          Agent Execution Pipeline
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30 font-semibold">
            {isCompleted ? 'COMPLETED' : `${percent}%`}
          </span>
          {!isCompleted && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} icon={<Square className="w-3.5 h-3.5" />}>
              Stop
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 shadow-inner">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                isCompleted ? 'from-emerald-500 to-cyan-400' : 'from-cyan-500 via-indigo-500 to-cyan-400',
              )}
              style={{ width: `${Math.max(3, percent)}%` }}
            />
          </div>
          {!isCompleted && progress?.message && (
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              {progress.queued ? 'Queued: ' : ''}
              {progress.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const state = phaseOf(phase.id);
            const ms = progress?.durations[phase.id];
            return (
              <div
                key={phase.id}
                data-phase={phase.id}
                data-state={state}
                className={clsx('p-3 rounded-xl border transition-all duration-200 flex items-center gap-3', phaseStyle(state))}
              >
                <div className="shrink-0">
                  {state === 'done' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : state === 'active' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : state === 'error' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold font-mono tracking-tight block truncate">{phase.label}</span>
                  {ms !== undefined && <span className="text-[10px] font-mono opacity-70">{(ms / 1000).toFixed(1)}s</span>}
                  {phase.id === 'SearchAgent' && (progress?.retries ?? 0) > 0 && (
                    <span className="text-[10px] font-mono opacity-70 ml-1">· {progress?.retries} retries</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-700 dark:border-slate-800 p-4 font-mono text-xs text-slate-200 dark:text-slate-300 space-y-2 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-700 dark:border-slate-800/80 pb-2 mb-2">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              {isCompleted ? 'Agent Audit Log' : 'Live Agent Output'}
            </span>
            <span className="text-[10px] text-slate-500">{isCompleted ? `${agentLogs.length} steps` : 'streaming'}</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
            {isCompleted ? (
              agentLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-500 select-none">[{idx + 1}]</span>
                  <span className="text-cyan-400 font-semibold">[{log.agent ?? log.step}]</span>
                  <span className="text-slate-200">{log.details}</span>
                  {log.duration_ms !== undefined && (
                    <span className="text-slate-500 ml-auto shrink-0">{(log.duration_ms / 1000).toFixed(2)}s</span>
                  )}
                </div>
              ))
            ) : progress && progress.log.length > 0 ? (
              progress.log.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-500 select-none">[{idx + 1}]</span>
                  <span className="text-cyan-400 font-semibold">[{line.agent}]</span>
                  <span className={TONE_CLASS[line.tone]}>{line.text}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic">Waiting for the first agent…</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

