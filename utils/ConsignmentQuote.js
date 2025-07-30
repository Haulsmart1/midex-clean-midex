import React, { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { calculateQuote } from "@/utils/rateConfig"; // Adjust import if needed

export default function ConsignmentQuote() {
  const methods = useForm({
    defaultValues: {
      from: "",
      to: "",
      pallets: [
        {
          type: "",
          qty: 1,
          weight: "",
          adr: false,
          adrClass: "",
          adrFileUrl: null,
          adrFileUploading: false,
          adrFileError: null,
        },
      ],
      forkliftPickup: false,
      forkliftDelivery: false,
      milesToDepotA: 0,
      milesFromDepotB: 0,
      ferryRoute: "",
    },
  });
  const { register, handleSubmit, watch, setValue, getValues, control } = methods;
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const pallets = watch("pallets");
  const { fields, append, remove } = useFieldArray({ control, name: "pallets" });

  // Unified ADR file upload handler per pallet
  const handleAdrFileUpload = async (i, file) => {
    setValue(`pallets.${i}.adrFileUploading`, true);
    setValue(`pallets.${i}.adrFileError`, null);
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `quotes/pallet${i}_adr_${Date.now()}_${safeFilename}`;
    try {
      const { error } = await supabase.storage.from("adrfiles").upload(path, file, { upsert: true });
      if (error) {
        setValue(`pallets.${i}.adrFileUploading`, false);
        setValue(`pallets.${i}.adrFileError`, error.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("adrfiles").getPublicUrl(path);
      setValue(`pallets.${i}.adrFileUrl`, urlData.publicUrl);
      setValue(`pallets.${i}.adrFileUploading`, false);
      setValue(`pallets.${i}.adrFileError`, null);
    } catch (err) {
      setValue(`pallets.${i}.adrFileUploading`, false);
      setValue(`pallets.${i}.adrFileError`, err.message);
    }
  };

  // Quote calculation
  async function onSubmit(data) {
    setError("");
    // All ADR files required if marked
    for (const [i, p] of data.pallets.entries()) {
      if (p.adr && !p.adrFileUrl) {
        setError(`ADR file required for pallet ${i + 1}`);
        return;
      }
    }
    const adr = data.pallets.some(p => p.adr === true);
    const adrClassSpecial = data.pallets.some(
      p => p.adr === true && (p.adrClass === "1" || p.adrClass === "7")
    );
    try {
      const q = await calculateQuote({
        ...data,
        pallets: data.pallets,
        adr,
        adrClassSpecial,
        forkliftPickup: data.forkliftPickup,
        forkliftDelivery: data.forkliftDelivery,
        distanceMiles: 0,
        milesToDepotA: Number(data.milesToDepotA),
        milesFromDepotB: Number(data.milesFromDepotB),
        ferryRoute: data.ferryRoute,
      });
      setQuote(q);
    } catch (err) {
      setError("Error calculating quote: " + err.message);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 640, margin: "0 auto" }}>
        <div>
          <label>From (Postcode):</label>
          <input {...register("from", { required: true })} />
        </div>
        <div>
          <label>To (Postcode):</label>
          <input {...register("to", { required: true })} />
        </div>
        <h4>Pallet Details</h4>
        {fields.map((field, i) => (
          <div key={field.id} style={{ border: "1px solid #333", padding: 10, margin: 5 }}>
            <input placeholder="Type" {...register(`pallets.${i}.type`)} />
            <input type="number" placeholder="Qty" {...register(`pallets.${i}.qty`)} min={1} />
            <input type="number" placeholder="Weight" {...register(`pallets.${i}.weight`)} min={0} />
            <label>
              <input type="checkbox" {...register(`pallets.${i}.adr`)} />
              ADR?
            </label>
            {watch(`pallets.${i}.adr`) && (
              <>
                <select {...register(`pallets.${i}.adrClass`)}>
                  <option value="">Select class</option>
                  <option value="1">Class 1 (Explosives)</option>
                  <option value="2">Class 2 (Gases)</option>
                  <option value="3">Class 3 (Flammable liquids)</option>
                  <option value="4">Class 4 (Flammable solids)</option>
                  <option value="5">Class 5 (Oxidizing agents & peroxides)</option>
                  <option value="6">Class 6 (Toxic & infectious substances)</option>
                  <option value="7">Class 7 (Radioactive)</option>
                  <option value="8">Class 8 (Corrosives)</option>
                  <option value="9">Class 9 (Miscellaneous)</option>
                </select>
                {/* ADR File Upload */}
                <div>
                  <input
                    type="file"
                    disabled={pallets?.[i]?.adrFileUploading}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => e.target.files?.[0] && handleAdrFileUpload(i, e.target.files[0])}
                  />
                  {pallets?.[i]?.adrFileUploading
                    ? <span style={{ color: "#0af", fontSize: 13 }}>Uploading...</span>
                    : pallets?.[i]?.adrFileUrl &&
                      <a href={pallets[i].adrFileUrl} style={{ fontSize: 13 }} target="_blank" rel="noopener noreferrer">View file</a>
                  }
                  {pallets?.[i]?.adrFileError && <span style={{ color: "red", fontSize: 13 }}>{pallets[i].adrFileError}</span>}
                </div>
              </>
            )}
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(i)}>Remove</button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({
            type: "",
            qty: 1,
            weight: "",
            adr: false,
            adrClass: "",
            adrFileUrl: null,
            adrFileUploading: false,
            adrFileError: null,
          })}
        >+ Add Pallet</button>
        <div>
          <label>
            <input type="checkbox" {...register("forkliftPickup")} />
            Forklift Pickup
          </label>
          <label>
            <input type="checkbox" {...register("forkliftDelivery")} />
            Forklift Delivery
          </label>
        </div>
        <div>
          <label>Miles To Depot A:</label>
          <input type="number" {...register("milesToDepotA")} />
        </div>
        <div>
          <label>Miles From Depot B:</label>
          <input type="number" {...register("milesFromDepotB")} />
        </div>
        <div>
          <label>Ferry Route:</label>
          <select {...register("ferryRoute")}>
            <option value="">None</option>
            <option value="Cairnryan-Larne">Cairnryan-Larne</option>
            <option value="Liverpool-Dublin">Liverpool-Dublin</option>
            {/* Add other routes */}
          </select>
        </div>
        <button type="submit">Calculate Quote</button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
      {quote && (
        <pre
          style={{
            background: "#222",
            color: "#b0ffef",
            padding: "16px",
            borderRadius: "12px",
            marginTop: "20px",
          }}
        >
          {JSON.stringify(quote, null, 2)}
        </pre>
      )}
    </FormProvider>
  );
}
