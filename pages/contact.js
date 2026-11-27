import Link from 'next/link';

export default function Contact() {
  return (
    <main style={{ minHeight: '100vh', background: '#0e2534', color: '#fff', padding: '48px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#f8cd86' }}>← Midnight Express</Link>
        <h1 style={{ marginTop: 40 }}>Contact our freight team</h1>
        <p>For a road, air or sea freight enquiry, please send the collection point, destination, freight description, weight, required timing and any dangerous goods information.</p>
        <p>We will review your requirements and reply with availability and a quotation where possible. Contacting us does not create or confirm a booking.</p>
        <p><a style={{ color: '#f8cd86', fontWeight: 700 }} href="mailto:hazload@adrcarriers.net?subject=Midnight%20Express%20freight%20enquiry">Open an email to operations</a></p>
        <p>The link opens your email application. You must send the email yourself; the website does not send it automatically.</p>
        <p>For urgent freight, telephone <a style={{ color: '#f8cd86' }} href="tel:+448009991263">0800 999 1263</a>.</p>
      </div>
    </main>
  );
}
