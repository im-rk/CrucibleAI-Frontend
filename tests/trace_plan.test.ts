import { describe, it, expect } from 'vitest';
import { barGeometry, formatMs, formatTokens, spanLabel, topSpans } from '../src/utils/trace';
import { buildEditedPlan, queriesToText } from '../src/utils/plan';
import { PlanData, TraceSpan } from '../src/types/api';

const span = (over: Partial<TraceSpan>): TraceSpan => ({
  kind: 'llm', name: 'PlanOutput', agent: 'PlannerAgent', start_ms: 0, duration_ms: 100, status: 'ok', attrs: {}, ...over,
});

describe('trace helpers', () => {
  it('places a span as a percentage of the run and never lets it overflow', () => {
    expect(barGeometry({ start_ms: 250, duration_ms: 500 }, 1000)).toEqual({ left: 25, width: 50 });
    const late = barGeometry({ start_ms: 990, duration_ms: 500 }, 1000);
    expect(late.left + late.width).toBeLessThanOrEqual(100);
  });

  it('keeps instant spans visible and tolerates a zero-length run', () => {
    expect(barGeometry({ start_ms: 0, duration_ms: 0 }, 1000).width).toBeGreaterThan(0);
    expect(barGeometry({ start_ms: 0, duration_ms: 5 }, 0).left).toBe(0);
  });

  it('formats durations and token counts for humans', () => {
    expect(formatMs(850)).toBe('850 ms');
    expect(formatMs(2500)).toBe('2.5 s');
    expect(formatMs(61_000)).toBe('61 s');
    expect(formatTokens(950)).toBe('950');
    expect(formatTokens(12_345)).toBe('12.3k');
  });

  it('shows the slowest non-agent spans in time order', () => {
    const spans = [
      span({ kind: 'agent', name: 'SearchAgent', duration_ms: 9999, start_ms: 0 }),
      span({ name: 'a', duration_ms: 10, start_ms: 300 }),
      span({ name: 'b', duration_ms: 500, start_ms: 100 }),
      span({ name: 'c', duration_ms: 400, start_ms: 200 }),
    ];
    expect(topSpans(spans, 2).map((s) => s.name)).toEqual(['b', 'c']);
    expect(topSpans(spans).some((s) => s.kind === 'agent')).toBe(false);
  });

  it('labels spans readably, marking cache hits', () => {
    expect(spanLabel(span({ status: 'cache_hit' }))).toBe('LLM  PlanOutput · cached');
    expect(spanLabel(span({ kind: 'tool', name: 'search_literature', attrs: { query: 'AlN band gap' } }))).toBe('tool  search_literature (AlN band gap)');
  });
});

describe('plan editing', () => {
  const plan: PlanData = {
    summary: 's', source: 'llm', material_families: ['sulfides'], queries: ['one', 'two'],
    criteria: [
      { kind: 'numeric', label: 'Bandgap > 5 eV' },
      { kind: 'exclude_elements', label: 'No rare earths' },
    ],
  };

  it('keeps only the criteria the user left ticked and marks the plan as theirs', () => {
    const edited = buildEditedPlan(plan, new Set([1]), 'one\ntwo');
    expect(edited.criteria.map((c) => c.label)).toEqual(['No rare earths']);
    expect(edited.source).toBe('user');
    expect(edited.material_families).toEqual(['sulfides']);
  });

  it('turns the edited text into one query per non-empty line, trimmed', () => {
    expect(buildEditedPlan(plan, new Set([0, 1]), '  first query \n\n second query\n').queries).toEqual(['first query', 'second query']);
  });

  it('falls back to the original queries when the user clears them all', () => {
    expect(buildEditedPlan(plan, new Set([0]), '  \n ').queries).toEqual(['one', 'two']);
  });

  it('round-trips the queries through the textarea text', () => {
    expect(queriesToText(plan)).toBe('one\ntwo');
  });

  it('does not mutate the original plan', () => {
    buildEditedPlan(plan, new Set(), 'x');
    expect(plan.criteria).toHaveLength(2);
    expect(plan.source).toBe('llm');
  });
});
