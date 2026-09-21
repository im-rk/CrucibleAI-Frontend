import { Candidate, CandidateStatus } from '../types/api';

export type SortKey = 'rank' | 'name' | 'status' | 'score';

export const STATUS_ORDER: Record<CandidateStatus, number> = { qualified: 0, partial: 1, unscreened: 2, rejected: 3 };

/** Sort a copy of `candidates`; ties fall back to the backend's rank so the order is stable. */
export function sortCandidates(candidates: Candidate[], key: SortKey, ascending: boolean): Candidate[] {
  const sign = ascending ? 1 : -1;
  const compare: Record<SortKey, (a: Candidate, b: Candidate) => number> = {
    rank: (a, b) => a.rank - b.rank,
    name: (a, b) => (a.formula ?? a.name).localeCompare(b.formula ?? b.name),
    status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.rank - b.rank,
    score: (a, b) => a.score - b.score || b.rank - a.rank,
  };
  return [...candidates].sort((a, b) => sign * compare[key](a, b));
}
