import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import styles from '../styles/Home.module.css';


export default function Home() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Recover Supabase implicit-flow links sent to the site root by a legacy
  // email template. Fragments are not sent to the server. Preserve them only
  // during a same-origin redirect to the existing verified callback handler.
  useEffect(() => {
    const fragment = window.location.hash.slice(1);
    if (!fragment) return;
    const tokens = new URLSearchParams(fragment);
    if (tokens.get('access_token') && tokens.get('refresh_token') && tokens.get('token_type') === 'bearer') {
      window.location.replace('/auth/magic-link#' + fragment);
    }
  }, []);

  // ✅ Safe client-side cookie check
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setShowCookieBanner(true);

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

      <div className={styles.site}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}><span className={styles.brandMark}>M</span><span>MIDNIGHT <strong>EXPRESS</strong><small>UK · IRELAND · EUROPE</small></span></Link>
          <nav className={styles.headerNav} aria-label="Main navigation">
            <Link href="/about">About</Link>
            <Link href="/contact" className={styles.headerAction}>Get a quote <span aria-hidden="true">↗</span></Link>
          </nav>
        </header>
        <main>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.eyebrow}><span className={styles.liveDot} /> FREIGHT THAT MOVES WITH YOU</div>
              <h1>When freight matters, <em>we move.</em></h1>
              <p className={styles.lede}>Express, same-day and dedicated road freight across the UK, Ireland and Europe. ADR and customs support for the journeys that need it.</p>
              <div className={styles.ctas}>
                <Link href="/contact" className={styles.primaryCta}>Request a freight quote <span aria-hidden="true">↗</span></Link>
                <Link href="#routes" className={styles.secondaryCta}>Explore our routes <span aria-hidden="true">↓</span></Link>
              </div>
              <p className={styles.disclaimer}>Every enquiry is reviewed by our freight team. No automatic booking or payment is created.</p>
            </div>
            <aside className={styles.heroPanel} aria-label="Our services">
              <span className={styles.panelLabel}>WHAT WE MOVE</span>
              <div className={styles.panelRow}><span>01</span><strong>Express & same-day</strong><span>↗</span></div>
              <div className={styles.panelRow}><span>02</span><strong>Dedicated vehicles</strong><span>↗</span></div>
              <div className={styles.panelRow}><span>03</span><strong>ADR freight</strong><span>↗</span></div>
              <div className={styles.panelRow}><span>04</span><strong>Customs support</strong><span>↗</span></div>
              <Link href="/contact" className={styles.panelFooter}>Speak to our team →</Link>
            </aside>
          </section>
          <section className={styles.strengths} aria-label="What we offer">
            <div><span>01 /</span><strong>Time-critical freight</strong><p>Urgent consignments with a real person reviewing your needs.</p></div>
            <div><span>02 /</span><strong>Complex cargo</strong><p>ADR requirements assessed before accepting any movement.</p></div>
            <div><span>03 /</span><strong>Cross-border expertise</strong><p>UK, Ireland and European movements with customs coordination.</p></div>
          </section>
          <section id="routes" className={styles.routesSection}>
            <div className={styles.sectionHead}><div><span className={styles.kicker}>OUR NETWORK</span><h2>Connected routes.<br/><em>One freight team.</em></h2></div><p>Explore common corridors and request a tailored quote. Route details and service availability are confirmed individually.</p></div>
            <div className={styles.routes}>
              {ROUTES.map((route, i) => (
                <article className={styles.routeCard} key={route.from + '-' + route.to}>
                  <div className={styles.routeTop}><span>ROUTE {String(i + 1).padStart(2,'0')}</span><span className={styles.routeIcon}>↗</span></div>
                  <h3>{route.from.replaceAll('-', ' ')} <span>↔</span> {route.to.replaceAll('-', ' ')}</h3>
                  <p>{route.description}</p>
                  <Link href="/contact" className={styles.routeBtn}>Enquire about this route <span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.finalCta}><div><span className={styles.kicker}>LET'S GET MOVING</span><h2>Have freight to move?</h2><p>Tell us the collection, destination and goods. We’ll review the requirements and come back with a quote.</p></div><Link href="/contact" className={styles.primaryCta}>Start an enquiry ↗</Link></section>
        </main>
        <footer className={styles.footer}><span>© Midnight Express</span><div><Link href="/about">About</Link><Link href="/contact">Contact</Link></div></footer>
      </div>

      {/* COOKIES */}
      {showCookieBanner && (
        <div className={styles.cookieBanner}>
          <p className="m-0">
            We use a small cookie to remember your preference.
          </p>
          <button onClick={handleAcceptCookies} className="btn btn-outline-light mt-2">
            Accept
          </button>
        </div>
      )}
    </>
  );
}
