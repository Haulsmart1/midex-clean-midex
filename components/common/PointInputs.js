import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";

export default function PointInputs() {
  const { register, control, formState: { errors } } = useFormContext();

  const { fields: collections, append: appendCollection, remove: removeCollection } = useFieldArray({
    control,
    name: "collectionPoints",
  });
  const { fields: deliveries, append: appendDelivery, remove: removeDelivery } = useFieldArray({
    control,
    name: "deliveryPoints",
  });

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <h3>Collection Addresses</h3>
      {collections.map((field, idx) => (
        <div key={field.id} className="mb-2">
          <input
            {...register(`collectionPoints.${idx}.postcode`, {
              required: "Required",
              pattern: {
                value: /^[A-Z0-9 ]{5,10}$/i,
                message: "Enter valid postcode"
              }
            })}
            className="form-control"
            placeholder={`Collection Postcode #${idx + 1}`}
          />
          {errors?.collectionPoints?.[idx]?.postcode && (
            <span className="text-danger">{errors.collectionPoints[idx].postcode.message}</span>
          )}
          {collections.length > 1 && (
            <button type="button" className="btn btn-sm btn-danger mt-1" onClick={() => removeCollection(idx)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-primary mb-4" onClick={() => appendCollection({ postcode: "" })}>
        ➕ Add Collection
      </button>

      <h3>Delivery Addresses</h3>
      {deliveries.map((field, idx) => (
        <div key={field.id} className="mb-2">
          <input
            {...register(`deliveryPoints.${idx}.postcode`, {
              required: "Required",
              pattern: {
                value: /^[A-Z0-9 ]{5,10}$/i,
                message: "Enter valid postcode"
              }
            })}
            className="form-control"
            placeholder={`Delivery Postcode #${idx + 1}`}
          />
          {errors?.deliveryPoints?.[idx]?.postcode && (
            <span className="text-danger">{errors.deliveryPoints[idx].postcode.message}</span>
          )}
          {deliveries.length > 1 && (
            <button type="button" className="btn btn-sm btn-danger mt-1" onClick={() => removeDelivery(idx)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-primary" onClick={() => appendDelivery({ postcode: "" })}>
        ➕ Add Delivery
      </button>
    </div>
  );
}
