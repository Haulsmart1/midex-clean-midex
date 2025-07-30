// File: /components/bookings/BookingSliderWizardWrapper.js

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import BookingSliderWizard from './BookingSliderWizard';

// FULLY PREFILLED, LABELED, AND ACCESSIBLE DEFAULT VALUES
const defaultValues = {
  // 🏭 Pickup (Collection Point)
  collectionPoints: [
    {
      company: "ABC Widgets Ltd.",
      contact: "Jane Doe",
      phone: "+44 1234 567890",
      address: "123 Industrial Way, London",
      postcode: "E1 1AA",
      notes: "Use loading bay B"
    }
  ],
  // 🏢 Delivery (Delivery Point)
  deliveryPoints: [
    {
      company: "XYZ Distribution",
      contact: "John Smith",
      phone: "+44 8765 432100",
      address: "456 Commerce Rd, Glasgow",
      postcode: "G2 3NW",
      notes: "Ring bell at gate"
    }
  ],
  // 📦 Pallet/Consignment details
  pallets: [
    {
      type: "Standard Pallet",
      length: 120,
      width: 100,
      height: 150,
      weight: 400,
      qty: 2,
      description: "Metal Parts",
      forkliftPickup: true,
      tailLiftPickup: false,
      noEquipmentPickup: false,
      forkliftDelivery: false,
      tailLiftDelivery: true,
      noEquipmentDelivery: false,
    }
  ],
  adr: false,
  adrClassSpecial: false,
  forkliftPickup: true,
  forkliftDelivery: true,
  tailLiftPickup: false,
  tailLiftDelivery: true,
  customsFiles: {
    invoice: null,
    packing: null,
    delivery: null,
  }
};

export default function BookingSliderWizardWrapper({ role = 'user' }) {
  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <BookingSliderWizard role={role} />
    </FormProvider>
  );
}
