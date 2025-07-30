import Head from 'next/head';
import { useRouter } from 'next/router';
import { internalRegions } from '../../lib/internalRegions';
import { settings } from '../../lib/settings'; // existing settings file

export default function InternalRegionPage() {
  const router = useRouter();
  const { region } = router.query;

  const regionData = internalRegions.find(r => r.slug === region);

  if (!regionData) {
    return (
      <div className="text-center py-10 text-white">
        <h1>Region Not Found</h1>
      </div>
    );
  }

  const regionName = regionData.name;

  return (
    <>
      <Head>
        <title>Internal Express Pallets Across {regionName} | Midnight Express Freight</title>
        <meta name="description" content={`Same-day and next-day pallet deliveries across ${regionName}. Fast, secure, ADR Freight specialists.`} />
        <meta property="og:title" content={`Internal Pallet Shipping in ${regionName}`} />
        <meta property="og:description" content={`Move pallets across ${regionName} with Midnight Express. Fast ADR and customs-cleared logistics.`} />
        <meta property="og:url" content={`${settings.canonicalUrl}/internal/${region}`} />
        <meta property="og:image" content={`${settings.canonicalUrl}/midex7.jpg`} />
        <link rel="canonical" href={`${settings.canonicalUrl}/internal/${region}`} />
      </Head>

      <main className="container py-5 text-white">
        <h1 className="text-4xl font-bold mb-4">Internal Pallet Shipping in {regionName}</h1>
        <p className="mb-4">
          Midnight Express Freight offers fast and reliable pallet transport services within {regionName}.  
          Whether you need same-day shipping or overnight ADR freight, we deliver anywhere inside {regionName} with customs cleared where necessary.
        </p>

        <p className="mb-4">
          Request a booking today and move your express pallets across {regionName} with Midnight Express!
        </p>

        <a href="/contact" className="btn btn-primary">Book Now</a>
      </main>
    </>
  );
}

