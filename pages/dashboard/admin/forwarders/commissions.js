import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
    const { data: fwds } = await supabase.from('forwarders').select('id, name, contact_email');
    setForwarders(fwds || []);
    setLoading(false);
  }

  function startEdit(id) {
    setEditing({ ...commissions.find(c => c.forwarder_id === id) });
  }
  function stopEdit() {
    setEditing({});
  }
  async function saveEdit() {
    await fetch('/api/forwarder-commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing)
    });
    stopEdit();
    fetchData();
  }

  function editField(field, value) {
    setEditing(e => ({ ...e, [field]: value }));
  }

  if (loading) return <div>Loading...</div>;

  return (
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
                <td>{fwd.name} <br /><small>{fwd.contact_email}</small></td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editing.commission_land || ''}
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
                      value={editing.commission_ferry || ''}
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
                      <button onClick={saveEdit}>💾 Save</button>
                      <button onClick={stopEdit} className="ms-2">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(fwd.id)}>✏️ Edit</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
