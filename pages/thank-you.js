import Link from 'next/link';

export default function ContactSuccess() {
  return <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f9f9f9', padding: '2rem', textAlign: 'center' }}>
    <h1>✅ Thank You!</h1>
    <p>Your message has been sent. We’ll get back to you shortly.</p>
    <Link href="/">⬅ Return to Home</Link>
  </main>;
}
