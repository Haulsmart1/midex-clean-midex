export default function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 tabIndex={0} aria-label="Unauthorized Access" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        🚫 Unauthorized
      </h1>
      <p tabIndex={0} aria-label="You don't have permission to access this page">
        You don’t have permission to access this page.
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#1f9aff',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
        aria-label="Go back to home page"
      >
        Go Home
      </a>
    </div>
  );
}
