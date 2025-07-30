import Head from 'next/head';
import { useRouter } from 'next/router';
import { cities } from '../../lib/cities';
import { settings } from '../../lib/settings'; // Your existing settings file

export default function CityPage() {
  const router = useRouter();
  const { city } = router.query;

  const cityData = cities.find(c => c.slug === city);

  if (!cityData) {
    return (
      <div className="text-center py-10 text-white">
        <h1>City Not Found</h1>
      </div>
    );
  }

  const cityName = cityData.name;

  return (
    <>
      <Head>
        <title>Express Pallets UK to {cityName} | Midnight Express Freight</title>
        <meta name="description" content={`Overnight express pallet delivery from the UK to ${cityName}. Customs-cleared freight. ADR specialists.`} />
        <meta property="og:title" content={`Express Pallets to ${cityName} | Midnight Express Freight`} />
        <meta property="og:description" content={`Ship pallets fast from the United Kingdom to ${cityName}. ADR compliant and customs cleared.`} />
        <meta property="og:url" content={`${settings.canonicalUrl}/pallets/${city}`} />
        <meta property="og:image" content={`${settings.canonicalUrl}/midex7.jpg`} />
        <link rel="canonical" href={`${settings.canonicalUrl}/pallets/${city}`} />
      </Head>

      <main className="container py-5 text-white">
        <h1 className="text-4xl font-bold mb-4">Express Pallets UK to {cityName}</h1>
        <p className="mb-4">
          Midnight Express Freight provides overnight pallet delivery from the United Kingdom to {cityName}.  
          Our services are fast, reliable, and customs-cleared. We specialize in ADR freight and next-day shipping to all major European cities.
        </p>

        <p className="mb-4">
          Contact us today for dedicated pallet services to {cityName} and surrounding areas!
        </p>

        <a href="/contact" className="btn btn-primary">Contact Us</a>
      </main>
    </>
  );
}
