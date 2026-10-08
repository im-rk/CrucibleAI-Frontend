/**
 * CrucibleAI API contracts, matching the FastAPI backend (see CrucibleAI-Backend).
 */

export interface ResearchRequest {
  query: string;
  max_results?: number;
  /** A plan the user reviewed and edited; the backend uses it instead of planning itself. */
  plan?: PlanData | null;
}

export interface PaperMetadata {
  arxiv_id: string;
  title: string;
  authors: string | string[];
  year: number | null;
  section?: string;
  abstract?: string;
  doi?: string;
}

export interface SearchResultChunk {
  id: string;
  text: string;
  similarity: number;
  relevance_score?: number | null;
  rrf_score?: number | null;
  metadata: PaperMetadata;
}

export interface MaterialProperty {
  material_id: string;
  formula: string;
  property_name: string;
  value: number | string | null;
  unit: string;
  source: string;
  doi?: string;
  is_direct_gap?: boolean | null;
  is_predicted?: boolean;
  confidence?: string;
  method?: string;
}

export interface KRRPrediction {
  formula: string;
  property: string;
  predicted_value: number;
  unit: string;
  method: string;
  is_predicted: boolean;
  confidence: string;
  uncertainty?: number | null;
  cv_r2?: number | null;
  training_samples?: number | null;
  training_source?: string | null;
  note: string;
}

export interface AgentLogEntry {
  step: string;
  details: string;
  agent?: string;
  duration_ms?: number;
}

// ---- screening & report -------------------------------------------------------------------

export type CriterionStatus =
  | 'met'
  | 'not_met'
  | 'missing'
  | 'predicted_met'
  | 'predicted_not_met'
  | 'unverified';

export interface Criterion {
  kind: 'numeric' | 'exclude_elements' | 'measured_evidence' | 'qualitative';
  label: string;
  property_name?: string | null;
  operator?: string | null;
  value?: number | null;
  value_high?: number | null;
  unit?: string | null;
  elements?: string[];
}

export interface CriterionResult {
  label: string;
  kind: string;
  status: CriterionStatus;
  value: number | null;
  unit: string;
  is_predicted: boolean;
  source: string;
  detail: string;
}

export type CandidateStatus = 'qualified' | 'partial' | 'rejected' | 'unscreened';

export interface Candidate {
  rank: number;
  formula: string | null;
  name: string;
  status: CandidateStatus;
  score: number;
  origin: 'literature' | 'database';
  criteria: CriterionResult[];
  flags: string[];
  sources: { title: string; doi: string; source_id: string }[];
  record_count: number;
}

export interface Evidence {
  id: string;
  kind: 'chunk' | 'record';
  ref: string;
  title: string;
  doi: string;
  source_id: string;
  snippet: string;
}

export type Confidence = 'high' | 'medium' | 'low';

// ---- agentic additions: plan, investigation, trace, critic loop ---------------------------

export interface PlanData {
  summary: string;
  criteria: Criterion[];
  queries: string[];
  material_families: string[];
  source: 'llm' | 'heuristic' | 'user';
}

export interface PlanPreview {
  query: string;
  plan: PlanData;
  warnings: string[];
}

export interface InvestigationStep {
  n: number;
  thought: string;
  action: string;
  arguments: Record<string, string>;
  observation: string;
  ok?: boolean;
}

export interface Investigation {
  targets: string[];
  mode?: 'agent' | 'workflow';
  steps?: InvestigationStep[];
  answer?: string;
  new_passages?: number;
  new_records?: number;
  supported?: string[];
  rescreen?: boolean;
  skipped?: string;
}

export interface TraceSpan {
  kind: 'agent' | 'llm' | 'retrieval' | 'tool';
  name: string;
  agent: string | null;
  start_ms: number;
  duration_ms: number;
  status: string;
  attrs: Record<string, unknown>;
}

