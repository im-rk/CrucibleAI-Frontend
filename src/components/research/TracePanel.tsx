import React from 'react';
import { RunTrace } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { barGeometry, formatMs, formatTokens, spanLabel, topSpans } from '../../utils/trace';

const KIND_COLOUR: Record<string, string> = {
  llm: 'bg-cyan-600 dark:bg-cyan-500',
  retrieval: 'bg-indigo-500',
  tool: 'bg-amber-500',
  agent: 'bg-slate-400',
};

const Stat: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2">
    <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    <div className="text-xl font-serif text-slate-900 dark:text-slate-100">{value}</div>
    {note && <div className="text-xs text-slate-500">{note}</div>}
  </div>
);

/** What the run cost: every agent step, model call, retrieval and tool call, timed. */
export const TracePanel: React.FC<{ trace: RunTrace }> = ({ trace }) => {
  const { summary } = trace;
  const llm = summary.llm;
  const agents = Object.entries(summary.agents).sort((a, b) => b[1].duration_ms - a[1].duration_ms);
  const maxAgentMs = Math.max(...agents.map(([, a]) => a.duration_ms), 1);
  const spans = topSpans(trace.spans);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run summary</CardTitle>
          <span className="text-xs text-slate-500 font-mono">{summary.run_id.slice(0, 8)}</span>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Total time" value={formatMs(summary.total_ms)} />
          <Stat label="Model calls" value={String(llm.calls)} note={`${llm.cache_hits} answered from cache${llm.errors ? `, ${llm.errors} failed` : ''}`} />
          <Stat
            label="Tokens"
            value={formatTokens(llm.total_tokens)}
            note={`${formatTokens(llm.prompt_tokens)} in, ${formatTokens(llm.completion_tokens)} out${llm.estimated_tokens ? ' (estimated)' : ''}`}
          />
          <Stat label="Waiting on rate limit" value={formatMs(llm.rate_limit_wait_ms ?? 0)} note="scheduled, not failed" />
          <Stat label="Retrievals / tools" value={`${summary.retrieval.calls} / ${summary.tools.calls}`} note={formatMs(summary.retrieval.latency_ms) + ' searching'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time by agent</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-1 pr-4 font-medium">Agent</th>
                <th className="py-1 pr-4 font-medium w-1/2">Duration</th>
                <th className="py-1 pr-4 font-medium text-right">Model calls</th>
                <th className="py-1 pr-4 font-medium text-right">Tokens</th>
                <th className="py-1 font-medium text-right">Searches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {agents.map(([name, a]) => (
                <tr key={name}>
                  <td className="py-1.5 pr-4">{name}</td>
                  <td className="py-1.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-sm bg-cyan-600 dark:bg-cyan-500" style={{ width: `${Math.max(2, (a.duration_ms / maxAgentMs) * 100)}%` }} />
                      <span className="text-xs text-slate-500 whitespace-nowrap">{formatMs(a.duration_ms)}</span>
                    </div>
                  </td>
                  <td className="py-1.5 pr-4 text-right tabular-nums">{a.llm_calls}</td>
                  <td className="py-1.5 pr-4 text-right tabular-nums">{formatTokens(a.tokens)}</td>
                  <td className="py-1.5 text-right tabular-nums">{a.retrievals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <div className="flex gap-3 text-xs text-slate-500">
            {['llm', 'retrieval', 'tool'].map((k) => (
              <span key={k} className="flex items-center gap-1">
                <span className={`inline-block w-2.5 h-2.5 rounded-sm ${KIND_COLOUR[k]}`} />
                {k === 'llm' ? 'model call' : k}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {spans.length === 0 && <p className="text-sm text-slate-500">No model, retrieval or tool calls were recorded.</p>}
          {spans.map((s, i) => {
            const { left, width } = barGeometry(s, summary.total_ms);
            return (
              <div key={i} className="grid grid-cols-[minmax(0,16rem)_1fr_4rem] items-center gap-3 text-xs">
                <span className="truncate text-slate-700 dark:text-slate-300" title={spanLabel(s)}>{spanLabel(s)}</span>
                <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  <div
                    className={`absolute top-0 h-3 rounded-sm ${s.status === 'error' ? 'bg-rose-500' : KIND_COLOUR[s.kind]}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="text-right text-slate-500 tabular-nums">{formatMs(s.duration_ms)}</span>
              </div>
            );
          })}
          {summary.spans_dropped > 0 && <p className="text-xs text-slate-500 pt-2">{summary.spans_dropped} further spans were not recorded.</p>}
        </CardContent>
      </Card>
    </div>
  );
};
