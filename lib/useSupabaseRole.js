// lib/useSupabaseRole.js
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export function useSupabaseRole(email) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(!!email);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    if (!email) {
      setRole(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setError(error.message || "Failed to fetch role");
        setRole(null);
      } else {
        setRole(data?.role ?? null);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [email]);

  return { role, loading, error };
}
