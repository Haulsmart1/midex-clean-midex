import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import styles from '../styles/Home.module.css';
import LanguageSwitcher from '../components/LanguageSwitcher';

const CountdownClock = dynamic(() => import('../components/CountdownClock'), { ssr: false });

export default function Home() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  // ✅ Safe client-side cookie check
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setShowCookieBanner(true);

    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDate(today);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieBanner(false);
  };

  const ROUTES = [
    { from: "liverpool", to: "dublin", status: "open", description: "Direct overnight ferry with customs clearance and ADR support" },
    { from: "liverpool", to: "belfast", status: "open", description: "Direct overnight ferry with customs clearance and ADR support" },
    { from: "cairnryan", to: "larne", status: "open", description: "Runs Daily Monday to Friday from 2nd June 2025, customs available" },
    { from: "heysham", to: "belfast", status: "open", description: "One Service on Wednesday ADR" },
    { from: "heysham", to: "dublin", status: "open", description: "One Service on Wednesday ADR" },
    { from: "heysham", to: "warrenpoint", status: "open", description: "One Service on Wednesday ADR" },
    { from: "rosslare", to: "cherbourg", status: "open", description: "One Service on Wednesday ADR" },
    { from: "rosslare", to: "bilbao", status: "open", description: "One Service on Wednesday ADR" },
    { from: "immingham", to: "esbjerg", status: "open", description: "One Service on Wednesday ADR" },
    { from: "immingham", to: "hook-of-holland", status: "open", description: "Direct overnight ferry with customs clearance and ADR support" },
    { from: "felixstowe", to: "zeebrugge", status: "open", description: "Direct overnight ferry with customs clearance and ADR support" },
    { from: "dover", to: "calais", status: "open", description: "Direct overnight ferry with customs clearance and ADR support" },
  ];

  const statusStyle = (status) => {
    switch (status) {
      case "open":
        return { border: '2px solid #28a745' };
      case "amber":
        return { border: '2px solid #ffc107' };
      case "closed":
        return { border: '2px solid #dc3545' };
      default:
        return { border: '2px solid #6c757d' };
    }
  };

  return (
    <>
      <Head>
        <title>Express, Sameday & Dedicated Pallets | UK ⇄ Ireland ⇄ Europe</title>
        <meta name="description" content="Overnight express pallet delivery, same-day and dedicated freight between UK, Ireland, Northern Ireland, and Europe. ADR & customs cleared." />
        <meta name="keywords" content="Express Pallets, Dedicated Pallets, Sameday Pallets, Freight UK to Ireland, Pallet Delivery Europe, ADR Freight, Customs Cleared" />
        <meta property="og:title" content="Midnight Express Freight Pallets Parcels London Belfast Dublin Liverpool Cardiff Rosslare Holyhead| UK ⇄ Europe" />
        <meta property="og:description" content="Next-day pallets, same-day and dedicated delivery services from UK to Ireland, NI and Europe. Customs and ADR included." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/midex7.jpg" />
        <meta property="og:url" content="https://www.midnight-xpress.com" />
        <link rel="canonical" href="https://www.midnight-xpress.com" />
        <link rel="icon" href="/fav.png" type="image/png" />
      </Head>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>Midnight Express</h1>
          <p className={styles.subtitle}>Cut-off for depot bookings: <CountdownClock /></p>
          <LanguageSwitcher />

          <h2 className={styles.description}>
            Express, Sameday & Dedicated Pallets — ADR & Customs Cleared UK ⇄ Europe
          </h2>

          <div className={styles.routeBadge}>
            {ROUTES.length} Routes Available
          </div>

          <div className={styles.navLinks}>
            <Link href="/about" className={styles.navBtn}>About</Link>
            <Link href="/register" className={styles.navBtn}>Register</Link>
            <Link href="/login" className={styles.navBtn}>Login</Link>
            <Link href="/contact" className={styles.navBtn}>Contact</Link>
          </div>
        </div>
      </div>

      {/* ROUTES */}
      <div className={styles.routes}>
        {ROUTES.map((route, i) => (
          <div key={i} className={styles.routeCard} style={statusStyle(route.status)}>
            <h3>{route.from} ⇄ {route.to}</h3>
            <p>{route.description}</p>
            <p className={styles.updated}>Last Updated: {currentDate || '\u00A0'}</p>
            <Link href={`/freight/${route.from}-to-${route.to}`} className={styles.routeBtn}>
              View Route
            </Link>
          </div>
        ))}
      </div>

      {/* COOKIES */}
      {showCookieBanner && (
        <div className="fixed bottom-0 w-full bg-black bg-opacity-85 text-white p-4 text-center z-50">
          <p className="m-0">
            We use cookies to improve your experience. By using this site, you accept our cookie policy.
          </p>
          <button onClick={handleAcceptCookies} className="btn btn-outline-light mt-2">
            Accept
          </button>
        </div>
      )}
    </>
  );
}
