import { SSEProgressEvent } from '../types/api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface SSESubscription {
  unsubscribe: () => void;
}

export function subscribeResearchStream(
  onEvent: (event: SSEProgressEvent) => void,
  onError?: (error: Event | Error) => void,
  onComplete?: () => void
): SSESubscription {
  const streamUrl = `${API_BASE_URL}/api/stream`;
  let eventSource: EventSource | null = null;
  let isCleanedUp = false;

  try {
    eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      if (isCleanedUp) return;
      try {
        const payload: SSEProgressEvent = JSON.parse(event.data);
        onEvent(payload);
        if (payload.progress >= 100) {
          if (onComplete) onComplete();
          // Keep connection open or close cleanly
        }
      } catch (err) {
        console.warn('[SSE] Event parse warning:', err);
      }
    };

    eventSource.onerror = (err) => {
      if (isCleanedUp) return;
      console.warn('[SSE] EventSource connection issue:', err);
      if (onError) {
        onError(err instanceof Error ? err : new Error('SSE connection warning'));
      }
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
        eventSource.close();
      }
    };
  } catch (err) {
    if (onError) {
      onError(err instanceof Error ? err : new Error('Failed to initialize SSE EventSource'));
    }
  }

  return {
    unsubscribe: () => {
      isCleanedUp = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    },
  };
}
