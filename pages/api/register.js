import { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', eori: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEORI = (eori) => {
    return /^GB|XI|IE\d+$/.test(eori);  // Must start with GB, XI, or IE
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEORI(form.eori)) {
      alert("Invalid EORI/XORI number!");
      return;
    }
    alert("Registration successful!");
  };

  return (
    <main>
      <h1>Business Registration</h1>
      <form onSubmit={handleSubmit}>
        <label>Company Name: <input type="text" name="name" onChange={handleChange} required /></label>
        <label>Email: <input type="email" name="email" onChange={handleChange} required /></label>
        <label>EORI/XORI: <input type="text" name="eori" onChange={handleChange} required /></label>
        <button type="submit">Register</button>
      </form>
    </main>
  );
}
