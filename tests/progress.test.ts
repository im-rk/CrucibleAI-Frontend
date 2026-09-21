import { describe, it, expect } from 'vitest';
import { applyEvent, describeEvent, initialProgress, RunProgress } from '../src/utils/progress';
import { StreamEvent } from '../src/types/api';

const run = (events: StreamEvent[]): RunProgress => events.reduce(applyEvent, initialProgress());

describe('applyEvent', () => {
  it('starts with every agent pending at 0%', () => {
    const p = initialProgress();
    expect(Object.values(p.phases).every((s) => s === 'pending')).toBe(true);
    expect(p.percent).toBe(0);
  });

  it('records the session and run mode', () => {
    const p = run([{ event: 'session_started', session_id: 's1', query: 'q', mode: { llm: null, materials_project: 'offline' } }]);
    expect(p.sessionId).toBe('s1');
    expect(p.mode).toEqual({ llm: null, materials_project: 'offline' });
  });

  it('marks agents active then done and advances the percentage', () => {
    const p = run([
      { event: 'agent_start', agent: 'SearchAgent' },
      { event: 'agent_complete', agent: 'SearchAgent', duration_ms: 120 },
      { event: 'agent_start', agent: 'ExtractionAgent' },
    ]);
    expect(p.phases.SearchAgent).toBe('done');
    expect(p.phases.ExtractionAgent).toBe('active');
    expect(p.phases.ScreeningAgent).toBe('pending');
    expect(p.percent).toBe(30); // one of five done (20) + half of the active one (10)
  });

  it('accumulates search time over retry passes and counts the retries', () => {
    const p = run([
      { event: 'agent_start', agent: 'SearchAgent' },
      { event: 'agent_complete', agent: 'SearchAgent', duration_ms: 100 },
      { event: 'agent_start', agent: 'SearchAgent' },
      { event: 're_retrieving', new_query: 'better', attempt: 1 },
      { event: 'agent_complete', agent: 'SearchAgent', duration_ms: 50 },
    ]);
    expect(p.durations.SearchAgent).toBe(150);
    expect(p.retries).toBe(1);
    expect(p.log.at(-1)?.text).toContain('retry 1');
  });

  it('never reports 100% before the run completes', () => {
    const p = run([
      'SearchAgent', 'ExtractionAgent', 'ScreeningAgent', 'HypothesisAgent', 'ReportBuilder',
    ].flatMap((agent) => [
      { event: 'agent_start', agent },
      { event: 'agent_complete', agent, duration_ms: 1 },
    ]) as StreamEvent[]);
    expect(p.percent).toBe(99);
  });

  it('keeps a failed agent as failed even though it still completes', () => {
    const p = run([
      { event: 'agent_start', agent: 'ExtractionAgent' },
      { event: 'agent_error', agent: 'ExtractionAgent', message: 'boom' },
      { event: 'agent_complete', agent: 'ExtractionAgent', duration_ms: 5 },
    ]);
    expect(p.phases.ExtractionAgent).toBe('error');
    expect(p.log.at(-1)).toMatchObject({ tone: 'error', text: expect.stringContaining('boom') });
  });

  it('shows queued state until an agent starts', () => {
    const queued = run([{ event: 'queued', message: 'Waiting for a free research slot.' }]);
    expect(queued.queued).toBe(true);
    expect(applyEvent(queued, { event: 'agent_start', agent: 'SearchAgent' }).queued).toBe(false);
  });

  it('does not mutate the previous state', () => {
    const before = initialProgress();
    applyEvent(before, { event: 'agent_start', agent: 'SearchAgent' });
    expect(before.phases.SearchAgent).toBe('pending');
    expect(before.log).toHaveLength(0);
  });
});

describe('describeEvent', () => {
  it('warns when running on the offline reference table', () => {
    expect(describeEvent({ event: 'mp_lookup', formulas: 2, records: 2, online: false })).toMatchObject({
      tone: 'warn',
      text: expect.stringContaining('offline reference table'),
    });
  });

  it('formats tiny KRR values in scientific notation', () => {
    expect(describeEvent({ event: 'krr_prediction', formula: 'X', property: 'p', value: 0.00012 })?.text).toContain('1.20e-4');
  });

  it('flags unsupported hypotheses', () => {
    expect(describeEvent({ event: 'grounding_check', is_grounded: false, score: 0.5 })?.tone).toBe('warn');
  });

  it('is silent for pure lifecycle events', () => {
    expect(describeEvent({ event: 'agent_start', agent: 'SearchAgent' })).toBeNull();
  });
});
