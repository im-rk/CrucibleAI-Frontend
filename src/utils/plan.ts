import { Criterion, PlanData } from '../types/api';

/** The plan the user approved: only the criteria they kept, and one search query per non-empty line. */
export function buildEditedPlan(original: PlanData, keptCriteria: Set<number>, queriesText: string): PlanData {
  const queries = queriesText
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean);
  return {
    ...original,
    criteria: original.criteria.filter((_, i) => keptCriteria.has(i)) as Criterion[],
    queries: queries.length > 0 ? queries : original.queries,
    source: 'user',
  };
}

export function queriesToText(plan: PlanData): string {
  return plan.queries.join('\n');
}
