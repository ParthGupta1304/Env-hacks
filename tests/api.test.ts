import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAssessment } from '../src/api';
import { assess, type AssessmentInput } from '../shared/assessment';

const input: AssessmentInput = { category: 'POWER_BANK', brand: '', model: '', estimatedAgeYears: '', consent: true, safetyReviewed: true, safetyFlags: ['SWELLING'], faults: [], responses: { powersOn: 'UNKNOWN', charges: 'UNKNOWN', works: 'UNKNOWN' } };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('assessment network fallback', () => {
  it('works without any AWS configuration or fetch', async () => {
    vi.stubEnv('VITE_API_BASE_URL', ''); const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    expect((await getAssessment(input)).source).toBe('local'); expect(fetcher).not.toHaveBeenCalled();
  });
  it('keeps the safety outcome if the API times out', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.invalid/development'); vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    const result = await getAssessment(input); expect(result.source).toBe('fallback'); expect(result.decision.outcome).toBe('SAFETY_REVIEW');
  });
  it('rejects a remote safety downgrade', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.invalid/development'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...assess(input), outcome: 'REUSE' }) }));
    const result = await getAssessment(input); expect(result.source).toBe('fallback'); expect(result.decision.outcome).toBe('SAFETY_REVIEW');
  });
  it('falls back on invalid response, version mismatch, and HTTP failure', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.invalid/development');
    for (const response of [{ ok: true, json: async () => ({ outcome: 'REUSE' }) }, { ok: true, json: async () => ({ ...assess(input), rulesVersion: 'unrecognised' }) }, { ok: false }]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response)); expect((await getAssessment(input)).source).toBe('fallback');
    }
  });
  it('accepts the deployed preview contract', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.invalid/development/'); const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => assess(input) }); vi.stubGlobal('fetch', fetcher);
    expect((await getAssessment(input)).source).toBe('aws'); expect(fetcher.mock.calls[0][0]).toBe('https://example.invalid/development/assessments/preview');
  });
});
