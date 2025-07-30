'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import CurrysUserTable from '@/components/common/currys/CurrysUserTable';

export default function CurrysUsersPage() {
  const { data: session, status } = useSession();
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    const roles = session?.user?.roles || [];
    if (!roles.includes('currys_admin')) setNotAllowed(true);
  }, [session, status]);

  if (status === 'loading') return <div>Loading...</div>;
  if (notAllowed) return (
    <div className="alert alert-danger mt-4">
      Not authorized. You must be a Currys Admin to manage users.
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Currys User Management</h2>
      <CurrysUserTable currentUser={session?.user} />
    </div>
  );
}
