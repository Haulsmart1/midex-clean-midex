import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import BookingStepsNav from "@/components/common/BookingStepsNav";
import PalletItemForm from "@/components/common/PalletItemForm";

/**
 * Helper: Retrieve validation error message for a given pallet and field.
 */
function getPalletError(errors, idx, name) {
  return errors?.pallets?.[idx]?.[name]?.message || null;
}

/**
 * BookingStepper wizard
 * - Skips "Customs" step if not needed (hasFerry = false)
 * - Only runs `onSave` on final step
 */
export default function BookingStepper({
  steps,
  currentStep,
  setCurrentStep,
  onSave,
  buttonProps = {},
  hasFerry = true // Parent must pass this (from routeInfo.ferryRoute)
}) {
  // React Hook Form hooks
  const { control, watch, register, setValue, formState: { errors }, trigger } = useFormContext();
  const collectionPoints = watch("collectionPoints") || [];
  const deliveryPoints = watch("deliveryPoints") || [];
  const { fields: pallets, append, remove } = useFieldArray({ control, name: "pallets" });

  // --- Stepper navigation with skip logic ---
  const isLastStep = (() => {
    // If "Customs" is in the steps but shouldn't be shown, pretend it's not there for navigation
    if (!hasFerry && steps[currentStep]?.title === "Customs") return false;
    // If not showing customs, Review is one step earlier
    if (!hasFerry && currentStep === steps.findIndex(s => s.title === "Review & Final Cost")) return true;
    // Normal end
    return currentStep === steps.length - 1;
  })();

  const handleNext = async () => {
    let valid = true;
    const stepTitle = steps[currentStep]?.title?.toLowerCase() || "";

    if (stepTitle.includes("address") || stepTitle.includes("point")) {
      valid = await trigger(["collectionPoints", "deliveryPoints"]);
    } else if (stepTitle.includes("consignment")) {
      valid = await trigger("pallets");
    }
    // You can add more step-specific validation here as needed

    if (valid) {
      let next = currentStep + 1;
      // Skip Customs if not needed
      if (!hasFerry && steps[next]?.title === "Customs") next += 1;
      setCurrentStep(Math.min(next, steps.length - 1));
    } else {
      setTimeout(() => {
        const err = document.querySelector('[aria-live="assertive"]');
        if (err) err.focus();
      }, 0);
    }
  };

  const handleBack = () => {
    let prev = currentStep - 1;
    // Skip Customs if not needed
    if (!hasFerry && steps[prev]?.title === "Customs") prev -= 1;
    setCurrentStep(Math.max(prev, 0));
  };

  // --- Button click logic ---
  const handleAction = (e) => {
    e.preventDefault();
    if (isLastStep) onSave?.();
    else handleNext();
  };

  // --- Render ---
  return (
    <div>
      <BookingStepsNav
        steps={steps}
        currentStep={currentStep}
        onNext={handleAction}
        onBack={handleBack}
        onSave={onSave}
        buttonProps={{
          ...buttonProps,
          isLastStep,
        }}
      />
      <div className="step-content">
        {steps[currentStep]?.title?.toLowerCase().includes("consignment") ? (
          <div>
            {pallets.map((field, idx) => (
              <div key={field.id} style={{
                marginBottom: 32,
                borderRadius: 8,
                padding: 16,
                background: "#20222c"
              }}>
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
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={() => append({})}
            >
              ➕ Add Pallet
            </button>
          </div>
        ) : (
          steps[currentStep]?.content
        )}
      </div>
    </div>
  );
}
