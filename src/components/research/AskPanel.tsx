import React, { useState } from 'react';
import { api } from '../../services/api';
import { AskResponse } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface Turn {
  question: string;
  answer?: AskResponse;
  error?: string;
}

const SUGGESTIONS = [
  'Which candidate is best supported by the literature?',
  'What evidence is still missing?',
  'Why were some candidates rejected?',
];

/** Follow-up questions about this run. Answers use only the run's own evidence and cite it. */
export const AskPanel: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);

  const ask = async (text: string) => {
    const q = text.trim();
    if (q.length < 3 || busy) return;
    setBusy(true);
    setQuestion('');
    const history = turns.flatMap((t) => (t.answer ? [{ role: 'user', content: t.question }, { role: 'assistant', content: t.answer.answer }] : []));
    setTurns((prev) => [...prev, { question: q }]);
    try {
      const answer = await api.askRun(sessionId, q, history);
      setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, answer } : t)));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Could not get an answer.';
      setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, error } : t)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask about this run</CardTitle>
        <span className="text-xs text-slate-500">answers cite the run&apos;s own evidence</span>
      </CardHeader>
      <CardContent className="space-y-5">
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="text-sm px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <ol className="space-y-5">
          {turns.map((t, i) => (
            <li key={i} className="space-y-2">
              <p className="font-medium">{t.question}</p>
              {!t.answer && !t.error && <p className="text-sm text-slate-500">Thinking…</p>}
              {t.error && <p className="text-sm text-rose-700 dark:text-rose-400">{t.error}</p>}
              {t.answer && (
                <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-2">
                  <p className="text-sm text-slate-800 dark:text-slate-200">{t.answer.answer}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.answer.grounded ? (
                      <Badge variant="emerald" size="sm">cited from this run</Badge>
                    ) : t.answer.mode === 'extractive' ? (
                      <Badge variant="slate" size="sm">no language model: best-matching passages</Badge>
                    ) : (
                      <Badge variant="amber" size="sm">not enough evidence in this run</Badge>
                    )}
                  </div>
                  {t.answer.citations.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {t.answer.citations.map((c) => (
                        <li key={c.id}>
                          <span className="font-mono text-cyan-700 dark:text-cyan-400">[{c.id}]</span> {c.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="flex gap-3"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            aria-label="Your question"
            placeholder="Ask a follow-up question…"
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm"
          />
          <Button type="submit" isLoading={busy} disabled={question.trim().length < 3}>Ask</Button>
        </form>
      </CardContent>
    </Card>
  );
};
