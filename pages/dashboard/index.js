'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
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

    // Parse roles
    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles
      : [session?.user?.role].filter(Boolean);

    if (roles.includes('super_admin') || roles.includes('admin')) {
      // Show admin dashboard (show menu etc)
      return;
    }
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

  // Show nothing while redirecting
  return null;
}
