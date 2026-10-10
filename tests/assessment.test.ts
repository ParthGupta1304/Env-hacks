import { describe, expect, it } from 'vitest';
import { assess, assessmentSchema, categories, categoryInfo, safetyFlags, type AssessmentInput } from '../shared/assessment';

export const working = (category: AssessmentInput['category'] = 'PHONE'): AssessmentInput => ({
  category, brand: '', model: '', estimatedAgeYears: '', consent: true, safetyReviewed: true,
  safetyFlags: [], faults: [], responses: { powersOn: 'YES', charges: 'YES', works: 'YES', ...(category === 'POWER_BANK' ? {} : { resetPossible: 'YES' as const }) },
});
describe('safety takes precedence', () => {
  for (const category of categories) for (const flag of safetyFlags) {
    it(`${category}: ${flag} overrides a working device`, () => {
      expect(assess({ ...working(category), safetyFlags: [flag] }).outcome).toBe('SAFETY_REVIEW');
    });
  }
  it('safety overrides unknown answers and repair faults', () => {
    const input = working();
    expect(assess({ ...input, safetyFlags: ['SWELLING'], faults: ['SCREEN'], responses: { ...input.responses, powersOn: 'UNKNOWN' } }).outcome).toBe('SAFETY_REVIEW');
  });
});
describe('PRD baseline outcomes', () => {
  it.each(categories)('working %s is a reuse candidate', category => expect(assess(working(category)).outcome).toBe('REUSE'));
  it('booting phone with broken screen is repair', () => expect(assess({ ...working(), faults: ['SCREEN'], responses: { ...working().responses, works: 'NO' } }).outcome).toBe('REPAIR'));
  it('booting laptop with faulty charger is repair', () => expect(assess({ ...working('LAPTOP'), faults: ['CHARGER'], responses: { ...working('LAPTOP').responses, charges: 'NO' } }).outcome).toBe('REPAIR'));
  it('non-booting phone without a bounded fault is recycle', () => expect(assess({ ...working(), responses: { ...working().responses, powersOn: 'NO' } }).outcome).toBe('RECYCLE'));
  it('missing critical laptop parts with no boot is recycle', () => expect(assess({ ...working('LAPTOP'), faults: ['MISSING_PARTS'], responses: { ...working('LAPTOP').responses, powersOn: 'NO' } }).outcome).toBe('RECYCLE'));
  it('account lock requires manual review', () => expect(assess({ ...working(), responses: { ...working().responses, resetPossible: 'NO' } }).outcome).toBe('MANUAL_REVIEW'));
  it('contradictory missing parts requires review', () => expect(assess({ ...working(), faults: ['MISSING_PARTS'] }).outcome).toBe('MANUAL_REVIEW'));
  it.each(categories)('uncertain function on %s requires review', category => expect(assess({ ...working(category), responses: { ...working(category).responses, works: 'UNKNOWN' } }).outcome).toBe('MANUAL_REVIEW'));
  it('never recommends power-bank repair across all functional combinations', () => {
    for (const powersOn of ['YES', 'NO', 'UNKNOWN'] as const) for (const charges of ['YES', 'NO', 'UNKNOWN'] as const) for (const works of ['YES', 'NO', 'UNKNOWN'] as const) {
      expect(assess({ ...working('POWER_BANK'), responses: { powersOn, charges, works } }).outcome).not.toBe('REPAIR');
    }
  });
  it('returns bounded explanations and versioned rules', () => {
    const result = assess({ ...working(), safetyFlags: [...safetyFlags] });
    expect(result.reasons.length).toBeLessThanOrEqual(3);
    expect(result.ruleId).toBeTruthy(); expect(result.rulesVersion).toBeTruthy();
    expect(result.limitation).toContain('cannot verify');
  });
});
describe('validation and category boundaries', () => {
  it.each(categories)('validates %s and stays within seven questions', category => {
    expect(assessmentSchema.safeParse(working(category)).success).toBe(true);
    expect(categoryInfo[category].questions.length + 2).toBeLessThanOrEqual(7);
  });
  it('requires consent, safety confirmation, and all functional answers', () => {
    for (const field of ['consent', 'safetyReviewed', 'responses'] as const) {
      const input: Record<string, unknown> = { ...working() }; delete input[field];
      expect(assessmentSchema.safeParse(input).success).toBe(false);
    }
  });
  it('rejects invalid category, out-of-range age, and cross-category faults', () => {
    expect(assessmentSchema.safeParse({ ...working(), category: 'TV' }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...working(), estimatedAgeYears: 21 }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...working('POWER_BANK'), faults: ['BATTERY'] }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...working(), faults: ['KEYBOARD'] }).success).toBe(false);
  });
});
