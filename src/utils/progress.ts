import { AGENTS, AgentName, RunMode, StreamEvent } from '../types/api';

export type PhaseState = 'pending' | 'active' | 'done' | 'error';

export interface LogLine {
  agent: string;
  text: string;
  tone: 'info' | 'warn' | 'error';
}

export interface RunProgress {
  sessionId: string | null;
  mode: RunMode | null;
  phases: Record<AgentName, PhaseState>;
  durations: Partial<Record<AgentName, number>>;
  retries: number;
  queued: boolean;
  percent: number;
  message: string;
  log: LogLine[];
}

export function initialProgress(): RunProgress {
  return {
    sessionId: null,
    mode: null,
    phases: Object.fromEntries(AGENTS.map((a) => [a, 'pending'])) as Record<AgentName, PhaseState>,
    durations: {},
    retries: 0,
    queued: false,
    percent: 0,
    message: '',
    log: [],
  };
}

const STEP = 100 / AGENTS.length;

function percentOf(phases: Record<AgentName, PhaseState>): number {
  const done = AGENTS.filter((a) => phases[a] === 'done' || phases[a] === 'error').length;
  const active = AGENTS.some((a) => phases[a] === 'active') ? STEP / 2 : 0;
  return Math.min(99, Math.round(done * STEP + active));
}

function formatScientific(n: number): string {
  return Math.abs(n) > 0 && Math.abs(n) < 0.01 ? n.toExponential(2) : String(Math.round(n * 1000) / 1000);
}

/** A human-readable line for an event, or null if it adds nothing to the log. */
export function describeEvent(e: StreamEvent): LogLine | null {
  switch (e.event) {
    case 'queued':
      return { agent: 'Queue', text: e.message, tone: 'info' };
    case 'queries_generated':
      return { agent: 'SearchAgent', text: `Search queries: ${e.queries.map((q) => `"${q}"`).join(', ')}`, tone: 'info' };
    case 'papers_found':
      return { agent: 'SearchAgent', text: `${e.count} unique passages retrieved (${e.new} new)`, tone: 'info' };
    case 'relevance_check':
      return {
        agent: 'SearchAgent',
        text: `${e.relevant} relevant, ${e.weak} weak (${e.method} scoring, threshold ${e.threshold})`,
        tone: e.relevant === 0 ? 'warn' : 'info',
      };
    case 're_retrieving':
      return { agent: 'SearchAgent', text: `Weak results, retry ${e.attempt}: "${e.new_query}"`, tone: 'warn' };
    case 'extraction_start':
      return { agent: 'ExtractionAgent', text: `Reading ${e.chunks} passages from ${e.papers} papers`, tone: 'info' };
    case 'mp_lookup':
      return {
        agent: 'ExtractionAgent',
        text: `${e.records} database records for ${e.formulas} formulas (${e.online ? 'Materials Project' : 'offline reference table'})`,
        tone: e.online ? 'info' : 'warn',
      };
    case 'properties_extracted':
      return { agent: 'ExtractionAgent', text: `${e.records} property records (${e.literature} from literature)`, tone: 'info' };
    case 'screening_start':
      return { agent: 'ScreeningAgent', text: `Screening against ${e.criteria_count} criteria`, tone: 'info' };
    case 'krr_prediction':
      return { agent: 'ScreeningAgent', text: `KRR estimate for ${e.formula} ${e.property}: ${formatScientific(e.value)}`, tone: 'info' };
    case 'candidates_found':
      return { agent: 'ScreeningAgent', text: `${e.count} candidates, ${e.qualified} fully qualified`, tone: 'info' };
    case 'hypotheses_generated':
      return { agent: 'HypothesisAgent', text: `${e.count} hypotheses, ${e.gaps} knowledge gaps`, tone: 'info' };
    case 'grounding_check':
      return {
        agent: 'ReportBuilder',
        text: e.is_grounded ? `Every hypothesis is backed by its evidence (score ${e.score})` : `Some hypotheses are unsupported (score ${e.score})`,
        tone: e.is_grounded ? 'info' : 'warn',
      };
    case 'agent_error':
      return { agent: e.agent, text: `Failed and skipped: ${e.message}`, tone: 'error' };
    default:
      return null;
  }
}

export function applyEvent(state: RunProgress, e: StreamEvent): RunProgress {
  const next: RunProgress = { ...state, phases: { ...state.phases }, durations: { ...state.durations } };

  switch (e.event) {
    case 'session_started':
      next.sessionId = e.session_id;
      next.mode = e.mode;
      next.message = 'Research session started';
      break;
    case 'queued':
      next.queued = true;
      next.message = e.message;
      break;
    case 'agent_start':
      next.queued = false;
      next.phases[e.agent] = 'active';
      next.message = `${e.agent} working…`;
      break;
    case 'agent_complete':
      // Search runs once per retry pass: it is only "done" when the next agent starts.
      if (next.phases[e.agent] !== 'error') next.phases[e.agent] = 'done';
      next.durations[e.agent] = (next.durations[e.agent] ?? 0) + e.duration_ms;
      break;
    case 'agent_error':
      next.phases[e.agent] = 'error';
      break;
    case 're_retrieving':
      next.retries = e.attempt;
      break;
    default:
      break;
  }

  const line = describeEvent(e);
  if (line) {
    next.log = [...state.log, line];
    next.message = line.text;
  }
  next.percent = percentOf(next.phases);
  return next;
}
