import { useState } from 'react';
import styles from '@/styles/forms.module.css'; // ✅ Import dark form styles

export default function AddForwarderForm({ onAddForwarder }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddForwarder({ name, email, phone, address });
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />

      <button type="submit" className="btn btn-dark w-100">
        Add Forwarder
      </button>
    </form>
  );
}
