// pages/dashboard/admin/commissions.js

import Head from 'next/head';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [forwarders, setForwarders] = useState([]);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Get all commissions and forwarders
    const { data: comm } = await supabase.from('forwarder_commissions').select('*');
    setCommissions(comm || []);
    const { data: fwds } = await supabase.from('forwarders').select('id, name, contact_email');
    setForwarders(fwds || []);
    setLoading(false);
  }

  function startEdit(id) {
    // If exists, start with current; otherwise, create empty row
    const found = commissions.find(c => c.forwarder_id === id);
    setEditing(found || { forwarder_id: id, commission_land: '', commission_ferry: '' });
  }
  function stopEdit() {
    setEditing({});
  }
  async function saveEdit() {
    // Insert or update logic
    if (!editing.forwarder_id) return;
    const payload = {
      forwarder_id: editing.forwarder_id,
      commission_land: Number(editing.commission_land) || 0,
      commission_ferry: Number(editing.commission_ferry) || 0,
    };
    // Upsert (insert or update)
    await supabase
      .from('forwarder_commissions')
      .upsert([payload], { onConflict: ['forwarder_id'] });
    stopEdit();
    fetchData();
  }

  function editField(field, value) {
    setEditing(e => ({ ...e, [field]: value }));
  }

  if (loading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <Head>
        <title>Forwarder Commission Settings</title>
      </Head>
      <div className="container py-4">
        <h2>Forwarder Commission Settings</h2>
        <table className="table table-bordered bg-white">
          <thead>
            <tr>
              <th>Forwarder</th>
              <th>Land %</th>
              <th>Ferry %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forwarders.map(fwd => {
              const comm = commissions.find(c => c.forwarder_id === fwd.id) || {};
              const isEditing = editing.forwarder_id === fwd.id;
              return (
                <tr key={fwd.id}>
                  <td>
                    {fwd.name} <br /><small>{fwd.contact_email}</small>
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editing.commission_land ?? ''}
                        onChange={e => editField('commission_land', e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    ) : (
                      comm.commission_land ?? ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editing.commission_ferry ?? ''}
                        onChange={e => editField('commission_ferry', e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    ) : (
                      comm.commission_ferry ?? ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button className="btn btn-success btn-sm" onClick={saveEdit}>💾 Save</button>
                        <button className="btn btn-secondary btn-sm ms-2" onClick={stopEdit}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => startEdit(fwd.id)}>✏️ Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

