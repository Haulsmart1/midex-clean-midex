import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent!');
    setFormData({ name: '', email: '', message: '' });
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
          <h2 className="mb-4 text-center">Contact Us</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="5"
                required
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-light w-100 mt-3 fw-bold">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
