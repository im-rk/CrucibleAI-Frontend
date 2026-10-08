import React, { useState } from 'react';
import { PlanPreview } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { buildEditedPlan, queriesToText } from '../../utils/plan';

interface PlanReviewProps {
  preview: PlanPreview;
  onRun: (plan: ReturnType<typeof buildEditedPlan>) => void;
  onCancel: () => void;
}

/** Human-in-the-loop checkpoint: the agent shows what it intends to do and the user can correct it first. */
export const PlanReview: React.FC<PlanReviewProps> = ({ preview, onRun, onCancel }) => {
  const { plan } = preview;
  const [kept, setKept] = useState<Set<number>>(() => new Set(plan.criteria.map((_, i) => i)));
  const [queries, setQueries] = useState(queriesToText(plan));

  const toggle = (i: number) =>
    setKept((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review the plan</CardTitle>
        <span className="text-xs text-slate-500">
          {plan.source === 'llm' ? 'written by the planner model' : 'rule-based plan (no language model)'}
        </span>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-slate-700 dark:text-slate-300">{plan.summary}</p>

        <fieldset>
          <legend className="text-xs uppercase tracking-wide text-slate-500 mb-2">Criteria to screen against (untick to drop one)</legend>
          {plan.criteria.length === 0 ? (
            <p className="text-sm text-slate-500">No criteria could be read from your goal; candidates will be listed unscreened.</p>
          ) : (
            <ul className="space-y-1.5">
              {plan.criteria.map((c, i) => (
                <li key={i}>
                  <label className="flex items-start gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={kept.has(i)} onChange={() => toggle(i)} className="mt-1" />
                    <span>{c.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <div>
          <label htmlFor="plan-queries" className="text-xs uppercase tracking-wide text-slate-500 block mb-1">
            Literature searches (one per line)
          </label>
          <textarea
            id="plan-queries"
            value={queries}
            onChange={(e) => setQueries(e.target.value)}
            rows={Math.max(3, queries.split('\n').length)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {preview.warnings.length > 0 && (
          <ul className="text-xs text-amber-700 dark:text-amber-400 list-disc pl-5">
            {preview.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-3">
          <Button onClick={() => onRun(buildEditedPlan(plan, kept, queries))}>Run with this plan</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};
