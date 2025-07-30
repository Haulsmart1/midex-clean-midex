// components/layouts/AdminLayout.js
import AdminSidebar from './sidebars/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="d-flex">
      <AdminSidebar />
      <main className="flex-grow-1 p-4">
        {children}
      </main>
    </div>
  );
}
