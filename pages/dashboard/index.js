'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // <-- Use this in App Router!
import { useEffect } from "react";

export default function DashboardHome() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }

    // Defensive roles parsing
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles
      : [session?.user?.role].filter(Boolean) || [];

    if (roles.includes('super_admin') || roles.includes('admin')) return;
    if (roles.includes('currys_admin')) {
      router.replace('/dashboard/currys');
      return;
    }
    if (roles.includes('forwarder')) {
      router.replace('/dashboard/forwarder');
      return;
    }
    if (roles.includes('partner')) {
      router.replace('/dashboard/partner/fastfreight');
      return;
    }
    if (roles.includes('user')) {
      router.replace('/dashboard/user');
      return;
    }

    // fallback: not allowed
    router.replace('/login');
  }, [session, status, router]);

  return null; // nothing while redirecting
}
