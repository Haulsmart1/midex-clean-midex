// 📁 pages/confirmation.js
import Link from 'next/link';

export default function Confirmation() {
  const bookingRef = 'MX-' + Math.floor(100000 + Math.random() * 900000);

  return (
    <div style={{
      backgroundImage: 'url("/midex.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '2rem',
      color: 'white'
    }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" href="/">Midnight Express</Link>
          <div>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
              <li className="nav-item">
                <Link className="nav-link" href="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/booking">New Booking</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div
          className="col-md-8 mx-auto p-5 rounded shadow"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <h2 className="mb-3">✅ Booking Confirmed</h2>
          <p>Thank you for booking with Midnight Express.</p>

          <div className="mb-4">
            <strong>Booking Reference:</strong><br />
            <span className="fs-4 fw-bold">{bookingRef}</span>
          </div>

          <p>Your freight is now scheduled. Our team is reviewing the details and will update you shortly with collection times.</p>

          <div className="d-flex justify-content-between mt-4">
            <Link href="/" className="btn btn-outline-light">Back to Home</Link>
            <button className="btn btn-primary" onClick={() => window.print()}>📄 Print Confirmation</button>
          </div>
        </div>
      </div>
    </div>
  );
}