export interface TraceSummary {
  run_id: string;
  total_ms: number;
  llm: {
    calls: number; errors: number; cache_hits: number; prompt_tokens: number; completion_tokens: number;
    total_tokens: number; latency_ms: number; rate_limit_wait_ms: number; estimated_tokens: boolean;
    models: string[]; budget: number | null;
  };
  retrieval: { calls: number; latency_ms: number };
  tools: { calls: number };
  agents: Record<string, { duration_ms: number; llm_calls: number; tokens: number; retrievals: number }>;
  spans_dropped: number;
}

export interface RunTrace {
  summary: TraceSummary;
  spans: TraceSpan[];
}

export interface GroundingRound {
  round: number;
  score: number;
  unsupported: number;
  weak: number;
}

export interface AskResponse {
  answer: string;
  citations: { id: string; text: string }[];
  grounded: boolean;
  insufficient_evidence: boolean;
  mode: 'llm' | 'extractive';
}

export interface Hypothesis {
  statement: string;
  suggested_experiment: string;
  confidence: Confidence;
  evidence: Evidence[];
  unsupported_ids?: string[];
  ungrounded: boolean;
  origin: 'llm' | 'template' | 'llm-revised';
  revisions?: number;
  grounded?: boolean;
  grounding_note?: string;
}

export interface Citation {
  id: string;
  source_id: string;
  title: string;
  authors: string;
  year: number | null;
  doi: string;
  url: string;
  cited_by_hypotheses: number[];
  supports_candidates: string[];
}

export interface Grounding {
  is_grounded: boolean;
  score: number;
  method: 'rules' | 'llm+rules';
  history?: GroundingRound[];
  checked: number;
  unsupported: number;
  claims: { index: number; statement: string; verdict: string; reason: string }[];
}

/** What the run actually used: `llm` is the model id, or null in heuristic mode. */
export interface RunMode {
  llm: string | null;
  /** Why the LLM was not used (no key, rejected key, no credits); null when it was. */
  llm_unavailable_reason?: string | null;
  materials_project: 'live' | 'offline';
}

export interface ResearchResponse {
  session_id: string;
  status: 'COMPLETED' | 'ERROR';
  query: string;
  max_results: number;
  search_results: SearchResultChunk[];
  candidate_formulas: string[];
  property_records: Record<string, MaterialProperty[]>;
  krr_predictions: Record<string, KRRPrediction>;
  hypothesis: string;
  agent_logs: AgentLogEntry[];
  criteria: Criterion[];
  candidates: Candidate[];
  hypotheses: Hypothesis[];
  knowledge_gaps: string[];
  citations: Citation[];
  grounding: Grounding;
  warnings: string[];
  search_queries: string[];
  retrieval_attempts: number;
  mode: RunMode;
  duration_ms: number;
  plan?: PlanData | null;
  investigation?: Investigation | null;
  revisions?: number;
  trace?: RunTrace | null;
  error?: string;
}

// ---- streaming ----------------------------------------------------------------------------

/** The stages shown in the progress panel; the reviser runs inside the critic's stage. */
export const AGENTS = [
  'PlannerAgent',
  'SearchAgent',
  'ExtractionAgent',
  'ScreeningAgent',
  'InvestigatorAgent',
  'HypothesisAgent',
  'CriticAgent',
  'ReportBuilder',
] as const;
export type AgentName = (typeof AGENTS)[number];
export type EventAgent = AgentName | 'ReviserAgent';

