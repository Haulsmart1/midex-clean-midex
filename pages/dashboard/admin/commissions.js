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
    const { data: comm } = await supabase.from('forwarder_commissions').select('*');
    setCommissions(comm || []);
    const { data: fwds } = await supabase
      .from('forwarders')
      .select('id, name, contact_email');
    setForwarders(fwds || []);
    setLoading(false);
  }

  function startEdit(id) {
    const found = commissions.find((c) => c.forwarder_id === id);
    setEditing(found || { forwarder_id: id, commission_land: '', commission_ferry: '' });
  }
  function stopEdit() {
    setEditing({});
  }
  async function saveEdit() {
    if (!editing.forwarder_id) return;
    const payload = {
      forwarder_id: editing.forwarder_id,
      commission_land: Number(editing.commission_land) || 0,
      commission_ferry: Number(editing.commission_ferry) || 0,
    };
    await supabase
      .from('forwarder_commissions')
      .upsert([payload], { onConflict: ['forwarder_id'] });
    stopEdit();
    fetchData();
  }

  function editField(field, value) {
    setEditing((e) => ({ ...e, [field]: value }));
  }

  if (loading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <Head>
        <title>Forwarder Commission Settings</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '1000px',
            background: 'rgba(20,24,38,0.95)',
            borderRadius: '1rem',
            boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
            padding: '2rem',
          }}
        >
          <h2 className="fw-bold mb-3 text-center" style={{ color: '#00d4ff' }}>
            Forwarder Commission Settings
          </h2>
          <p className="text-muted mb-4 text-center">
            Manage commission rates for land and ferry shipments.
          </p>

          <div className="table-responsive">
            <table className="table table-dark table-striped table-bordered align-middle">
              <thead>
                <tr>
                  <th>Forwarder</th>
                  <th>Land %</th>
                  <th>Ferry %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forwarders.map((fwd) => {
                  const comm =
                    commissions.find((c) => c.forwarder_id === fwd.id) || {};
                  const isEditing = editing.forwarder_id === fwd.id;
                  return (
                    <tr key={fwd.id}>
                      <td>
                        {fwd.name} <br />
                        <small>{fwd.contact_email}</small>
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-control"
                            value={editing.commission_land ?? ''}
                            onChange={(e) =>
                              editField('commission_land', e.target.value)
                            }
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
                            className="form-control"
                            value={editing.commission_ferry ?? ''}
                            onChange={(e) =>
                              editField('commission_ferry', e.target.value)
                            }
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
                            <button
                              className="btn btn-success btn-sm m-1"
                              onClick={saveEdit}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm m-1"
                              onClick={stopEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => startEdit(fwd.id)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


