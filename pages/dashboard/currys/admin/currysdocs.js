// pages/dashboard/currys/admin/currysdocs.js
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CurrysDocsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.replace('/login');
    else if (!session.user.roles?.includes('currys_admin')) router.replace('/dashboard/currys');
    else loadFiles();
  }, [session, status]);

  const loadFiles = async () => {
    const { data, error } = await supabase.storage.from('currysdocs').list('', { limit: 100 });
    if (error) return console.error('Error fetching files:', error);
    setFiles(data || []);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { error } = await supabase.storage.from('currysdocs').upload(file.name, file, {
      upsert: true,
    });
    setUploading(false);
    if (error) return alert('❌ Upload failed');
    loadFiles();
  };

  const getPublicUrl = (path) => {
    const { publicURL } = supabase.storage.from('currysdocs').getPublicUrl(path);
    return publicURL;
  };

  return (
    <div style={{ padding: 30, background: '#23183a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#ffc600' }}>📁 Currys SMAPE Policy Documents</h1>
      <p style={{ marginBottom: 20 }}>Upload & manage policy files stored in the `currysdocs` bucket.</p>

      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        style={{ marginBottom: 20, background: '#fff', padding: 8 }}
      />
      {uploading && <p>Uploading...</p>}

      <ul style={{ paddingLeft: 20 }}>
        {files.map(file => (
          <li key={file.name} style={{ marginBottom: 10 }}>
            <a
              href={getPublicUrl(file.name)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#66e3e8' }}
            >
              {file.name}
            </a>
          </li>
        ))}
      </ul>

      <button onClick={() => router.push('/dashboard/currys/admin')} style={{
        marginTop: 30,
        background: '#fff',
        color: '#000',
        padding: '8px 16px',
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600
      }}>
        ← Back to Admin Dashboard
      </button>
    </div>
  );
}
