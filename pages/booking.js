import Link from 'next/link';

export default function BookingPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0e2534', color: '#fff', padding: '48px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#f8cd86' }}>← Midnight Express</Link>
        <h1 style={{ marginTop: 40 }}>Request a freight quotation</h1>
        <p>Online booking and automatic price acceptance are temporarily unavailable. No shipment can be booked or paid for through this page.</p>
        <p>Please tell operations where the goods are, where they need to go, the freight type, weight, collection and delivery dates, and whether dangerous goods are involved.</p>
        <p><a style={{ color: '#f8cd86', fontWeight: 700 }} href="mailto:hazload@adrcarriers.net?subject=Midnight%20Express%20quotation%20request">Email a quotation request</a></p>
        <p>This link opens your own email application. Nothing is submitted until you send the email and operations confirms receipt.</p>
        <p>Urgent enquiries: <a style={{ color: '#f8cd86' }} href="tel:+448009991263">0800 999 1263</a>.</p>
      </div>
    </main>
  );
}
