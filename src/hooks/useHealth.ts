import { useState, useEffect, useCallback } from 'react';
import { HealthResponse, CorpusStatsResponse } from '../types/api';
import { api } from '../services/api';

export function useHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [corpus, setCorpus] = useState<CorpusStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [healthRes, corpusRes] = await Promise.allSettled([
        api.getHealth(),
        api.getCorpusStats(),
      ]);

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
        setIsOnline(healthRes.value.status === 'online');
      } else {
        setIsOnline(false);
        setError('Backend service offline or unreachable');
      }

      if (corpusRes.status === 'fulfilled') {
        setCorpus(corpusRes.value);
      }
    } catch (err) {
      setIsOnline(false);
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000); // Poll health every 30s
    return () => clearInterval(timer);
  }, [checkHealth]);

  return { health, corpus, isLoading, isOnline, error, refetch: checkHealth };
}
