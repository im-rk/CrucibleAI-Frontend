import { useState, useCallback, useRef } from 'react';
import {
  ResearchStatus,
  ResearchResponse,
  SSEProgressEvent,
} from '../types/api';
import { api } from '../services/api';
import { subscribeResearchStream, SSESubscription } from '../services/sse';

export function useResearch() {
  const [status, setStatus] = useState<ResearchStatus>('IDLE');
  const [query, setQuery] = useState<string>('');
  const [sseEvents, setSseEvents] = useState<SSEProgressEvent[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [currentStepMessage, setCurrentStepMessage] = useState<string>('');
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sseSubscriptionRef = useRef<SSESubscription | null>(null);

  const cleanupStream = useCallback(() => {
    if (sseSubscriptionRef.current) {
      sseSubscriptionRef.current.unsubscribe();
      sseSubscriptionRef.current = null;
    }
  }, []);

  const resetResearch = useCallback(() => {
    cleanupStream();
    setStatus('IDLE');
    setQuery('');
    setSseEvents([]);
    setOverallProgress(0);
    setCurrentStepMessage('');
    setResult(null);
    setError(null);
  }, [cleanupStream]);

  const executeResearch = useCallback(
    async (searchQuery: string, maxResults = 10) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      cleanupStream();
      setStatus('SUBMITTING');
      setQuery(trimmed);
      setSseEvents([]);
      setOverallProgress(10);
      setCurrentStepMessage('Initializing research run session...');
      setResult(null);
      setError(null);

      // 1. Subscribe to SSE event stream in parallel for live agent progress
      sseSubscriptionRef.current = subscribeResearchStream(
        (event) => {
          setStatus('STREAMING');
          setSseEvents((prev) => {
            // Avoid duplicate step entries if repeated
            const exists = prev.some((e) => e.step === event.step && e.progress === event.progress);
            if (exists) return prev;
            return [...prev, event];
          });
          setOverallProgress(event.progress);
          setCurrentStepMessage(event.message);
        },
        (_err) => {
          // SSE connection warning fallback - don't crash main research call
        },
        () => {
          // SSE stream completed
        }
      );

      // 2. Submit main research workflow request to backend
      try {
        const responseData = await api.submitResearch({
          query: trimmed,
          max_results: maxResults,
        });

        cleanupStream();
        setResult(responseData);
        setOverallProgress(100);
        setStatus('COMPLETED');
      } catch (err) {
        cleanupStream();
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred during research execution';
        setError(errorMessage);
        setStatus('ERROR');
      }
    },
    [cleanupStream]
  );

  return {
    status,
    query,
    sseEvents,
    overallProgress,
    currentStepMessage,
    result,
    error,
    executeResearch,
    resetResearch,
  };
}