export type StreamEvent =
  | { event: 'session_started'; session_id: string; query: string; mode: RunMode }
  | { event: 'queued'; message: string }
  | { event: 'agent_start'; agent: EventAgent }
  | { event: 'agent_complete'; agent: EventAgent; duration_ms: number }
  | { event: 'agent_error'; agent: EventAgent; message: string }
  | { event: 'plan_ready'; source: string; summary: string; criteria: string[]; queries: string[]; families: string[] }
  | { event: 'investigation_start'; targets: string[] }
  | { event: 'tool_call'; action: string; arguments: Record<string, string>; ok: boolean }
  | { event: 'investigation_done'; new_passages: number; new_records: number; supported: string[] }
  | { event: 'hypotheses_revised'; round: number; revised: number }
  | { event: 'queries_generated'; queries: string[] }
  | { event: 'papers_found'; count: number; new: number }
  | { event: 'relevance_check'; relevant: number; weak: number; threshold: number; method: string }
  | { event: 're_retrieving'; new_query: string; attempt: number }
  | { event: 'extraction_start'; chunks: number; papers: number }
  | { event: 'mp_lookup'; formulas: number; records: number; online: boolean }
  | { event: 'properties_extracted'; records: number; literature: number }
  | { event: 'screening_start'; criteria_count: number; records: number }
  | { event: 'krr_prediction'; formula: string; property: string; value: number }
  | { event: 'candidates_found'; count: number; qualified: number }
  | { event: 'hypotheses_generated'; count: number; gaps: number }
  | { event: 'grounding_check'; is_grounded: boolean; score: number; round?: number; revising?: boolean }
  | { event: 'complete'; report: ResearchResponse }
  | { event: 'error'; message: string };

// ---- other endpoints ----------------------------------------------------------------------

export interface CorpusSamplePaper {
  id: string;
  arxiv_id: string;
  title: string;
  section: string;
  year: number | null;
  snippet: string;
}

export interface CorpusStatsResponse {
  total_chunks: number;
  /** null when the backend's vector store cannot enumerate papers (e.g. Pinecone). */
  total_papers: number | null;
  sample_papers: CorpusSamplePaper[];
}

export interface HealthResponse {
  status: string;
  version?: string;
  app_name: string;
  environment: string;
  vector_store_chunks: number;
  krr_engine: string;
  materials_project_api: string;
  llm?: string;
  database?: 'connected' | 'unavailable' | 'disabled';
}

export interface MaterialLookupResponse {
  formula: string;
  source?: string;
  properties: MaterialProperty[];
}

export interface PredictRequest {
  formula: string;
  property_name?: string;
}

export type ResearchStatus = 'IDLE' | 'SUBMITTING' | 'STREAMING' | 'COMPLETED' | 'ERROR';

/** `scripts/run_evals.py` output; only the parts the UI shows are typed. */
export type EvalTable = Record<string, Record<string, number | null>>;
export interface ExtractionScore {
  model?: string;
  overall: { precision: number; recall: number; f1: number };
  value_accuracy: number | null;
  negative_items: number;
  negative_items_with_false_alarms: number;
}
export interface InjectionRun {
  overall_attack_success_rate: number;
  extraction: { attack_success_rate: number };
  relevance: { attack_success_rate: number };
  grounding: { attack_success_rate: number };
}
export interface E2ERun {
  invariant_pass_rate: number;
  task_success_rate: number | null;
  mean_grounding_score: number | null;
  mean_duration_s: number | null;
  cases: {
    goal: string; invariants_passed: number; invariants_total: number; expected_hit: boolean | null;
    qualified: string[]; grounding_score: number | null; llm_calls: number | null; tokens: number | null; duration_s: number;
  }[];
}
export interface EvaluationResults {
  generated_at?: string;
  llm?: string | null;
  retrieval?: {
    corpus_papers: number;
    tasks: Record<string, number>;
    sentence_to_paper: EvalTable;
    paraphrase_to_paper?: EvalTable;
    topic_to_papers: EvalTable;
  };
  extraction?: { passages: number; gold_records: number; rule_based?: ExtractionScore; llm?: ExtractionScore };
  injection?: {
    skipped?: string;
    scanner?: { payloads: number; flagged: number; rate: number };
    guardrails_on?: InjectionRun;
    guardrails_off?: InjectionRun;
  };
  e2e_heuristic?: E2ERun;
  e2e_llm?: E2ERun;
}
