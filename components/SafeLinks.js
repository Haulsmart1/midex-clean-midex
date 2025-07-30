// 📄 components/SafeLink.js
import Link from 'next/link';

export default function SafeLink({ href, children, className }) {
  return (
    <Link href={href} legacyBehavior passHref>
      <a className={className}>{children}</a>
    </Link>
  );
}
