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
    if (
      !Array.isArray(session?.user?.roles) ||
      !session.user.roles.includes("partner")
    ) {
      router.replace('/dashboard'); // or some forbidden page
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
