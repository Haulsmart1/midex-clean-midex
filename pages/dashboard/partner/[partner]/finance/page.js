// file: /dashboard/partner/[partner]/finance/page.tsx
'use client';

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PartnerFinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const partner = params?.partner?.toLowerCase();

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!session || status === "loading") return;

    const userRole = session?.user?.role?.toLowerCase();

    import(`@/components/partners/${partner}Config`)
      .then(mod => {
        const config = mod.default;
        if (config.allowedRolesForFinance?.includes(userRole)) {
          setAllowed(true);
        } else {
          router.replace(`/dashboard/partner/${partner}`);
        }
      });
  }, [session, status, partner, router]);

  if (status === "loading" || !allowed) return null;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: '#fff' }}>Finance Overview</h1>
      {/* Add finance components here */}
    </div>
  );
}
