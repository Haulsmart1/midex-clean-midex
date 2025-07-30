import Sidebar from './Sidebar';
import Header from '../Header'; // importing your existing Header component

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flexGrow: 1 }}>
        <Header />
        <main style={{ padding: '1rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
