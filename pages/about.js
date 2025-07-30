import Head from 'next/head';
import Link from 'next/link';

export default function About() {
  return (
    <>
      <Head>
        <title>About | Midnight Express Freight</title>
        <meta name="description" content="Learn how Midnight Express delivers dedicated overnight freight to Ireland and Northern Ireland with 24/7 customs clearance." />
        <meta property="og:title" content="About | Midnight Express Freight" />
        <meta property="og:description" content="We offer postcode-to-postcode overnight customs-cleared express delivery to Ireland and Northern Ireland." />
        <meta property="og:image" content="/midex.jpg" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        style={{
          backgroundImage: 'url("/midex6.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          color: 'white',
        }}
      >
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" href="/">Midnight Express</Link>
            <div>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
                <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link active" href="/about">About</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container py-5">
          <div className="col-lg-10 mx-auto p-4 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <h1 className="mb-4">📦 About Midnight Express</h1>
            <p>
              We offer a postcode-to-postcode dedicated overnight customs-cleared express service to Ireland & Northern Ireland.
              For example: Pickup in Dover before 12:00 noon → Delivery in Shannon or Londonderry by 9:00AM next morning.
            </p>
            <p>
              We operate 24/7 with full customs control — freight doesn’t stop at night. Dangerous goods, ADR, and Class 1/7
              shipments are all handled under strict compliance.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="py-5">
          <div className="container">
            <div className="col-lg-10 mx-auto p-4 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <h2 className="mb-4">🚚 Midnight Express FAQs — What You Need to Know</h2>

              <div className="mb-4">
                <h5>❓ We have our own customs agent. Can we use them?</h5>
                <p>✅ Our express service relies on full end-to-end customs control. We operate through the night with
                  a dedicated 24/7 customs clearance team. Most third-party agents close at 10PM — if there's an issue after that,
                  your freight would stop until morning. We keep things moving.</p>
              </div>

              <div className="mb-4">
                <h5>❓ What if there’s bad weather or unforeseen delays?</h5>
                <p>✅ We reroute or reassign vehicles in real time. Our team tracks road, ferry, and port conditions to minimize delays.
                  We keep your freight moving — no waiting until the next day.</p>
              </div>

              <div className="mb-4">
                <h5>❓ Can I apply for a credit account?</h5>
                <p>✅ Yes. During registration, you can request a 28-day credit account. Approval is subject to verification by our team.</p>
              </div>

              <div className="mb-4">
                <h5>❓ How do I pay if I don’t have a credit account?</h5>
                <p>✅ We support fast card payments during the booking process.</p>
              </div>

              <div className="mb-4">
                <h5>❓ How secure is my shipment?</h5>
                <p>✅ All shipments are tracked, sealed, and handled by professional ADR-trained drivers.
                  High-risk goods (e.g. hazardous or Class 1/7) go through manual verification.</p>
              </div>

              <div className="mb-4">
                <h5>❓ How do I know if your routes are open?</h5>
                <p>✅ Route status is updated live on our homepage:</p>
                <ul>
                  <li>🔴 <strong>Red:</strong> Route closed</li>
                  <li>🟠 <strong>Amber:</strong> Opening soon</li>
                  <li>🟢 <strong>Green:</strong> Route open</li>
                </ul>
                <p>Check back regularly for real-time updates.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

