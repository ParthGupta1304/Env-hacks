import { assess, decisionSchema, type AssessmentInput, type Decision } from '../shared/assessment';

export async function getAssessment(input: AssessmentInput): Promise<{ decision: Decision; source: 'local' | 'aws' | 'fallback' }> {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (!base) return { decision: assess(input), source: 'local' };
  try {
    const response = await fetch(`${base}/assessments/preview`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Assessment API unavailable');
    const decision = decisionSchema.parse(await response.json());
    // A server version mismatch or unexpected downgrade must never remove a local safety flag.
    const local = assess(input);
    if (decision.rulesVersion !== local.rulesVersion || (local.outcome === 'SAFETY_REVIEW' && decision.outcome !== 'SAFETY_REVIEW')) {
      return { decision: local, source: 'fallback' };
    }
    return { decision, source: 'aws' };
  } catch {
    return { decision: assess(input), source: 'fallback' };
  }
}
