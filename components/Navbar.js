import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  const getDashboardLink = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'forwarder') return '/dashboard/forwarder/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link href="/" legacyBehavior passHref>
        <a className="navbar-brand">Midnight Express</a>
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">

          <li className="nav-item">
            <Link href="/" legacyBehavior passHref>
              <a className="nav-link">Home</a>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/about" legacyBehavior passHref>
              <a className="nav-link">About</a>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/contact" legacyBehavior passHref>
              <a className="nav-link">Contact</a>
            </Link>
          </li>

          {session && (
            <li className="nav-item">
              <Link href="/booking" legacyBehavior passHref>
                <a className="nav-link">Book Now</a>
              </Link>
            </li>
          )}

          {session && (
            <li className="nav-item">
              <Link href={getDashboardLink()} legacyBehavior passHref>
                <a className="nav-link">Dashboard</a>
              </Link>
            </li>
          )}

          <li className="nav-item ms-3">
            <LanguageSwitcher />
          </li>

          <li className="nav-item">
            {session ? (
              <button className="btn btn-sm btn-outline-light ms-3" onClick={() => signOut({ callbackUrl: '/' })}>
                Logout
              </button>
            ) : (
              <Link href="/login" legacyBehavior passHref>
                <a className="btn btn-sm btn-outline-light ms-3">Login</a>
              </Link>
            )}
          </li>

        </ul>
      </div>
    </nav>
  );
}
