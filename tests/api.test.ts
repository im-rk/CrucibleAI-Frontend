import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../src/services/api';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits research request with correct payload format', async () => {
    const mockResponse = {
      session_id: 'test-uuid-123',
      status: 'COMPLETED',
      query: 'solar cell',
      max_results: 10,
      search_results: [],
      candidate_formulas: ['GaN'],
      property_records: {},
      krr_predictions: {},
      hypothesis: 'Test hypothesis',
      agent_logs: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await api.submitResearch({ query: 'solar cell', max_results: 10 });
    expect(result.session_id).toBe('test-uuid-123');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/research'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query: 'solar cell', max_results: 10 }),
      })
    );
  });

  it('formats KRR predict request with embedded formula and property_name', async () => {
    const mockPredictRes = {
      formula: 'GaN',
      property: 'band_gap',
      predicted_value: 3.4,
      unit: 'eV',
      method: 'Kernel Ridge Regression (RBF kernel)',
      is_predicted: true,
      confidence: 'medium',
      note: 'Test note',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPredictRes,
    } as Response);

    const result = await api.predictProperty('GaN', 'band_gap');
    expect(result.predicted_value).toBe(3.4);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/predict'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ formula: 'GaN', property_name: 'band_gap' }),
      })
    );
  });
});
