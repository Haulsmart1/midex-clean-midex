// /components/admin/BookingStepper.jsx
'use client';

import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const hasDoc = (x) => {
  if (!x) return false;
  if (typeof x === 'string') return x.trim().length > 0;
  return !!(x.url || x.publicUrl || x.href || x.path || x.filepath);
};

export default function BookingStepper({
  steps = [],
  currentStep = 0,
  setCurrentStep,
  onSave = () => {},
  routeInfo,
}) {
  const form = useFormContext?.();
  const getValues = form?.getValues ?? (() => ({}));
  const control   = form?.control;

  useWatch({
    control,
    name: [
      'customsFiles.invoice',
      'customsFiles.packing',
      'customsFiles.delivery',
      'senderEori',
      'receiverEori',
      'commodityCodes',
      '__customsReady',
    ],
  });

  const total = Array.isArray(steps) ? steps.length : 0;
  const clamp = (n) => Math.max(0, Math.min(Math.max(total - 1, 0), n));
  const titleAt = (i) => (steps?.[i]?.title || '').toLowerCase();

  useEffect(() => {
    if (!Number.isFinite(currentStep)) setCurrentStep(0);
    if (currentStep > total - 1) setCurrentStep(Math.max(total - 1, 0));
    if (currentStep < 0) setCurrentStep(0);
  }, [total, currentStep, setCurrentStep]);

  const isCustoms = titleAt(currentStep) === 'customs';
  let customsReady = true;

  try {
    const v = getValues();
    if (isCustoms) {
      if (typeof v?.__customsReady !== 'undefined') {
        customsReady = !!v.__customsReady;
      } else {
        const f = v?.customsFiles || {};
        const docsOK = ['invoice', 'packing', 'delivery'].every((k) => hasDoc(f[k]));
        const senderOK = !!(v?.senderEori || '').trim();
        const receiverOK = !!(v?.receiverEori || '').trim();
        const codesOK =
          Array.isArray(v?.commodityCodes) &&
          v.commodityCodes.filter((c) => (c || '').trim().length > 0).length > 0;
        customsReady = docsOK && senderOK && receiverOK && codesOK;
      }
    }
  } catch {
    customsReady = false;
  }

  const blockNext = isCustoms && !customsReady;

  const go = (idx) => setCurrentStep(clamp(idx));
  const onNext = () => !blockNext && go(currentStep + 1);
  const onBack = () => go(currentStep - 1);
  const atLast = currentStep >= total - 1;

  if (!total) return <div style={wrap}><h3>No steps configured</h3></div>;

  return (
    <div style={wrap}>
      {/* Stepper header */}
      <div style={row}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {steps.map((s, i) => {
            const active = i === currentStep;
            const done = i < currentStep;
            return (
              <button
                key={`${s.title}-${i}`}
                type="button"
                style={{ ...pill, ...(active ? pillActive : {}), ...(done ? pillDone : {}) }}
                onClick={() => go(i)}
              >
                <span style={pillIndex}>{i + 1}</span> {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div style={{ marginTop: 12 }}>{steps[currentStep]?.content}</div>

      {/* Stepper controls - always pinned below */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onBack} style={btn} disabled={currentStep === 0}>
          ← Back
        </button>
        {!atLast ? (
          <button
            type="button"
            onClick={onNext}
            style={{ ...btn, ...btnNext }}
            disabled={blockNext}
            title={blockNext ? 'Complete customs requirements first.' : ''}
          >
            Next →
          </button>
        ) : (
          <button type="button" onClick={onSave} style={{ ...btn, ...btnSave }}>
            ✅ Save Booking
          </button>
        )}
      </div>

      {blockNext && (
        <div style={{ color: '#ffb4b4', marginTop: 8 }}>
          Please upload invoice, packing and delivery docs, and fill EORI + codes.
        </div>
      )}
    </div>
  );
}

/* styles */
const wrap = { padding: 12, borderRadius: 12, background: 'rgba(12,18,28,.6)' };
const row = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 };
const pill = { display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:10, border:'1px solid #28405f', background:'#0f1724cc', color:'#cfeaff', fontWeight:600, fontSize:13, cursor:'pointer' };
const pillActive = { borderColor:'#69d6ff', boxShadow:'0 0 0 2px rgba(105,214,255,.2)' };
const pillDone = { opacity:.9, borderColor:'#1e314c' };
const pillIndex = { minWidth:22, height:22, borderRadius:999, display:'inline-flex', alignItems:'center', justifyContent:'center', background:'#1d2636', color:'#a6dfff', fontWeight:800, fontSize:12 };
const btn = { padding:'8px 12px', borderRadius:10, border:'1px solid #2a4365', background:'#17223a', color:'#eaf6ff', fontWeight:700, cursor:'pointer' };
const btnNext = { background:'linear-gradient(90deg,#7b2cff,#00f7ff)', color:'#06131a' };
const btnSave = { background:'linear-gradient(90deg,#21d07a,#00f7ff)', color:'#061a14' };
