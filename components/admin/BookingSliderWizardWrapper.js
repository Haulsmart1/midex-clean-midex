'use client';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import BookingSliderWizard from '@/components/admin/BookingSliderWizard';

const defaultValues = {
  collectionPoints: [{ company: "ABC Widgets Ltd.", postcode: "E1 1AA" }],
  deliveryPoints: [{ company: "XYZ Distribution", postcode: "G2 3NW" }],
  pallets: [{ type: "Standard Pallet", weight: 400, qty: 2 }],
  adr: false, adrClassSpecial: false,
  forkliftPickup: true, forkliftDelivery: true,
  customsFiles: { invoice: null, packing: null, delivery: null }
};

export default function BookingSliderWizardWrapper({ role = 'user' }) {
  const methods = useForm({ defaultValues, mode: 'onChange' });
  return (
    <FormProvider {...methods}>
      <BookingSliderWizard role={role} />
    </FormProvider>
  );
}
