import { signIn, getSession, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.role) {
      const role = session.user.role;
      if (role === 'super_admin') router.replace('/dashboard/super');
      else if (role === 'admin') router.replace('/dashboard/admin');
      else if (role === 'forwarder') router.replace('/dashboard/forwarder');
      else router.replace('/dashboard/user');
    }
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      const session = await getSession();
      const role = session?.user?.role;

      if (role === 'super_admin') window.location.href = '/dashboard/super';
      else if (role === 'admin') window.location.href = '/dashboard/admin';
      else if (role === 'forwarder') window.location.href = '/dashboard/forwarder';
      else window.location.href = '/dashboard/user';
    }
  };

  if (session?.user) return null;

  return (
    <div className="container py-5 text-white">
      <h1 className="display-6 fw-bold mb-4 text-center">Login</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-dark rounded shadow border border-secondary"
        style={{ maxWidth: 400, margin: '0 auto' }}
      >
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-light w-100 fw-bold" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
