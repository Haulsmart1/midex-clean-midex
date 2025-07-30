import Head from 'next/head';
import dynamic from 'next/dynamic';
import UserLayout from '@/components/layouts/ForwarderLayout';
import ClientOnly from '@/components/core/ClientOnly';

// Lazy-load the RoutesGrid component to prevent SSR hydration mismatch
const RoutesGrid = dynamic(() => import('@/components/routes/RoutesGrid'), {
  ssr: false,
});

export default function UserRoutes() {
  return (
    <UserLayout>
      <Head>
        <title>Freight Routes | User | Midnight Express</title>
      </Head>

      <ClientOnly>
        <div className="container py-4">
          <h1 className="text-light mb-2">🚛 Freight Routes</h1>
          <p className="text-muted mb-4">Find customs-cleared freight options below.</p>

          <RoutesGrid apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} />
        </div>
      </ClientOnly>
    </UserLayout>
  );
}
