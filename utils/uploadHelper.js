import supabase from '@/lib/supabaseClient';

/**
 * 🔄 Upload a file to Supabase Storage
 *
 * @param {Object} supabase - Supabase client
 * @param {string} bookingId - ID of the booking
 * @param {string} bucket - Supabase bucket name (e.g. 'files' or 'currysdocs')
 * @param {File} file - File object from input
 * @param {string} path - Subfolder path inside the bucket (e.g. 'uploads')
 * @returns {Object} { name, url, path }
 */
export async function uploadFile(supabase, bookingId, bucket, file, path) {
  if (!supabase || !file || !bookingId || !bucket || !path) {
    throw new Error("❌ Missing required parameters in uploadFile");
  }

  const fileName = file.name || `upload_${Date.now()}`;
  const safePath = `${bookingId}/${path}/${Date.now()}_${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(safePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(safePath);

  if (!data?.publicUrl) throw new Error("❌ Failed to get public URL");

  return {
    name: fileName,
    url: data.publicUrl,
    path: safePath,
  };
}

/**
 * ✅ Wrapper for standard bucket usage (e.g. 'files')
 * Keeps your code DRY
 *
 * @param {Object} supabase
 * @param {string} bookingId
 * @param {File} file
 * @param {string} subfolder (default = 'general')
 */
export async function safeUploadFile(supabase, bookingId, file, subfolder = 'general') {
  const bucket = 'files'; // 🔥 Make sure this is correct for your project
  const path = subfolder;
  return uploadFile(supabase, bookingId, bucket, file, path);
}

/**
 * ❌ Delete file from Supabase Storage
 *
 * @param {Object} supabase
 * @param {string} bucket - e.g. 'files' or 'currysdocs'
 * @param {string} filePath - full file path
 */
export async function deleteFile(supabase, bucket, filePath) {
  if (!supabase || !bucket || !filePath) {
    throw new Error("❌ Missing parameters in deleteFile");
  }

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) throw error;

  return true;
}
