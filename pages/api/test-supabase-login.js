import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  const { email, password } = req.query;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase login failed:", error.message);
    return res.status(401).json({ success: false, error: error.message });
  }

  if (!data?.user) {
    return res.status(401).json({ success: false, error: "No user returned." });
  }

  return res.status(200).json({ success: true, user: data.user });
}
