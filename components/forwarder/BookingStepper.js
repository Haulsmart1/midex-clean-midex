// BookingStepper.js
// Multi-step booking form wizard
// Passes all navigation logic, error handling, and data for pallet/point inputs

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import BookingStepsNav from "@/components/common/BookingStepsNav";
import PointInputs from "@/components/common/PointInputs";
import PalletItemForm from "@/components/common/PalletItemForm";
import CustomsUpload from "@/components/common/CustomsUpload";
import BookingReviewSlide from "@/components/common/BookingReviewSlide";

/**
 * Helper: Retrieve validation error message for a given pallet and field.
 * @param {object} errors - react-hook-form errors object
 * @param {number} idx - Pallet index
 * @param {string} name - Field name
 * @returns {string|null}
 */
function getPalletError(errors, idx, name) {
  return errors?.pallets?.[idx]?.[name]?.message || null;
}

/**
 * BookingStepper — the stepper for the entire booking flow.
 * - Handles navigation
 * - Triggers per-step validation
 * - Handles rendering for each type of step, including pallet list with errors
 *
 * @param {Array} steps - [{ title: string, content: JSX }]
 * @param {number} currentStep - Active step index
 * @param {function} setCurrentStep - Step setter
 * @param {function} onSave - Final save callback
 * @param {object} buttonProps - Optional props for nav buttons
 */
export default function BookingStepper({
  steps,
  currentStep,
  setCurrentStep,
  onSave,
  buttonProps = {},
}) {
  // RHF context hooks
  const { control, watch, register, setValue, formState: { errors }, trigger } = useFormContext();

  // Controlled arrays for form fields
  const collectionPoints = watch("collectionPoints") || [];
  const deliveryPoints = watch("deliveryPoints") || [];
  const { fields: pallets, append, remove } = useFieldArray({ control, name: "pallets" });

  /**
   * Step navigation: Advance step (with step-specific validation)
   */
  const handleNext = async () => {
    let valid = true;
    // Validate by step title, make this bulletproof for any new wording
    const stepTitle = steps[currentStep]?.title?.toLowerCase() || "";
    if (stepTitle.includes("address") || stepTitle.includes("point")) {
      // Validate addresses step
      valid = await trigger(["collectionPoints", "deliveryPoints"]);
    } else if (stepTitle.includes("consignment")) {
      // Validate pallet details step
      valid = await trigger("pallets");
    }
    // Add further step-specific validation below if needed

    // On success, move forward; else focus error
    if (valid) setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    else {
      // Focus the first error for accessibility
      setTimeout(() => {
        const err = document.querySelector('[aria-live="assertive"]');
        if (err) err.focus();
      }, 0);
    }
  };

  /**
   * Step navigation: Move back
   */
  const handleBack = () => setCurrentStep((step) => Math.max(step - 1, 0));

  /**
   * Renders the full stepper.
   * - Handles special logic for the Consignment step (shows all pallets with error displays and add button)
   * - Otherwise just renders the provided step content
   */
  return (
    <div>
      {/* Top nav */}
      <BookingStepsNav
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        onSave={onSave}
        buttonProps={buttonProps}
      />

      {/* Content */}
      <div className="step-content">
        {/* Consignment = show each pallet as an entry form (with error badges) */}
        {steps[currentStep]?.title?.toLowerCase().includes("consignment") ? (
          <div>
            {pallets.map((field, idx) => (
              <div
                key={field.id}
                style={{
                  marginBottom: 32,
                  borderRadius: 8,
                  padding: 16,
                  background: "#20222c"
                }}
              >
                <PalletItemForm
                  field={field}
                  idx={idx}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  pallets={pallets}
                  remove={remove}
                  collectionPoints={collectionPoints}
                  deliveryPoints={deliveryPoints}
                />

                {/* Inline error badges per pallet */}
                {[
                  "type", "length", "width", "height", "weight", "collectionAddress", "deliveryAddress", "adrClass"
                ].map((name) =>
                  getPalletError(errors, idx, name) ? (
                    <div
                      key={name}
                      style={{
                        color: "#ff5858",
                        fontWeight: "bold",
                        marginTop: 8,
                        background: "#301616",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ff5a5a"
                      }}
                      tabIndex={0}
                      aria-live="assertive"
                    >
                      {getPalletError(errors, idx, name)}
                    </div>
                  ) : null
                )}
              </div>
            ))}

            {/* Add pallet button */}
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={() => append({})}
            >
              ➕ Add Pallet
            </button>
          </div>
        ) : (
          // Any other step: just show the defined step content
          steps[currentStep]?.content
        )}
      </div>
    </div>
  );
}
