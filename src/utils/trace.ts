import { TraceSpan } from '../types/api';

/** Position and size of a span as percentages of the run, for a waterfall bar (never zero-width, never off the end). */
export function barGeometry(span: Pick<TraceSpan, 'start_ms' | 'duration_ms'>, totalMs: number): { left: number; width: number } {
  const total = Math.max(totalMs, 1);
  const left = Math.min(99, Math.max(0, (span.start_ms / total) * 100));
  const width = Math.min(100 - left, Math.max(0.6, (span.duration_ms / total) * 100));
  return { left: Math.round(left * 100) / 100, width: Math.round(width * 100) / 100 };
}

export function formatMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
}

export function formatTokens(n: number): string {
  return n >= 10_000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/** The spans worth showing in the waterfall: the slowest non-agent spans, in time order. */
export function topSpans(spans: TraceSpan[], limit = 40): TraceSpan[] {
  return [...spans]
    .filter((s) => s.kind !== 'agent')
    .sort((a, b) => b.duration_ms - a.duration_ms)
    .slice(0, limit)
    .sort((a, b) => a.start_ms - b.start_ms);
}

/** A one-line label for a span ("LLM  PlanOutput", "tool  search_literature(AlN band gap)"). */
export function spanLabel(span: TraceSpan): string {
  const detail = (span.attrs.query ?? span.attrs.formula ?? span.attrs.model ?? '') as string;
  const kind = span.kind === 'llm' ? 'LLM' : span.kind;
  return `${kind}  ${span.name}${detail && span.kind !== 'llm' ? ` (${String(detail).slice(0, 50)})` : ''}${span.status === 'cache_hit' ? ' · cached' : ''}`;
}
