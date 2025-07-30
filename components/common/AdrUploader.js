import React from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const supabase = getSupabaseClient();

export default function AdrUploader({ idx, pallets, setValue }) {
  const uploading = pallets?.[idx]?.adrFileUploading;
  const error = pallets?.[idx]?.adrFileError;
  const fileUrl = pallets?.[idx]?.adrFileUrl;

  const handleUpload = async (file) => {
    setValue(`pallets.${idx}.adrFileUploading`, true);
    setValue(`pallets.${idx}.adrFileError`, null);

    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      setValue(`pallets.${idx}.adrFileUploading`, false);
      setValue(`pallets.${idx}.adrFileError`, "❌ Not logged in. Please sign in.");
      return;
    }

    const bucket = "adrfiles";
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `uploads/pallet${idx}_adr_${Date.now()}_${safeFilename}`;

    try {
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) {
        setValue(`pallets.${idx}.adrFileUploading`, false);
        setValue(`pallets.${idx}.adrFileError`, error.message);
        return;
      }
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      setValue(`pallets.${idx}.adrFileUrl`, urlData.publicUrl);
    } catch (err) {
      setValue(`pallets.${idx}.adrFileError`, err.message);
    } finally {
      setValue(`pallets.${idx}.adrFileUploading`, false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <label className="adr-upload-label" htmlFor={`adr-upload-${idx}`}>
        <input
          type="file"
          id={`adr-upload-${idx}`}
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.[0]) handleUpload(e.target.files[0]);
          }}
        />
        <span>
          📤 {fileUrl ? "Replace File" : "Upload Dangerous Goods Note"}
        </span>
      </label>

      <div
        style={{
          fontSize: 13,
          marginTop: 4,
          maxWidth: 250,
          wordBreak: "break-all",
          background: "rgba(18,33,49,0.75)",
          padding: "3px 7px",
          borderRadius: 7,
          color: uploading ? "#18e6c1" : "#0af",
          fontWeight: 500,
        }}
      >
        {uploading ? (
          "Uploading..."
        ) : fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View file
          </a>
        ) : (
          <span style={{ color: "#888" }}>No file uploaded</span>
        )}
      </div>

      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 2 }}>{error}</div>
      )}

      <style jsx>{`
        .adr-upload-label {
          background: linear-gradient(90deg, #13f1fc 60%, #45ffc2 100%);
          color: #181f32;
          border-radius: 10px;
          font-weight: 700;
          padding: 7px 22px;
          cursor: pointer;
          box-shadow: 0 2px 14px #13f1fc44;
          display: inline-block;
          transition: background 0.15s, color 0.15s;
          border: 1.7px solid #0aefff;
        }
        .adr-upload-label:hover {
          background: linear-gradient(90deg, #1ef2d6 0%, #0aefff 100%);
          color: #0e1836;
          border-color: #15ffc1;
        }
      `}</style>
    </div>
  );
}
