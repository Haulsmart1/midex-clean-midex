import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function RequireForwarder({ children }) {
  const { data: session, status } = useSession();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.user?.email) return;
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", session.user.email)
        .maybeSingle();
      setRole(data?.role || null);
      setLoading(false);
    };
    if (session?.user?.email) fetchRole();
  }, [session?.user?.email]);

  if (status === "loading" || loading) return <div>Loading...</div>;
  if (!session?.user?.email) return <div>Please login as a forwarder.</div>;
  if (role !== "forwarder") return <div>You do not have forwarder access. Please contact support or log in as a forwarder.</div>;
  return children;
}
