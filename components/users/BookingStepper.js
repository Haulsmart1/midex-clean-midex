'use client';

import React, { useEffect, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import BookingStepsNav from "@/components/common/BookingStepsNav";

function getPalletError(errors, idx, name) {
  return errors?.pallets?.[idx]?.[name]?.message || null;
}

export default function BookingStepper({
  steps,
  currentStep,
  setCurrentStep,
  onSave,
  buttonProps = {},
  hasFerry = true
}) {
  const { control, watch, register, setValue, formState: { errors }, trigger } = useFormContext();
  const { fields: pallets, append, remove } = useFieldArray({ control, name: "pallets" });

  // ✅ Safe local state instead of direct `watch`
  const [collectionPoints, setCollections] = useState([]);
  const [deliveryPoints, setDeliveries] = useState([]);

  useEffect(() => {
    const sub = watch((values) => {
      setCollections(values.collectionPoints || []);
      setDeliveries(values.deliveryPoints || []);
    });

    return () => {
      if (sub && typeof sub.unsubscribe === "function") {
        sub.unsubscribe();
      }
    };
  }, [watch]);

  // --- Stepper navigation with skip logic ---
  const isLastStep = (() => {
    if (!hasFerry && steps[currentStep]?.title === "Customs") return false;
    if (!hasFerry && currentStep === steps.findIndex(s => s.title === "Review & Final Cost")) return true;
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

    if (valid) {
      let next = currentStep + 1;
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
    if (!hasFerry && steps[prev]?.title === "Customs") prev -= 1;
    setCurrentStep(Math.max(prev, 0));
  };

  const handleAction = (e) => {
    e.preventDefault();
    if (isLastStep) onSave?.();
    else handleNext();
  };

  return (
    <div>
      <BookingStepsNav
        steps={steps}
        currentStep={currentStep}
        onNext={handleAction}
        onBack={handleBack}
        onSave={onSave}
        buttonProps={{ ...buttonProps, isLastStep }}
      />

      <div className="step-content">
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

                {[
                  "type", "length", "width", "height", "weight",
                  "collectionAddress", "deliveryAddress", "adrClass"
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
