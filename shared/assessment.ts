import { z } from 'zod';

export const RULES_VERSION = '2026-10-mvp-1';
export const SAFETY_COPY = 'Stop using and do not charge this device. Keep it away from heat and combustible materials. Do not place it in household waste. Contact the campus coordinator or a qualified e-waste/battery handler for the next step.';
export const categories = ['PHONE', 'LAPTOP', 'POWER_BANK'] as const;
export type DeviceCategory = typeof categories[number];
export const safetyFlags = ['SWELLING', 'HEAT', 'LIQUID', 'EXPOSED_WIRING', 'PUNCTURE', 'BURN_SMELL'] as const;
export const faults = ['SCREEN', 'BATTERY', 'CHARGING_PORT', 'KEYBOARD', 'CHARGER', 'MISSING_PARTS'] as const;
export const safetyLabels: Record<typeof safetyFlags[number], string> = {
  SWELLING: 'Swelling or a bulging case', HEAT: 'Strong heat or smoke', LIQUID: 'Liquid damage or corrosion',
  EXPOSED_WIRING: 'Exposed wires or battery', PUNCTURE: 'Puncture or crushed battery', BURN_SMELL: 'Burning smell',
};
export const faultLabels: Record<typeof faults[number], string> = {
  SCREEN: 'Screen / touch', BATTERY: 'Weak battery (no heat or swelling)', CHARGING_PORT: 'Charging port',
  KEYBOARD: 'Keyboard', CHARGER: 'Charger', MISSING_PARTS: 'Missing critical parts',
};
const answer = z.enum(['YES', 'NO', 'UNKNOWN']);
export type Answer = z.infer<typeof answer>;
type Question = { key: 'powersOn' | 'charges' | 'works' | 'resetPossible'; label: string; help: string };
export const categoryInfo: Record<DeviceCategory, { label: string; description: string; questions: Question[]; faults: (typeof faults[number])[] }> = {
  PHONE: { label: 'Phone', description: 'Smartphones & feature phones', questions: [
    { key: 'powersOn', label: 'Does it power on?', help: 'Use what you already know. Do not test a device with a safety concern.' },
    { key: 'charges', label: 'Does it charge normally?', help: 'A weak battery is different from one that is hot or swollen.' },
    { key: 'works', label: 'Do the screen and touch / buttons work?', help: 'Include cracks that prevent normal use.' },
    { key: 'resetPossible', label: 'Can you sign out and reset it?', help: 'If an account lock prevents this, choose No or Not sure.' },
  ], faults: ['SCREEN', 'BATTERY', 'CHARGING_PORT', 'MISSING_PARTS'] },
  LAPTOP: { label: 'Laptop', description: 'Personal & retired campus laptops', questions: [
    { key: 'powersOn', label: 'Does it boot up?', help: 'Use what you already know. Do not test a device with a safety concern.' },
    { key: 'charges', label: 'Does the battery / charger supply power?', help: 'Choose No for a known faulty charger.' },
    { key: 'works', label: 'Do the display and keyboard work?', help: 'Think about whether someone can use it normally.' },
    { key: 'resetPossible', label: 'Can you sign out and reset it?', help: 'Institutional laptops may need your IT department.' },
  ], faults: ['SCREEN', 'BATTERY', 'KEYBOARD', 'CHARGER', 'MISSING_PARTS'] },
  POWER_BANK: { label: 'Power bank', description: 'Portable battery packs', questions: [
    { key: 'powersOn', label: 'Does it turn on / show a power indicator?', help: 'Use what you already know. Do not test a device with a safety concern.' },
    { key: 'charges', label: 'Does it accept a charge normally?', help: 'Do not plug it in just to answer this question.' },
    { key: 'works', label: 'Is the case intact and does it reliably charge another device?', help: 'A puncture, swelling, or burning smell belongs in the safety question.' },
  ], faults: [] },
};

export const assessmentSchema = z.object({
  category: z.enum(categories),
  brand: z.string().trim().max(80).default(''),
  model: z.string().trim().max(100).default(''),
  estimatedAgeYears: z.union([z.number().min(0).max(20), z.literal('')]).default(''),
  consent: z.literal(true, { error: 'Confirm consent before continuing.' }),
  safetyReviewed: z.literal(true, { error: 'Confirm that you reviewed the safety signs.' }),
  safetyFlags: z.array(z.enum(safetyFlags)).max(6),
  faults: z.array(z.enum(faults)).max(6),
  responses: z.object({ powersOn: answer, charges: answer, works: answer, resetPossible: answer.optional() }),
}).superRefine((input, ctx) => {
  if (input.category !== 'POWER_BANK' && !input.responses.resetPossible) {
    ctx.addIssue({ code: 'custom', path: ['responses', 'resetPossible'], message: 'Answer the reset question.' });
  }
  if (input.faults.some(f => !categoryInfo[input.category].faults.includes(f))) {
    ctx.addIssue({ code: 'custom', path: ['faults'], message: 'Choose faults that apply to this category.' });
  }
});
export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type AssessmentForm = z.input<typeof assessmentSchema>;
export const outcomes = ['SAFETY_REVIEW', 'MANUAL_REVIEW', 'REUSE', 'REPAIR', 'RECYCLE'] as const;
export const decisionSchema = z.object({
  outcome: z.enum(outcomes), confidenceBand: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  reasons: z.array(z.string()).min(1).max(3), limitation: z.string(), nextAction: z.string(), rulesVersion: z.string(), ruleId: z.string(),
});
export type Decision = z.infer<typeof decisionSchema>;

