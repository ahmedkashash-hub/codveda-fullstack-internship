import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">Codveda Tasks</Link>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}
