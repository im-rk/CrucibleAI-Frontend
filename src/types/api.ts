/**
 * CrucibleAI API contracts, matching the FastAPI backend (see CrucibleAI-Backend).
 */

export interface ResearchRequest {
  query: string;
  max_results?: number;
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

export interface Hypothesis {
  statement: string;
  suggested_experiment: string;
  confidence: Confidence;
  evidence: Evidence[];
  unsupported_ids?: string[];
  ungrounded: boolean;
  origin: 'llm' | 'template';
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
  error?: string;
}

// ---- streaming ----------------------------------------------------------------------------

export const AGENTS = [
  'SearchAgent',
  'ExtractionAgent',
  'ScreeningAgent',
  'HypothesisAgent',
  'ReportBuilder',
] as const;
export type AgentName = (typeof AGENTS)[number];

export type StreamEvent =
  | { event: 'session_started'; session_id: string; query: string; mode: RunMode }
  | { event: 'queued'; message: string }
  | { event: 'agent_start'; agent: AgentName }
  | { event: 'agent_complete'; agent: AgentName; duration_ms: number }
  | { event: 'agent_error'; agent: AgentName; message: string }
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
  | { event: 'grounding_check'; is_grounded: boolean; score: number }
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
