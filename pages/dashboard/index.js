'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // 1. If not logged in, but access_token in hash, go to /set-password
    if (!session) {
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        router.replace('/set-password' + window.location.hash);
        return;
      }
      router.replace('/login');
      return;
    }

    // 2. If logged in, go to appropriate dashboard
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map(r => r.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);

    const partner = session?.user?.partner_type?.toLowerCase();

    if (roles.includes("super_admin")) {
      router.replace('/dashboard/admin/super');
    } else if (roles.includes("admin")) {
      router.replace('/dashboard/admin');
    } else if (roles.includes("forwarder")) {
      router.replace('/dashboard/forwarder');
    } else if (roles.includes("currys_admin")) {
      router.replace('/dashboard/currys');
    } else if (roles.includes("user")) {
      router.replace('/dashboard/user');
    } else if (roles.includes("partner") && partner) {
      router.replace(`/dashboard/partner/${partner}`);
    } else {
      router.replace('/login'); // fallback
    }
  }, [session, status, router]);

  return <div style={{ color: '#fff', padding: '2rem' }}>Loading dashboard...</div>;
}
