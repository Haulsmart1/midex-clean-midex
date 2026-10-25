import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const OPERATIONS_EMAIL = 'bookings@midnight-express.org';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = encodeURIComponent('Midnight Express freight enquiry');
    const body = encodeURIComponent([
      'Freight enquiry for human review',
      '',
      `Name: ${formData.name}`,
      `Reply email: ${formData.email}`,
      '',
      formData.message,
      '',
      'This is an enquiry only. No booking, price, invoice or payment has been created.',
    ].join('\n'));

    window.location.href = `mailto:${OPERATIONS_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Head>
        <title>Request a Freight Quote | Midnight Express</title>
        <meta
          name="description"
          content="Send a freight enquiry to Midnight Express for human review. Availability and charges are confirmed by our operations team; this page does not create a booking or take payment."
        />
      </Head>

      <div style={{
        backgroundImage: 'url("/midex5.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}>
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
            <h2 className="mb-3 text-center">Request a freight quote</h2>
            <p>
              Tell our operations team what needs moving. Submitting this form opens
              an email addressed to {OPERATIONS_EMAIL}; it is sent only after you
              review and send it from your email app.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="enquiry-name">Name</label>
                <input
                  id="enquiry-name"
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  required
                  className="form-control"
                  autoComplete="name"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="enquiry-email">Email</label>
                <input
                  id="enquiry-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  required
                  className="form-control"
                  autoComplete="email"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="enquiry-message">Freight details</label>
                <textarea
                  id="enquiry-message"
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  rows="5"
                  required
                  className="form-control"
                  placeholder="Collection, delivery, goods, weight, dates and any ADR requirements"
                />
              </div>

              <button type="submit" className="btn btn-light w-100 mt-3 fw-bold">
                Prepare enquiry email
              </button>
            </form>

            <p className="mt-3 mb-0">
              This page does not create a booking, price, invoice or payment.
              Availability and charges are confirmed by a person after review.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
