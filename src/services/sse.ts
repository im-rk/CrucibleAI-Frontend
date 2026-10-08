import { ResearchRequest, ResearchResponse, StreamEvent } from '../types/api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class StreamError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'StreamError';
  }
}

/**
 * Incremental Server-Sent Events parser. Feed it text chunks as they arrive (a frame may be
 * split across chunks); it returns the complete events found so far. Comment lines
 * (": keep-alive") are ignored.
 */
export class SseParser {
  private buffer = '';

  push(chunk: string): { event: string; data: unknown }[] {
    this.buffer += chunk.replace(/\r\n/g, '\n');
    const frames = this.buffer.split('\n\n');
    this.buffer = frames.pop() ?? '';
    const events: { event: string; data: unknown }[] = [];
    for (const frame of frames) {
      let name = 'message';
      const data: string[] = [];
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) name = line.slice(6).trim();
        else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
      }
      if (data.length === 0) continue; // a comment-only frame
      try {
        events.push({ event: name, data: JSON.parse(data.join('\n')) });
      } catch {
        // A malformed frame must not kill the whole run; skip it.
      }
    }
    return events;
  }
}

/**
 * Run a research query, streaming progress via `onEvent`. Uses fetch (EventSource cannot POST).
 * Resolves with the final report, or rejects with a StreamError. Aborting via `signal`
 * cancels the run server-side (the backend stops the pipeline when the client disconnects).
 */
export async function streamResearch(
  request: ResearchRequest,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<ResearchResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/research/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ query: request.query, max_results: request.max_results ?? 10, plan: request.plan ?? null }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new StreamError('Could not reach the backend. Is it running?');
  }

  if (!response.ok || !response.body) {
    let detail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body && typeof body === 'object' && 'detail' in body) {
        detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // keep the status line
    }
    throw new StreamError(detail, response.status);
  }

  const parser = new SseParser();
  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let report: ResearchResponse | null = null;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const { event, data } of parser.push(decoder.decode(value, { stream: true }))) {
        const payload = { event, ...(data as object) } as StreamEvent;
        if (payload.event === 'complete') report = payload.report;
        if (payload.event === 'error') throw new StreamError(payload.message);
        onEvent(payload);
      }
    }
  } finally {
    reader.cancel().catch(() => undefined); // release the connection on error/abort
  }

  if (!report) throw new StreamError('The stream ended before the research finished.');
  return report;
}
