'use client';
import React, { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

// 📦 Single Address Block
const AddressGroup = ({ type, fields, append, remove }) => {
  const { register } = useFormContext();

  return (
    <div className="mb-4">
      <h5 className="text-info mb-3">
        {type === 'collectionPoints' ? '🏭 Collection Points' : '🏢 Delivery Points'}
      </h5>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border rounded p-3 mb-3 bg-dark text-light"
        >
          <div className="form-group mb-2">
            <label>Company Name</label>
            <input
              {...register(`${type}.${index}.company`)}
              className="form-control"
              placeholder="Company Ltd."
            />
          </div>

          <div className="form-group mb-2">
            <label>Contact Name</label>
            <input
              {...register(`${type}.${index}.contact`)}
              className="form-control"
              placeholder="John Doe"
            />
          </div>

          <div className="form-group mb-2">
            <label>Phone Number</label>
            <input
              {...register(`${type}.${index}.phone`)}
              className="form-control"
              placeholder="+44..."
            />
          </div>

          <div className="form-group mb-2">
            <label>Full Address</label>
            <textarea
              {...register(`${type}.${index}.address`)}
              className="form-control"
              placeholder="Street, City, County"
            />
          </div>

          <div className="form-group mb-2">
            <label>Postcode</label>
            <input
              {...register(`${type}.${index}.postcode`)}
              className="form-control"
              placeholder="AB12 3CD"
            />
          </div>

          <div className="form-group mb-2">
            <label>Notes</label>
            <textarea
              {...register(`${type}.${index}.notes`)}
              className="form-control"
              placeholder="Access info, instructions..."
            />
          </div>

          {fields.length > 1 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => remove(index)}
            >
              ❌ Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-info"
        onClick={() =>
          append({
            company: '',
            contact: '',
            phone: '',
            address: '',
            postcode: '',
            notes: '',
          })
        }
      >
        ➕ Add {type === 'collectionPoints' ? 'Collection' : 'Delivery'}
      </button>
    </div>
  );
};

// ✅ Container
export default function Requirements() {
  const { control } = useFormContext();

  const {
    fields: collectionFields,
    append: appendCollection,
    remove: removeCollection,
  } = useFieldArray({
    control,
    name: 'collectionPoints',
  });

  const {
    fields: deliveryFields,
    append: appendDelivery,
    remove: removeDelivery,
  } = useFieldArray({
    control,
    name: 'deliveryPoints',
  });

  // ✅ Ensure at least one block exists — but only once on mount
  useEffect(() => {
    if (collectionFields.length === 0) appendCollection({});
    if (deliveryFields.length === 0) appendDelivery({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 bg-black text-white rounded">
      <AddressGroup
        type="collectionPoints"
        fields={collectionFields}
        append={appendCollection}
        remove={removeCollection}
      />

      <AddressGroup
        type="deliveryPoints"
        fields={deliveryFields}
        append={appendDelivery}
        remove={removeDelivery}
      />
    </div>
  );
}




