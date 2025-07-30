// components/layouts/UsersLayout.js

import UsersSidebar from '@/components/layouts/sidebars/UsersSidebar';
import Head from 'next/head';

export default function UsersLayout({ children, title = 'User Dashboard' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="d-flex bg-dark text-white" style={{ minHeight: '100vh' }}>
        <UsersSidebar />
        <main className="flex-grow-1 p-4 bg-dark text-white">
          {children}
        </main>
      </div>
    </>
  );
}
