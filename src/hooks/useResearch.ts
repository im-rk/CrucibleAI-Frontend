import { useState, useCallback, useRef } from 'react';
import { ResearchStatus, ResearchResponse, PlanData } from '../types/api';
import { streamResearch } from '../services/sse';
import { applyEvent, initialProgress, RunProgress } from '../utils/progress';

export function useResearch() {
  const [status, setStatus] = useState<ResearchStatus>('IDLE');
  const [query, setQuery] = useState<string>('');
  const [progress, setProgress] = useState<RunProgress>(initialProgress);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const resetResearch = useCallback(() => {
    cancel();
    setStatus('IDLE');
    setQuery('');
    setProgress(initialProgress());
    setResult(null);
    setError(null);
  }, [cancel]);

  const executeResearch = useCallback(
    async (searchQuery: string, maxResults = 10, plan: PlanData | null = null) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      cancel();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('SUBMITTING');
      setQuery(trimmed);
      setProgress(initialProgress());
      setResult(null);
      setError(null);

      try {
        const report = await streamResearch(
          { query: trimmed, max_results: maxResults, plan },
          (event) => {
            setStatus('STREAMING');
            setProgress((prev) => applyEvent(prev, event));
          },
          controller.signal,
        );
        setResult(report);
        setProgress((prev) => ({ ...prev, percent: 100, message: 'Research complete' }));
        setStatus('COMPLETED');
      } catch (err) {
        if (controller.signal.aborted) {
          setStatus('IDLE'); // the user stopped it: not an error
          return;
        }
        setError(err instanceof Error ? err.message : 'An unexpected error occurred during research execution');
        setStatus('ERROR');
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [cancel],
  );

  return {
    status,
    query,
    progress,
    result,
    error,
    executeResearch,
    resetResearch,
    cancelResearch: cancel,
  };
}
