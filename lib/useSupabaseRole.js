// /lib/useSupabaseRole.js
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function useSupabaseRole(email) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(!!email);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    const supabase = getSupabaseClient();
    supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .maybeSingle()
      .then(({ data }) => {
        setRole(data?.role || null);
        setLoading(false);
      });
  }, [email]);

  return { role, loading };
}
