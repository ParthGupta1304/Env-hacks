import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { assessmentSchema, categories, categoryInfo, faultLabels, safetyFlags, safetyLabels, SAFETY_COPY, type AssessmentForm, type AssessmentInput, type Decision, type DeviceCategory } from '../shared/assessment';
import { DeviceIcon } from './DeviceIcon';
import { PhotoPicker } from './PhotoPicker';
import { getAssessment } from './api';

const outcomeCopy: Record<Decision['outcome'], { title: string; intro: string }> = {
  REUSE: { title: 'A second life looks possible.', intro: 'Reuse / donate candidate' },
  REPAIR: { title: 'A repair could keep it in use.', intro: 'Repair candidate' },
  RECYCLE: { title: 'Make its next stop responsible.', intro: 'Recycle candidate' },
  SAFETY_REVIEW: { title: 'Pause. This needs a safety review.', intro: 'Safety concern reported' },
  MANUAL_REVIEW: { title: 'Let’s get another pair of eyes.', intro: 'Manual review needed' },
};

export function App() {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [category, setCategory] = useState<DeviceCategory>('PHONE');
  const [result, setResult] = useState<Awaited<ReturnType<typeof getAssessment>> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { register, watch, setValue, trigger, handleSubmit, reset, formState: { errors } } = useForm<AssessmentForm, unknown, AssessmentInput>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: { category: 'PHONE', brand: '', model: '', estimatedAgeYears: '', safetyFlags: [], faults: [], responses: {} },
  });
  const selectedSafety = watch('safetyFlags') ?? [];
  const consent = watch('consent') === true;
  const info = categoryInfo[category];
  const mutation = useMutation({ mutationFn: getAssessment, onSuccess: data => { setResult(data); setStage(3); } });
  useEffect(() => { if (stage) heading.current?.focus(); }, [stage]);

  const choose = (next: DeviceCategory) => {
    reset({ category: next, brand: '', model: '', estimatedAgeYears: '', safetyFlags: [], faults: [], responses: {} });
    setCategory(next); setResult(null); mutation.reset(); setStage(1);
  };
  const submit = handleSubmit(input => mutation.mutate(input));
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#" onClick={event => { event.preventDefault(); setStage(0); }} aria-label="RebootRoute home"><img src="/favicon.svg" alt="" /><span>Reboot<span className="brand-light">Route</span></span></a>
      <span className="header-caption">Repair first. Recycle right.</span>
      <span className="pilot-tag"><span aria-hidden="true" /> Campus pilot</span>
    </header>
    <main id="main" className={stage === 0 ? 'landing' : 'flow'}>
      {stage === 0 ? <>
        <section className="hero">
          <div className="hero-copy"><p className="eyebrow">A better route for old electronics</p><h1>Old device.<br />New possibilities.</h1><p className="hero-intro">Before it becomes e-waste, find out if your device can be repaired, reused, or responsibly recycled.</p><a className="button primary" href="#categories">Find its next step <span aria-hidden="true">↗</span></a><p className="hero-note">A short checklist. No account needed.</p></div>
          <div className="route-board" aria-label="Device journey: assess, repair or reuse when possible, then authorised recycling">
            <div className="board-label">Every device has a next chapter.</div>
            <div className="board-device"><DeviceIcon category="PHONE" /><span>Your old device</span></div>
            <div className="route-stem" /><div className="route-options"><div><span className="route-symbol" aria-hidden="true">↗</span><strong>Repair</strong><span>Keep it working</span></div><div><span className="route-symbol" aria-hidden="true">↔</span><strong>Reuse</strong><span>Pass it forward</span></div><div><span className="route-symbol" aria-hidden="true">↻</span><strong>Recycle</strong><span>Close the loop</span></div></div>
            <p className="board-footer">Safety comes first, at every step.</p>
          </div>
        </section>
        <section id="categories" className="category-section"><div className="section-title"><div><p className="eyebrow">Start with what you have</p><h2>Which device needs a next step?</h2></div><span className="small-note">About 3–5 minutes</span></div><div className="category-grid">{categories.map(value => <button key={value} className="category-card" onClick={() => choose(value)}><DeviceIcon category={value} /><div><h3>{categoryInfo[value].label}</h3><p>{categoryInfo[value].description}</p></div><span className="card-arrow" aria-hidden="true">↗</span></button>)}</div></section>
        <section className="trust-strip"><div><span aria-hidden="true">✓</span><p><strong>Repair before recycling</strong><br />Useful devices deserve another chance.</p></div><div><span aria-hidden="true">◇</span><p><strong>Your data stays yours</strong><br />We guide you. You control the reset.</p></div><div><span aria-hidden="true">⊕</span><p><strong>Safety before shortcuts</strong><br />Battery concerns go to a qualified person.</p></div></section>
      </> : <>
        <nav aria-label="Assessment progress" className="stepper">{['Device details', 'Condition check', 'Next step'].map((label, index) => <span key={label} aria-current={stage === index + 1 ? 'step' : undefined} className={stage >= index + 1 ? 'active' : ''}><b>{index + 1}</b>{label}</span>)}</nav>
        <div className="flow-layout"><aside className="device-summary"><DeviceIcon category={category} /><p className="eyebrow">Your device</p><h2>{info.label}</h2><p>Small choices keep useful electronics out of the waste stream.</p><div className="summary-note">A recommendation is a starting point. A qualified person confirms the final route.</div><button className="text-button" type="button" onClick={() => setStage(0)}>Change device type</button></aside>
          <section className="form-panel">
            <div hidden={stage !== 1}><p className="eyebrow">Step 1 · Device details</p><h1 tabIndex={-1} ref={stage === 1 ? heading : undefined}>Tell us what you have.</h1><p className="panel-intro">A little context helps. You can leave the model and photos blank.</p><form onSubmit={async event => { event.preventDefault(); if (await trigger(['category', 'brand', 'model', 'estimatedAgeYears', 'consent'])) setStage(2); }}>
              <div className="field-row"><label>Brand <span className="optional">optional</span><input {...register('brand')} placeholder="e.g. Samsung" maxLength={80} />{errors.brand && <span role="alert" className="error-text">{errors.brand.message}</span>}</label><label>Model <span className="optional">optional</span><input {...register('model')} placeholder="e.g. Galaxy A52" maxLength={100} />{errors.model && <span role="alert" className="error-text">{errors.model.message}</span>}</label></div>
              <label className="age-field">Approximate age in years <span className="optional">optional</span><input type="number" min="0" max="20" step="0.5" placeholder="0–20" {...register('estimatedAgeYears', { setValueAs: value => value === '' ? '' : Number(value) })} />{errors.estimatedAgeYears && <span role="alert" className="error-text">{errors.estimatedAgeYears.message}</span>}</label>
              <PhotoPicker consent={consent} />
              <label className="checkbox-row consent"><input type="checkbox" {...register('consent')} /><span>I consent to using these device details and any selected photos for this assessment. I have permission to share them.</span></label>{errors.consent && <p role="alert" className="error-text">{errors.consent.message}</p>}
              <div className="form-actions"><button className="text-button" type="button" onClick={() => setStage(0)}>Back</button><button className="button primary" type="submit">Check condition <span aria-hidden="true">→</span></button></div>
            </form></div>
            {stage === 2 && <><p className="eyebrow">Step 2 · Condition check</p><h1 tabIndex={-1} ref={heading}>What do you already know?</h1><p className="panel-intro">Use your existing observations. Choose “Not sure” when you don’t know.</p><form onSubmit={event => { if (selectedSafety.length) { setValue('responses', { powersOn: 'UNKNOWN', charges: 'UNKNOWN', works: 'UNKNOWN', ...(category === 'POWER_BANK' ? {} : { resetPossible: 'UNKNOWN' }) }); } void submit(event); }}>
              <fieldset className="safety-question"><legend>Any of these safety signs?</legend><p className="help">Check all that apply. Do not charge or test a device that may be damaged.</p><div className="checkbox-grid">{safetyFlags.map(flag => <label key={flag} className="checkbox-row"><input type="checkbox" value={flag} {...register('safetyFlags')} /><span>{safetyLabels[flag]}</span></label>)}</div><label className="checkbox-row safety-confirm"><input type="checkbox" {...register('safetyReviewed')} /><span>I reviewed these signs and selected every concern I know about.</span></label>{errors.safetyReviewed && <p role="alert" className="error-text">{errors.safetyReviewed.message}</p>}</fieldset>
              {selectedSafety.length ? <div className="safety-alert" role="status"><strong>Stop here — don’t test the device.</strong><p>{SAFETY_COPY}</p></div> : <>
                {info.questions.map(question => <fieldset className="answer-question" key={question.key}><legend>{question.label}</legend><p className="help">{question.help}</p><div className="answer-options">{(['YES', 'NO', 'UNKNOWN'] as const).map(value => <label key={value}><input type="radio" value={value} {...register(`responses.${question.key}`)} /><span>{value === 'UNKNOWN' ? 'Not sure' : value === 'YES' ? 'Yes' : 'No'}</span></label>)}</div>{errors.responses?.[question.key] && <p className="error-text" role="alert">Choose Yes, No, or Not sure.</p>}</fieldset>)}
                {info.faults.length > 0 && <fieldset className="answer-question"><legend>Any known faults or missing parts?</legend><p className="help">Select known issues only, or leave blank. Battery heat and swelling belong in the safety question above.</p><div className="checkbox-grid">{info.faults.map(fault => <label className="checkbox-row" key={fault}><input type="checkbox" value={fault} {...register('faults')} /><span>{faultLabels[fault]}</span></label>)}</div></fieldset>}
              </>}
              {errors.faults && <p role="alert" className="error-text">{errors.faults.message}</p>}{mutation.isError && <p role="alert" className="error-text">Could not assess this device. Check your answers and try again.</p>}
              <div className="form-actions"><button type="button" className="text-button" onClick={() => setStage(1)} disabled={mutation.isPending}>Back</button><button className={`button ${selectedSafety.length ? 'safety-button' : 'primary'}`} disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Checking…' : selectedSafety.length ? 'Get safety guidance' : 'Find the next step'} <span aria-hidden="true">→</span></button></div>
            </form></>}
            {stage === 3 && result && <div className={`result ${result.decision.outcome === 'SAFETY_REVIEW' ? 'safety-result' : ''}`}><p className="outcome-tag">{outcomeCopy[result.decision.outcome].intro}</p><h1 tabIndex={-1} ref={heading}>{outcomeCopy[result.decision.outcome].title}</h1><p className="result-confidence">Confidence in this route: <strong>{result.decision.confidenceBand.toLowerCase()}</strong>{result.decision.outcome === 'SAFETY_REVIEW' && ' · not a safety certification'}</p><h2>Why this route</h2><ul className="reason-list">{result.decision.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul><div className={`next-action ${result.decision.outcome === 'SAFETY_REVIEW' ? 'safety-alert' : ''}`}><h2>Your next step</h2><p>{result.decision.nextAction}</p></div>
              {result.decision.outcome === 'REUSE' && category !== 'POWER_BANK' && <div className="privacy-list"><h2>Before handing it over</h2><ul><li>Back up anything you want to keep.</li><li>Sign out and remove account locks.</li><li>Remove SIM / SD cards where present.</li><li>Reset the device, following the manufacturer’s guidance.</li></ul><p>These are steps for you to perform. RebootRoute does not erase data or certify a wipe.</p></div>}
              <div className="limitations"><strong>What this assessment can’t confirm</strong><p>{result.decision.limitation}</p>{result.decision.outcome === 'SAFETY_REVIEW' && <p>This is a safety escalation, not professional or emergency advice.</p>}</div>
              {result.source === 'fallback' && <p role="status" className="fallback-note">The online service is unavailable. This recommendation was calculated locally from your answers.</p>}
              <p className="preview-note">This preview gives guidance only. Your assessment has not been saved and no handover is recorded.</p><div className="form-actions"><button className="text-button" type="button" onClick={() => setStage(2)}>Review my answers</button><button className="button secondary" type="button" onClick={() => { reset(); setResult(null); setStage(0); }}>Assess another device</button></div><p className="rule-version">Rule {result.decision.ruleId} · {result.decision.rulesVersion}</p>
            </div>}
          </section>
        </div>
      </>}
    </main><footer className="site-footer"><span>RebootRoute <span aria-hidden="true">↗</span> A second life, a safer route.</span><span>Built for campus e-waste drives · Waste & Energy</span></footer>
  </>;
}
