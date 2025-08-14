import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useState } from "react";
import styles from "@/styles/super-admin.module.css";

export default function SuperAdminSidebar({ user }) {
  const router = useRouter();

  // Toggle state for dropdown sections
  const [sections, setSections] = useState({
    bookings: false,
    entities: false,
    tools: false,
  });

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className={styles.sidebar}>
      <h3>{user?.role === "super admin" ? "Super Admin" : "Admin"} Panel</h3>
      <nav>
        <ul>
          {/* Dashboard */}
          <li>
            <Link
              href="/dashboard/admin/super"
              className={router.pathname === "/dashboard/admin/super" ? styles.activeLink : ""}
            >
              📊 Dashboard
            </Link>
          </li>

          {/* HaulSmart */}
          <li>
            <Link
              href="/dashboard/admin/super/haulsmart"
              className={router.pathname === "/dashboard/admin/super/haulsmart" ? styles.activeLink : ""}
            >
              🚚 HaulSmart
            </Link>
          </li>

          {/* Bookings - Collapsible */}
          <li>
            <button onClick={() => toggleSection("bookings")} className={styles.dropdownToggle}>
              📅 Bookings ▾
            </button>
            {sections.bookings && (
              <ul className={styles.subMenu}>
                <li>
                  <Link
                    href="/dashboard/admin/super/booking/internal"
                    className={router.pathname === "/dashboard/admin/super/booking/internal" ? styles.activeLink : ""}
                  >
                    🏠 Internal Bookings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/booking/cross-border"
                    className={router.pathname === "/dashboard/admin/super/booking/cross-border" ? styles.activeLink : ""}
                  >
                    🌍 Cross Border
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Tools - Collapsible */}
          <li>
            <button onClick={() => toggleSection("tools")} className={styles.dropdownToggle}>
              ⚙️ Tools ▾
            </button>
            {sections.tools && (
              <ul className={styles.subMenu}>
                <li>
                  <Link
                    href="/dashboard/admin/super/exports"
                    className={router.pathname === "/dashboard/admin/super/exports" ? styles.activeLink : ""}
                  >
                    📦 Exports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/finances"
                    className={router.pathname === "/dashboard/admin/super/finances" ? styles.activeLink : ""}
                  >
                    💰 Finances
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/reports"
                    className={router.pathname === "/dashboard/admin/super/reports" ? styles.activeLink : ""}
                  >
                    📋 Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/settings"
                    className={router.pathname === "/dashboard/admin/super/settings" ? styles.activeLink : ""}
                  >
                    ⚙️ Settings
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Entities - Collapsible */}
          <li>
            <button onClick={() => toggleSection("entities")} className={styles.dropdownToggle}>
              👥 Entities ▾
            </button>
            {sections.entities && (
              <ul className={styles.subMenu}>
                <li>
                  <Link
                    href="/dashboard/admin/super/admins"
                    className={router.pathname === "/dashboard/admin/super/admins" ? styles.activeLink : ""}
                  >
                    👑 Manage Admins
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/forwarders"
                    className={router.pathname === "/dashboard/admin/super/forwarders" ? styles.activeLink : ""}
                  >
                    🚚 Forwarders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/users"
                    className={router.pathname === "/dashboard/admin/super/users" ? styles.activeLink : ""}
                  >
                    👥 Users
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/customs"
                    className={router.pathname === "/dashboard/admin/super/customs" ? styles.activeLink : ""}
                  >
                    🛃 Customs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/partners"
                    className={router.pathname === "/dashboard/admin/super/partners" ? styles.activeLink : ""}
                  >
                    🤝 Partners
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/distributors"
                    className={router.pathname === "/dashboard/admin/super/distributors" ? styles.activeLink : ""}
                  >
                    📦 Distributors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/manufacturers"
                    className={router.pathname === "/dashboard/admin/super/manufacturers" ? styles.activeLink : ""}
                  >
                    🏭 Manufacturers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/super/currys"
                    className={router.pathname === "/dashboard/admin/super/currys" ? styles.activeLink : ""}
                  >
                    🚛 Currys
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className={styles.logoutButton}
      >
        🚪 Logout
      </button>
    </aside>
  );
}
