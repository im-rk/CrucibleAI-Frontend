import { describe, it, expect } from 'vitest';
import { sortCandidates } from '../src/utils/candidates';
import { buildResearchMarkdown } from '../src/utils/exportReport';
import { Candidate, ResearchResponse } from '../src/types/api';

const cand = (over: Partial<Candidate>): Candidate => ({
  rank: 1, formula: 'A', name: 'A', status: 'partial', score: 0.5, origin: 'literature',
  criteria: [], flags: [], sources: [], record_count: 1, ...over,
});

describe('sortCandidates', () => {
  const list = [
    cand({ rank: 1, formula: 'Li10GeP2S12', status: 'qualified', score: 1 }),
    cand({ rank: 2, formula: 'AlN', status: 'partial', score: 0.5 }),
    cand({ rank: 3, formula: 'Li7La3Zr2O12', status: 'rejected', score: 0 }),
  ];

  it('sorts by rank, name, score and status in both directions without mutating the input', () => {
    expect(sortCandidates(list, 'rank', true).map((c) => c.rank)).toEqual([1, 2, 3]);
    expect(sortCandidates(list, 'rank', false).map((c) => c.rank)).toEqual([3, 2, 1]);
    expect(sortCandidates(list, 'name', true).map((c) => c.formula)).toEqual(['AlN', 'Li10GeP2S12', 'Li7La3Zr2O12']);
    expect(sortCandidates(list, 'score', false).map((c) => c.formula)).toEqual(['Li10GeP2S12', 'AlN', 'Li7La3Zr2O12']);
    expect(sortCandidates(list, 'status', true).map((c) => c.status)).toEqual(['qualified', 'partial', 'rejected']);
    expect(list.map((c) => c.rank)).toEqual([1, 2, 3]);
  });

  it('falls back to the name when a candidate has no formula', () => {
    const named = [cand({ rank: 1, formula: null, name: 'Zeta' }), cand({ rank: 2, formula: 'Alpha' })];
    expect(sortCandidates(named, 'name', true).map((c) => c.formula ?? c.name)).toEqual(['Alpha', 'Zeta']);
  });
});

const REPORT: ResearchResponse = {
  session_id: 'abcdef123456', status: 'COMPLETED', query: 'solid electrolytes', max_results: 10,
  search_results: [], candidate_formulas: ['Li10GeP2S12'], property_records: {}, krr_predictions: {},
  hypothesis: 'Sulfides conduct well.', agent_logs: [],
  criteria: [{ kind: 'numeric', label: 'Ionic conductivity > 0.001 S/cm' }],
  candidates: [cand({
    rank: 1, formula: 'Li10GeP2S12', status: 'qualified', score: 1,
    criteria: [{ label: 'Ionic conductivity > 0.001 S/cm', kind: 'numeric', status: 'met', value: 0.012, unit: 'S/cm', is_predicted: false, source: 'Paper', detail: 'best of 1 reported value(s)' }],
  })],
  hypotheses: [{
    statement: 'Sulfide framework enables fast Li transport.', suggested_experiment: 'Impedance spectroscopy.',
    confidence: 'medium', evidence: [{ id: 'E1', kind: 'chunk', ref: 'c', title: 'T', doi: '', source_id: '2401.2', snippet: 's' }],
    ungrounded: false, origin: 'template', grounded: false,
  }],
  knowledge_gaps: ['No measured air stability.'],
  citations: [{ id: 'C1', source_id: '2401.2', title: 'Superionic sulfides', authors: 'A, B', year: 2024, doi: '', url: 'https://arxiv.org/abs/2401.2', cited_by_hypotheses: [1], supports_candidates: [] }],
  grounding: { is_grounded: false, score: 0, method: 'rules', checked: 1, unsupported: 1, claims: [] },
  warnings: ['LLM not configured: property extraction used low-confidence regex heuristics.'],
  search_queries: ['q'], retrieval_attempts: 4, mode: { llm: null, materials_project: 'offline' }, duration_ms: 2500,
};

describe('buildResearchMarkdown', () => {
  const md = buildResearchMarkdown(REPORT, new Date('2026-09-21T00:00:00Z'));

  it('states the run mode and warnings up front so degraded results are not mistaken for full ones', () => {
    expect(md).toContain('no LLM (heuristic mode)');
    expect(md).toContain('offline reference table');
    expect(md.indexOf('## Warnings')).toBeLessThan(md.indexOf('## Summary'));
  });

  it('formats scientific values and per-criterion evidence', () => {
    expect(md).toContain('### 1. Li10GeP2S12: qualified (score 1.00)');
    expect(md).toContain('Ionic conductivity > 0.001 S/cm: **met**, 0.012 S/cm (best of 1 reported value(s))');
  });

  it('flags template and unsupported hypotheses and reports the grounding tally', () => {
    expect(md).toContain('### H1 (medium confidence, template, NOT supported by its evidence)');
    expect(md).toContain('0 of 1 hypotheses supported');
  });

  it('lists gaps and linked references', () => {
    expect(md).toContain('- No measured air stability.');
    expect(md).toContain('[C1] Superionic sulfides, A, B (2024) <https://arxiv.org/abs/2401.2>');
  });
});
