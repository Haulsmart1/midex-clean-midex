import { useState } from 'react';
import styles from '@/styles/forms.module.css'; // ✅ Import dark form styles

export default function AddUserForm({ onAddUser }) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [eori, setEori] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddUser({ name, companyName, email, phone, address, postcode, eori });
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setPostcode('');
    setEori('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="text" placeholder="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} required />
      <input type="text" placeholder="EORI/XORI" value={eori} onChange={(e) => setEori(e.target.value)} className={`form-control mb-2 ${styles.inputDark}`} />

      <button type="submit" className="btn btn-primary w-100">
        Add User
      </button>
    </form>
  );
}
