import React from 'react';
import { PlanData } from '../../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';

const SOURCE_LABEL: Record<PlanData['source'], string> = {
  llm: 'written by the planner model',
  heuristic: 'rule-based (no language model)',
  user: 'edited by you',
};

/** What the run set out to do: the criteria it screened against and the searches it ran. */
export const PlanCard: React.FC<{ plan: PlanData }> = ({ plan }) => (
  <Card>
    <CardHeader>
      <CardTitle>Plan</CardTitle>
      <Badge variant={plan.source === 'user' ? 'indigo' : plan.source === 'llm' ? 'emerald' : 'amber'} size="sm">
        {SOURCE_LABEL[plan.source]}
      </Badge>
    </CardHeader>
    <CardContent className="space-y-4 text-sm">
      <p className="text-slate-700 dark:text-slate-300">{plan.summary}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-1">Criteria checked</h4>
          {plan.criteria.length === 0 ? (
            <p className="text-slate-500">None could be read from the goal, so candidates are unscreened.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-0.5">
              {plan.criteria.map((c, i) => (
                <li key={i}>{c.label}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-1">Searches planned</h4>
          <ul className="list-disc pl-5 space-y-0.5">
            {plan.queries.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      </div>
      {plan.material_families.length > 0 && (
        <p className="text-slate-600 dark:text-slate-400">
          Material families to look at: {plan.material_families.join(', ')}.
        </p>
      )}
    </CardContent>
  </Card>
);
