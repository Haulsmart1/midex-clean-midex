'use client';
import Head from 'next/head';
import { signOut } from 'next-auth/react';

export default function CurrysDashboard() {
  return (
    <div style={{ padding: '2rem 1rem' }}>
      <Head>
        <title>Currys Dashboard</title>
      </Head>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <h1 style={{ color: '#ffcc00', fontWeight: 800 }}>
          Currys Admin Dashboard
        </h1>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            background: '#ff0055',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.6em 1.2em',
            fontWeight: 600,
            fontSize: 17,
            boxShadow: '0 2px 8px #ff005544',
            cursor: 'pointer'
          }}
          aria-label="Log out"
        >
          Log Out
        </button>
      </div>
      <p style={{ fontSize: '1.15em', color: '#bbb' }}>
        This is your Currys admin dashboard.
      </p>
    </div>
  );
}
