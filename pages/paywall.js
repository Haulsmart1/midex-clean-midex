// /pages/paywall.js

import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PaywallPage() {
  const router = useRouter();

  const handleUpgradeClick = () => {
    router.push('/pricing'); // You can change this to your actual pricing page
  };

  return (
    <>
      <Head>
        <title>Upgrade Required</title>
      </Head>
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #000428, #004e92)',
        color: '#fff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          You need a valid subscription to access this area.
        </p>
        <button
          onClick={handleUpgradeClick}
          style={{
            backgroundColor: '#f39c12',
            color: '#000',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Upgrade Now
        </button>
      </main>
    </>
  );
}
