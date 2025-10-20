import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import BookingStepsNav from "@/components/common/BookingStepsNav";

/**
 * Helper: Retrieve validation error message for a given pallet and field.
 */
function getPalletError(errors, idx, name) {
  return errors?.pallets?.[idx]?.[name]?.message || null;
}

export default function BookingStepper({
  steps,
  currentStep,
  setCurrentStep,
  onSave,
  buttonProps = {},
}) {
  const {
    control,
    watch,
    register,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext();

  const collectionPoints = watch("collectionPoints") || [];
  const deliveryPoints = watch("deliveryPoints") || [];
  const { fields: pallets, append, remove } = useFieldArray({
    control,
    name: "pallets",
  });

  const customsFiles = watch("customsFiles");
  const senderEori = watch("senderEori");
  const receiverEori = watch("receiverEori");
  const commodityCodes = watch("commodityCodes") || [];

  // ✅ FIXED: simplified to check string values, not object.url
  const customsReady =
    customsFiles?.invoice &&
    customsFiles?.packing &&
    customsFiles?.delivery &&
    senderEori &&
    receiverEori &&
    Array.isArray(commodityCodes) &&
    commodityCodes.length > 0;

  const handleNext = async () => {
    let valid = true;
    const stepTitle = String(steps[currentStep]?.title || "").toLowerCase();

    if (stepTitle.includes("address") || stepTitle.includes("point")) {
      valid = await trigger(["collectionPoints", "deliveryPoints"]);
    } else if (stepTitle.includes("consignment")) {
      valid = await trigger("pallets");
    } else if (stepTitle.includes("customs")) {
      valid = customsReady;
    }

    if (valid) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    } else {
      setTimeout(() => {
        const err = document.querySelector('[aria-live="assertive"]');
        if (err) err.focus();
      }, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  return (
    <div>
      {/* Navigation Bar */}
      <BookingStepsNav
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onNext={handleNext}
        onBack={handleBack}
        onSave={onSave}
        buttonProps={{
          ...buttonProps,
          disabled:
            String(steps[currentStep]?.title || "")
              .toLowerCase()
              .includes("customs") && !customsReady,
        }}
      />

      {/* Step Content */}
      <div
        className="step-content"
        role="region"
        aria-labelledby={`step-title-${currentStep}`}
        style={{ marginTop: "2rem" }}
      >
        <h3 id={`step-title-${currentStep}`} style={{ display: "none" }}>
          {String(steps[currentStep]?.title || "")}
        </h3>

        {String(steps[currentStep]?.title || "")
          .toLowerCase()
          .includes("consignment") ? (
          <div>
            {pallets.map((field, idx) => (
              <div
                key={field.id}
                style={{
                  marginBottom: 32,
                  borderRadius: 8,
                  padding: 16,
                  background: "#20222c",
                  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                }}
              >
                {/* Form rendering for each pallet */}
                {/* Replace this with your <PalletItemForm /> if needed */}
                <div>
                  <strong style={{ color: "#fff" }}>
                    Pallet {idx + 1}
                  </strong>{" "}
                  (Replace this section with your custom pallet form.)
                </div>

                {/* Inline Error Messages */}
                {[
                  "type",
                  "length",
                  "width",
                  "height",
                  "weight",
                  "collectionAddress",
                  "deliveryAddress",
                  "adrClass",
                ].map((name) =>
                  getPalletError(errors, idx, name) ? (
                    <div
                      key={name}
                      style={{
                        color: "#ff7ee2",
                        fontWeight: "bold",
                        marginTop: 8,
                        background: "rgba(50, 0, 40, 0.6)",
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ff7ee2",
                        boxShadow: "0 0 8px rgba(255, 126, 226, 0.4)",
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
              onClick={() => append({})}
              style={{
                background: "linear-gradient(90deg, #ff7ee2, #9d6bff)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontWeight: "bold",
                color: "#fff",
                boxShadow: "0 0 10px rgba(255, 126, 226, 0.5)",
                cursor: "pointer",
                marginTop: "1rem",
              }}
            >
              ➕ Add Pallet
            </button>
          </div>
        ) : (
          steps[currentStep]?.content || <div>No content available</div>
        )}
      </div>
    </div>
  );
}
