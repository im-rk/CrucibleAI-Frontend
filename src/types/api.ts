/**
 * CrucibleAI API Contracts matching actual FastAPI backend implementation.
 */

export interface ResearchRequest {
  query: string;
  max_results?: number;
}

export interface PaperMetadata {
  arxiv_id: string;
  title: string;
  authors: string | string[];
  year: number;
  section?: string;
  abstract?: string;
  doi?: string;
  pdf_path?: string;
  ingested_at?: string;
}

export interface SearchResultChunk {
  id: string;
  text: string;
  similarity: number;
  metadata: PaperMetadata;
}

export interface MaterialProperty {
  material_id: string;
  formula: string;
  property_name: string;
  value: number | string;
  unit: string;
  source: string;
  doi?: string;
  is_direct_gap?: boolean | null;
  is_predicted?: boolean;
  confidence?: string;
}

export interface KRRPrediction {
  formula: string;
  property: string;
  predicted_value: number;
  unit: string;
  method: string;
  is_predicted: boolean;
  confidence: string;
  note: string;
  error?: string;
}

export interface AgentLogEntry {
  step: string;
  details: string;
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
  error?: string;
}

export interface SSEProgressEvent {
  phase: number;
  step: 'LITERATURE_SEARCH' | 'MATERIALS_PROJECT_LOOKUP' | 'KRR_PREDICTION' | 'SYNTHESIS' | string;
  message: string;
  progress: number;
}

export interface CorpusSamplePaper {
  id: string;
  arxiv_id: string;
  title: string;
  section: string;
  year: number;
  snippet: string;
}

export interface CorpusStatsResponse {
  total_chunks: number;
  sample_papers: CorpusSamplePaper[];
}

export interface HealthResponse {
  status: string;
  app_name: string;
  environment: string;
  vector_store_chunks: number;
  krr_engine: string;
  materials_project_api: string;
}

export interface MaterialLookupResponse {
  formula: string;
  properties: MaterialProperty[];
}

export interface PredictRequest {
  formula: string;
  property_name?: string;
}

export type ResearchStatus = 'IDLE' | 'SUBMITTING' | 'STREAMING' | 'COMPLETED' | 'ERROR';