// Only direct answers and user-confirmed conditions belong here. AI suggestions never decide.
export function assess(input: AssessmentInput): Decision {
  const result = (outcome: Decision['outcome'], ruleId: string, reasons: string[], nextAction: string, confidenceBand: Decision['confidenceBand'] = 'MEDIUM'): Decision => ({
    outcome, ruleId, reasons: reasons.slice(0, 3), nextAction, confidenceBand, rulesVersion: RULES_VERSION,
    limitation: 'This checklist cannot verify internal battery health, electrical safety, or that personal data has been erased. A qualified person must confirm the final disposition.',
  });
  if (input.safetyFlags.length) return result('SAFETY_REVIEW', 'safety.any-flag', input.safetyFlags.map(f => `Reported: ${safetyLabels[f].toLowerCase()}.`), SAFETY_COPY, 'HIGH');
  const { powersOn, charges, works, resetPossible } = input.responses;
  const core = [powersOn, charges, works];
  const allWorking = core.every(a => a === 'YES');
  if (input.faults.includes('MISSING_PARTS') && allWorking) return result('MANUAL_REVIEW', 'evidence.contradictory', ['The functional answers and missing-parts report conflict.'], 'Ask a campus coordinator or technician to review the device.', 'LOW');
  if (input.category === 'POWER_BANK') {
    if (core.includes('UNKNOWN')) return result('MANUAL_REVIEW', 'power-bank.unknown', ['Important function or case-condition information is uncertain.'], 'Ask a qualified battery handler to review it. Do not open the battery pack.', 'LOW');
    if (allWorking) return result('REUSE', 'power-bank.working', ['You reported an intact case and reliable charging / discharge.', 'No safety concern was reported.'], 'Ask the campus coordinator to confirm a suitable reuse destination.');
    return result('RECYCLE', 'power-bank.failed', ['The power bank does not reliably turn on, charge, or discharge.', 'Power-bank repair is not offered in this pilot.'], 'Arrange review and handover to a qualified, authorised e-waste / battery handler.');
  }
  if (input.faults.includes('MISSING_PARTS') && powersOn === 'NO') return result('RECYCLE', 'device.missing-critical-parts', ['The device does not boot and has missing critical parts.'], 'Ask a technician to confirm end-of-life status before an authorised recycling handover.');
  const bounded = input.faults.filter(f => f !== 'MISSING_PARTS');
  if (powersOn === 'YES' && bounded.length && !input.faults.includes('MISSING_PARTS')) return result('REPAIR', 'device.bounded-fault', ['The device powers on.', `Reported repair candidates: ${bounded.map(f => faultLabels[f].toLowerCase()).join(', ')}.`, 'No safety concern was reported.'], 'Ask a qualified technician to inspect the reported fault before deciding on reuse.');
  if (core.includes('UNKNOWN') || resetPossible === 'UNKNOWN') return result('MANUAL_REVIEW', 'evidence.unknown', ['Some information needed for a confident next step is uncertain.'], 'Ask the campus coordinator or IT department to check the missing information.', 'LOW');
  if (allWorking && resetPossible === 'YES' && !input.faults.length) return result('REUSE', 'device.working-resettable', ['The device powers on, charges, and its main controls work.', 'You reported that sign-out and reset are possible.', 'No safety concern was reported.'], 'Back up your data, sign out, remove SIM / SD cards where present, and reset before handover.');
  if (powersOn === 'NO' && !bounded.length) return result('RECYCLE', 'device.non-booting', ['The device does not boot and no bounded repair fault is identified.'], 'Ask a technician to confirm that repair is not reasonable; then choose an authorised recycler.');
  return result('MANUAL_REVIEW', 'device.needs-inspection', [resetPossible === 'NO' ? 'Account access or reset needs attention before reuse.' : 'The evidence does not identify a clear, bounded repair path.'], 'Ask the campus coordinator or IT department to review the device.', 'LOW');
}
