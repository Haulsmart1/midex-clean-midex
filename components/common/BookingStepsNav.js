import React from 'react';

/**
 * Navigation for multi-step booking.
 * 
 * Props:
 * - currentStep (number): The index of the active step.
 * - steps (array): Steps array with at least .title on each.
 * - onNext (function): Called on "Next".
 * - onBack (function): Called on "Back".
 * - onSave (function): Called on "Book Now" (final step).
 * - buttonProps (object): Passes to the main action button, e.g., { disabled: true }.
 */
export default function BookingStepsNav({
  currentStep,
  steps = [],
  onNext,
  onBack,
  onSave,
  buttonProps = {},
}) {
  const isFinalStep = currentStep === steps.length - 1;

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto 0', textAlign: 'center' }}>
      {/* Step indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: 8 }}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          return (
            <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isActive
                    ? 'linear-gradient(90deg,#0ff1ce 10%,#08f7fe 90%)'
                    : '#222',
                  color: isActive ? '#191a2f' : '#0aefff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: '2px solid #0cf',
                  fontSize: '17px',
                  marginBottom: 3,
                  boxShadow: isActive ? '0 0 7px #0ff1ce' : undefined,
                  transition: "0.18s"
                }}
              >
                {index + 1}
              </div>
              <div style={{
                fontSize: 13,
                color: isActive ? '#0ff' : '#bbb',
                fontWeight: isActive ? 700 : 500
              }}>
                {step.title}
              </div>
            </div>
          );
        })}
      </div>
      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        margin: '14px 0 0'
      }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          disabled={currentStep === 0}
        >◀ Back</button>

        <button
          type="button"
          className={isFinalStep ? "btn btn-success" : "btn btn-primary"}
          onClick={isFinalStep
            ? (e) => { if (onSave) onSave(e); }
            : (e) => { if (onNext) onNext(e); }
          }
          {...(isFinalStep ? buttonProps : {})}
        >
          {isFinalStep ? 'Book Now' : 'Next ▶'}
        </button>
      </div>
    </div>
  );
}
