// components/common/BookingStepperNav.jsx
'use client';

import React from 'react';
import styles from '@/styles/BookingStepsNav.module.css';

export default function BookingStepperNav({
  steps = [],
  currentStep = 0,
  setCurrentStep = () => {},
  onNext = () => {},
  onBack = () => {},
  onSave = () => {},
  // NEW props 👇
  disabledNext = false,
  nextTitle = '',
}) {
  const safeSteps = Array.isArray(steps) ? steps : [];

  const handleNext = () => {
    if (disabledNext) return; // hard guard
    onNext();
  };

  return (
    <div className={styles.stepperHeader} role="region" aria-label="Booking steps">
      <div className={styles.stepList} role="tablist" aria-orientation="horizontal">
        {safeSteps.map((s, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'step' : undefined}
              className={[
                styles.stepItem,
                isActive ? styles.active : '',
                isDone ? styles.completed : '',
              ].join(' ')}
              onClick={() => i <= currentStep && setCurrentStep(i)}
            >
              <span className={styles.stepNumber}>{i + 1}</span>
              <span className={styles.stepTitle}>{s?.title ?? `Step ${i + 1}`}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.controlButtons}>
        {currentStep > 0 && (
          <button type="button" className={styles.backButton} onClick={onBack}>
            ← Back
          </button>
        )}

        {currentStep < safeSteps.length - 1 ? (
          <button
            type="button"
            className={styles.nextButton}
            onClick={handleNext}
            disabled={disabledNext}
            aria-disabled={disabledNext}
            title={disabledNext ? (nextTitle || 'Complete required fields to continue') : undefined}
          >
            Next →
          </button>
        ) : (
          <button type="button" className={styles.saveButton} onClick={onSave}>
            ✅ Save Booking
          </button>
        )}
      </div>
    </div>
  );
}
