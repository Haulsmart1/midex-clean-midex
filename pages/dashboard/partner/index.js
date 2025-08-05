import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PartnerRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || status === "loading") return;

    if (!session) {
      router.replace('/login');
      return;
    }

    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map(r => r?.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);

    const partnerType = session?.user?.partner_type?.toLowerCase() || '';

    if (roles.includes("partner")) {
      router.replace(partnerType
        ? `/dashboard/partner/${partnerType}`
        : '/dashboard/partner');
    } else {
      router.replace('/dashboard');
    }
  }, [session, status, hydrated, router]);

  if (!hydrated || status === "loading") return null;

  return (
    <div style={{ color: "#fff", marginTop: "2rem" }}>
      Redirecting...
    </div>
  );
}
