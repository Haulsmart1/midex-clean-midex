'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }

    // Supports array or single role, case-insensitive
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map(r => r.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);

    if (!roles.includes("partner")) {
      router.replace('/dashboard'); // redirect non-partners to generic dashboard or forbidden page
    }
  }, [session, status, router]);

  if (status === "loading" || !session) return null;

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>Welcome, Partner!</h1>
      <p>This is your partner dashboard landing page.</p>
    </div>
  );
}
