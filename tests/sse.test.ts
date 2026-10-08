import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SseParser, streamResearch, StreamError } from '../src/services/sse';
import { StreamEvent } from '../src/types/api';

const frame = (event: string, data: object) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

function streamOf(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

const REPORT = { session_id: 's1', query: 'q', candidates: [] };

describe('SseParser', () => {
  it('parses named frames and joins nothing across frames', () => {
    const events = new SseParser().push(frame('a', { n: 1 }) + frame('b', { n: 2 }));
    expect(events).toEqual([
      { event: 'a', data: { n: 1 } },
      { event: 'b', data: { n: 2 } },
    ]);
  });

  it('reassembles a frame split across chunks, even mid-line', () => {
    const parser = new SseParser();
    const whole = frame('papers_found', { count: 12 });
    expect(parser.push(whole.slice(0, 20))).toEqual([]);
    expect(parser.push(whole.slice(20))).toEqual([{ event: 'papers_found', data: { count: 12 } }]);
  });

  it('ignores keep-alive comments and malformed JSON without losing later events', () => {
    const events = new SseParser().push(
      ': keep-alive\n\n' + 'event: bad\ndata: {not json\n\n' + frame('ok', { fine: true }),
    );
    expect(events).toEqual([{ event: 'ok', data: { fine: true } }]);
  });

  it('handles CRLF line endings', () => {
    const events = new SseParser().push('event: a\r\ndata: {"n":1}\r\n\r\n');
    expect(events).toEqual([{ event: 'a', data: { n: 1 } }]);
  });
});

describe('streamResearch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POSTs the query, forwards events in order, and resolves with the report', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      streamOf([
        frame('session_started', { session_id: 's1', query: 'q', mode: { llm: null, materials_project: 'offline' } }),
        ': keep-alive\n\n',
        frame('agent_start', { agent: 'SearchAgent' }),
        frame('complete', { report: REPORT }),
      ]),
    );
    const seen: string[] = [];
    const report = await streamResearch({ query: 'solid electrolytes', max_results: 5 }, (e) => seen.push(e.event));

    expect(report).toEqual(REPORT);
    expect(seen).toEqual(['session_started', 'agent_start', 'complete']);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/research/stream'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ query: 'solid electrolytes', max_results: 5, plan: null }) }),
    );
  });

  it('sends a plan the user reviewed and edited', async () => {
    global.fetch = vi.fn().mockResolvedValue(streamOf([frame('complete', { report: REPORT })]));
    const plan = { summary: 's', criteria: [], queries: ['only this query'], material_families: [], source: 'user' as const };
    await streamResearch({ query: 'q', plan }, () => undefined);
    const body = JSON.parse((global.fetch as unknown as { mock: { calls: [string, { body: string }][] } }).mock.calls[0][1].body);
    expect(body.plan).toEqual(plan);
  });

  it('delivers events that arrive split across network chunks', async () => {
    const whole = frame('complete', { report: REPORT });
    global.fetch = vi.fn().mockResolvedValue(streamOf([whole.slice(0, 15), whole.slice(15)]));
    expect(await streamResearch({ query: 'q' }, () => undefined)).toEqual(REPORT);
  });

  it('rejects with the server message on an error event', async () => {
    global.fetch = vi.fn().mockResolvedValue(streamOf([frame('error', { message: 'Research timed out after 300s.' })]));
    await expect(streamResearch({ query: 'q' }, () => undefined)).rejects.toThrow('Research timed out after 300s.');
  });

  it('rejects when the stream ends without a report', async () => {
    global.fetch = vi.fn().mockResolvedValue(streamOf([frame('agent_start', { agent: 'SearchAgent' })]));
    await expect(streamResearch({ query: 'q' }, () => undefined)).rejects.toThrow('ended before');
  });

  it('surfaces validation errors from the API as readable messages', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: [{ msg: 'String should have at least 3 characters' }] }), { status: 422 }),
    );
    const err = await streamResearch({ query: 'ab' }, () => undefined).catch((e) => e);
    expect(err).toBeInstanceOf(StreamError);
    expect(err.status).toBe(422);
    expect(err.message).toContain('at least 3 characters');
  });

  it('reports an unreachable backend clearly', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(streamResearch({ query: 'q' }, () => undefined)).rejects.toThrow('Could not reach the backend');
  });

  it('propagates an abort instead of masking it as a network error', async () => {
    const controller = new AbortController();
    controller.abort();
    global.fetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const err = await streamResearch({ query: 'q' }, () => undefined, controller.signal).catch((e) => e);
    expect(err.name).toBe('AbortError');
  });

  it('typed events keep their payload fields', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      streamOf([frame('re_retrieving', { new_query: 'better', attempt: 2 }), frame('complete', { report: REPORT })]),
    );
    const events: StreamEvent[] = [];
    await streamResearch({ query: 'q' }, (e) => events.push(e));
    expect(events[0]).toEqual({ event: 're_retrieving', new_query: 'better', attempt: 2 });
  });
});
