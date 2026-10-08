import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { E2ERun, EvalTable, EvaluationResults } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';

const COLUMNS: Record<string, [string, string][]> = {
  sentence: [['recall1', 'Recall@1'], ['recall5', 'Recall@5'], ['recall10', 'Recall@10'], ['mrr', 'MRR'], ['ms_per_query', 'ms/query']],
  topic: [['p10', 'P@10'], ['ndcg10', 'nDCG@10'], ['ms_per_query', 'ms/query']],
};

const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '-' : Number.isInteger(v) ? String(v) : v.toFixed(3));

const Table: React.FC<{ head: string[]; rows: (string | number | null | undefined)[][] }> = ({ head, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
          {head.map((h, i) => (
            <th key={h} className={`py-1 pr-4 font-medium ${i > 0 ? 'text-right' : ''}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className={`py-1.5 pr-4 ${j > 0 ? 'text-right tabular-nums' : ''}`}>{typeof c === 'number' ? fmt(c) : (c ?? '-')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RetrievalTable: React.FC<{ data: EvalTable; kind: 'sentence' | 'topic' }> = ({ data, kind }) => (
  <Table
    head={['Method', ...COLUMNS[kind].map(([, label]) => label)]}
    rows={Object.entries(data).map(([method, v]) => [method, ...COLUMNS[kind].map(([key]) => v[key])])}
  />
);

const E2E: React.FC<{ run: E2ERun }> = ({ run }) => (
  <div className="space-y-3">
    <p className="text-sm text-slate-700 dark:text-slate-300">
      Invariant pass rate <strong>{fmt(run.invariant_pass_rate)}</strong>
      {run.task_success_rate !== null && <> · expected materials found {fmt(run.task_success_rate)}</>}
      {run.mean_grounding_score !== null && <> · mean grounding {fmt(run.mean_grounding_score)}</>}
      {run.mean_duration_s !== null && <> · mean run {run.mean_duration_s} s</>}
    </p>
    <Table
      head={['Goal', 'Invariants', 'Expected found', 'Qualified', 'Seconds']}
      rows={run.cases.map((c) => [c.goal, `${c.invariants_passed}/${c.invariants_total}`, c.expected_hit === null ? 'n/a' : c.expected_hit ? 'yes' : 'no', c.qualified.slice(0, 4).join(', ') || '-', c.duration_s])}
    />
  </div>
);

/** How well the system actually performs, from the backend's evaluation suite (scripts/run_evals.py). */
export const EvaluationView: React.FC = () => {
  const [results, setResults] = useState<EvaluationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getEvaluation().then(setResults).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load results.'));
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
          <p className="text-sm text-slate-500 mt-2">Generate results with <code className="font-mono">python scripts/run_evals.py</code> in the backend.</p>
        </CardContent>
      </Card>
    );
  }
  if (!results) return <p className="text-sm text-slate-500">Loading evaluation results…</p>;

  const { retrieval, extraction, injection } = results;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif">Evaluation</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Measured, not claimed. Generated {results.generated_at ?? 'at an unknown time'}; model {results.llm ?? 'none'}.
        </p>
      </div>

      {retrieval && (
        <Card>
          <CardHeader><CardTitle>Retrieval</CardTitle><span className="text-xs text-slate-500">{retrieval.corpus_papers} papers</span></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-base font-sans font-semibold mb-2">Sentence to paper ({retrieval.tasks.sentence_to_paper} queries)</h3>
              <RetrievalTable data={retrieval.sentence_to_paper} kind="sentence" />
            </div>
            {retrieval.paraphrase_to_paper && (
              <div>
                <h3 className="text-base font-sans font-semibold mb-1">Paraphrased sentence to paper ({retrieval.tasks.paraphrase_to_paper} queries)</h3>
                <p className="text-xs text-slate-500 mb-2">An LLM rewrote each sentence to avoid its original wording.</p>
                <RetrievalTable data={retrieval.paraphrase_to_paper} kind="sentence" />
              </div>
            )}
            <div>
              <h3 className="text-base font-sans font-semibold mb-2">Topic to papers ({retrieval.tasks.topic_to_papers} queries)</h3>
              <RetrievalTable data={retrieval.topic_to_papers} kind="topic" />
            </div>
          </CardContent>
        </Card>
      )}

      {extraction && (
        <Card>
          <CardHeader><CardTitle>Property extraction</CardTitle><span className="text-xs text-slate-500">{extraction.passages} passages, {extraction.gold_records} labelled values</span></CardHeader>
          <CardContent>
            <Table
              head={['Extractor', 'Precision', 'Recall', 'F1', 'Value accuracy', 'False alarms']}
              rows={(['rule_based', 'llm'] as const)
                .filter((k) => extraction[k])
                .map((k) => {
                  const s = extraction[k]!;
                  return [k === 'llm' ? `LLM (${s.model})` : 'Rule-based', s.overall.precision, s.overall.recall, s.overall.f1, s.value_accuracy, `${s.negative_items_with_false_alarms}/${s.negative_items}`];
                })}
            />
          </CardContent>
        </Card>
      )}

      {injection?.guardrails_on && injection.guardrails_off && (
        <Card>
          <CardHeader><CardTitle>Prompt-injection resistance</CardTitle><span className="text-xs text-slate-500">attack success rate, lower is better</span></CardHeader>
          <CardContent>
            <Table
              head={['Surface', 'Guardrails off', 'Guardrails on']}
              rows={[
                ...(['extraction', 'relevance', 'grounding'] as const).map((s) => [s, injection.guardrails_off![s].attack_success_rate, injection.guardrails_on![s].attack_success_rate]),
                ['overall', injection.guardrails_off.overall_attack_success_rate, injection.guardrails_on.overall_attack_success_rate],
              ]}
            />
            {injection.scanner && <p className="text-xs text-slate-500 mt-2">The pattern scanner flags {injection.scanner.flagged} of {injection.scanner.payloads} planted payloads.</p>}
          </CardContent>
        </Card>
      )}

      {results.e2e_heuristic && (
        <Card><CardHeader><CardTitle>End to end (rule-based, offline database)</CardTitle></CardHeader><CardContent><E2E run={results.e2e_heuristic} /></CardContent></Card>
      )}
      {results.e2e_llm && (
        <Card><CardHeader><CardTitle>End to end (LLM)</CardTitle></CardHeader><CardContent><E2E run={results.e2e_llm} /></CardContent></Card>
      )}
    </div>
  );
};
