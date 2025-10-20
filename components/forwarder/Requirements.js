import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import SlideContainer from "@/components/common/SlideContainer";

const AddressGroup = ({ type, fields, append, remove }) => {
  const { register } = useFormContext();
  return (
    <div className="mb-4">
      <h5 style={{ color: "#ff5dce" }}>
        {type === 'collectionPoints' ? '🏭 Collection Points' : '🏢 Delivery Points'}
      </h5>
      {fields.map((field, index) => (
        <div
          key={field.id}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.75rem",
            padding: "1rem",
            marginBottom: "1rem",
            color: "#f5f5f5"
          }}
        >
          {/* fields unchanged */}
          <div className="form-group mb-2">
            <label>Company Name</label>
            <input {...register(`${type}.${index}.company`)} className="form-control" placeholder="Company Ltd." />
          </div>
          {/* … other inputs … */}
          {fields.length > 1 && (
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(index)}>
              ❌ Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-outline-info" onClick={() => append({})}>
        ➕ Add {type === 'collectionPoints' ? 'Collection' : 'Delivery'}
      </button>
    </div>
  );
};

export default function CollectionDeliveryDetails() {
  const { control } = useFormContext();
  const { fields: collectionFields, append: appendCollection, remove: removeCollection } = useFieldArray({ control, name: 'collectionPoints' });
  const { fields: deliveryFields, append: appendDelivery, remove: removeDelivery } = useFieldArray({ control, name: 'deliveryPoints' });

  if (collectionFields.length === 0) appendCollection({});
  if (deliveryFields.length === 0) appendDelivery({});

  return (
    <SlideContainer>
      <AddressGroup type="collectionPoints" fields={collectionFields} append={appendCollection} remove={removeCollection} />
      <AddressGroup type="deliveryPoints" fields={deliveryFields} append={appendDelivery} remove={removeDelivery} />
    </SlideContainer>
  );
}
