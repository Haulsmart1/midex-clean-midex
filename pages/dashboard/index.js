// pages/dashboard/index.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  let roles = [];
  const user = session.user;

  // Normalize roles
  if (Array.isArray(user.roles)) {
    roles = user.roles.map((r) => r?.toLowerCase());
  } else if (typeof user.role === "string") {
    roles = [user.role.toLowerCase()];
  }

  // Normalize partner_type
  let partner = user.partner_type;
  if (typeof partner === "string") {
    try {
      const parsed = JSON.parse(partner);
      partner = Array.isArray(parsed) ? parsed[0]?.toLowerCase() : partner.toLowerCase();
    } catch {
      partner = partner?.toLowerCase?.() || '';
    }
  }

  // Role-based redirection
  if (roles.includes("super_admin")) {
    return { redirect: { destination: "/dashboard/admin/super", permanent: false } };
  } else if (roles.includes("admin")) {
    return { redirect: { destination: "/dashboard/admin", permanent: false } };
  } else if (roles.includes("forwarder")) {
    return { redirect: { destination: "/dashboard/forwarder", permanent: false } };
  } else if (roles.includes("currys_admin")) {
    return { redirect: { destination: "/dashboard/currys/", permanent: false } };
  } else if (roles.includes("customs_agent")) {
    return { redirect: { destination: "/dashboard/customs", permanent: false } };
  } else if (roles.includes("user")) {
    return { redirect: { destination: "/dashboard/user", permanent: false } };
  } else if (roles.includes("partner") && partner) {
    return { redirect: { destination: `/dashboard/partner/${partner}`, permanent: false } };
  }

  // Fallback redirect
  return {
    redirect: { destination: "/login", permanent: false },
  };
}

// ✅ This default export is REQUIRED by Next.js
export default function DashboardRedirectPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
      }}
      role="status"
      aria-live="polite"
      aria-label="Redirecting message"
    >
      <p>Redirecting based on your role…</p>
    </div>
  );
}
