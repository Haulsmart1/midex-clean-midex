import { useState } from 'react';
import styles from '@/styles/forms.module.css'; // ✅ Import dark form styles

export default function AddAdminForm({ onAddAdmin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddAdmin({ fullName, email });
    setFullName('');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />

      <button type="submit" className="btn btn-warning w-100">
        Add Admin
      </button>
    </form>
  );
}
