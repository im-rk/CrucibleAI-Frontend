import {
  ResearchRequest,
  ResearchResponse,
  KRRPrediction,
  MaterialLookupResponse,
  CorpusStatsResponse,
  HealthResponse,
} from '../types/api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data && typeof data === 'object' && 'detail' in data) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Ignore JSON parse errors for error status
    }
    throw new ApiClientError(errorDetail, response.status);
  }
  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Submit a materials-science research goal to the backend agent pipeline.
   */
  async submitResearch(request: ResearchRequest): Promise<ResearchResponse> {
    const response = await fetch(`${API_BASE_URL}/api/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: request.query,
        max_results: request.max_results || 10,
      }),
    });
    return handleResponse<ResearchResponse>(response);
  },

  /**
   * Direct Kernel Ridge Regression property prediction for a chemical formula.
   */
  async predictProperty(formula: string, propertyName = 'band_gap'): Promise<KRRPrediction> {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Note: Backend server.py uses Body(..., embed=True) for formula & property_name
      body: JSON.stringify({
        formula: formula.trim(),
        property_name: propertyName,
      }),
    });
    return handleResponse<KRRPrediction>(response);
  },

  /**
   * Direct Materials Project lookup for a formula.
   */
  async lookupMaterial(formula: string): Promise<MaterialLookupResponse> {
    const url = new URL(`${API_BASE_URL || window.location.origin}/api/materials/lookup`);
    url.searchParams.append('formula', formula.trim());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MaterialLookupResponse>(response);
  },

  /**
   * Fetch Paper Corpus vector store indexing statistics.
   */
  async getCorpusStats(): Promise<CorpusStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/corpus`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<CorpusStatsResponse>(response);
  },

  /**
   * Fetch System Health and readiness status.
   */
  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<HealthResponse>(response);
  },
};
