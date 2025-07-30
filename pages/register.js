import { useState } from 'react';
import { supabase } from '/lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    password: '',
    address: '',
    postcode: '',
    eori_number: '',
    account_type: 'cash',
  });

  const [error, setError] = useState('');

  const generateAccountNumber = () => {
    const letters = Math.random().toString(36).substring(2, 6).toUpperCase();
    const numbers = Math.floor(100 + Math.random() * 900);
    return `MIDEX-${letters}${numbers}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error: insertError } = await supabase.from('users').insert([{
      ...formData,
      account_number: generateAccountNumber(),
      role: 'user',
      approved: true,
    }]);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push('/login');
  };

  return (
    <div style={{
      backgroundImage: 'url("/midex5.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
    }}>
      {/* 🌐 Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        padding: '1.2rem',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/" className="btn btn-outline-light fw-bold">Home</Link>
        <Link href="/contact" className="btn btn-outline-light fw-bold">Contact</Link>
        <Link href="/login" className="btn btn-outline-light fw-bold">Login</Link>
      </nav>

      <div className="container py-5">
        <div className="col-md-6 mx-auto p-4 bg-dark text-white rounded">
          <h2 className="mb-4 text-center">Register for Midnight Express</h2>

          {error && <div className="alert alert-danger text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            {[ 
              { label: 'Name', name: 'name' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Password', name: 'password', type: 'password' },
              { label: 'Company Name', name: 'company_name' },
              { label: 'Company Address', name: 'address' },
              { label: 'Postcode', name: 'postcode' },
              { label: 'EORI/XORI Number', name: 'eori_number' },
            ].map(({ label, name, type = 'text' }) => (
              <div className="mb-3" key={name}>
                <label>{label}</label>
                <input
                  type={type}
                  value={formData[name]}
                  onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                  required
                  className="form-control"
                />
              </div>
            ))}

            <div className="mb-3">
              <label>Account Type</label>
              <select
                className="form-select"
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              >
                <option value="cash">Cash Account</option>
                <option value="credit">Credit Account</option>
              </select>
            </div>

            <button type="submit" className="btn btn-light w-100 mt-3 fw-bold">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
