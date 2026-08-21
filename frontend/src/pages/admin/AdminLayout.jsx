import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  {
    to: '/admin/dashboard',
    icon: 'bi-grid-1x2-fill',
    label: 'Dashboard',
    key: 'dash'
  },
  {
    to: '/admin/products',
    icon: 'bi-box-seam-fill',
    label: 'Products',
    key: 'products'
  },
  {
    to: '/admin/inventory',
    icon: 'bi-boxes',
    label: 'Inventory',
    key: 'inventory'
  },
  {
    to: '/admin/users',
    icon: 'bi-people-fill',
    label: 'Users',
    key: 'users'
  },
  {
    to: '/admin/orders',
    icon: 'bi-receipt-cutoff',
    label: 'Orders',
    key: 'orders'
  },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const handleLogout = async () => { await logout(); nav('/admin/login'); };

  return (
    <div>
      {/* Sidebar — exact match to original admin-partials.js renderAdminSidebar() */}
      <aside className="admin-sidebar" id="adminSidebar">
        <Link to="/" className="brand-logo text-white mb-4 d-flex">
          <i className="bi bi-bag-check-fill text-coral"></i>&nbsp;Shop_With_Sahil
        </Link>

        <p className="text-uppercase small opacity-50 mb-2" style={{ fontSize: '.72rem', letterSpacing: '.08em' }}>Main</p>
        {NAV.map(n => (
          <Link key={n.key} to={n.to} className={loc.pathname === n.to ? 'active' : ''}>
            <i className={`bi ${n.icon}`}></i> {n.label}
          </Link>
        ))}

        <p className="text-uppercase small opacity-50 mb-2 mt-4" style={{ fontSize: '.72rem', letterSpacing: '.08em' }}>Account</p>
        <a href="#" onClick={e => { e.preventDefault(); handleLogout(); }}>
          <i className="bi bi-box-arrow-left"></i> Logout
        </a>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {/* Topbar — exact match to renderAdminTopbar() */}
        <div className="admin-topbar flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light-soft d-lg-none"
              onClick={() => document.getElementById('adminSidebar').classList.toggle('show')}>
              <i className="bi bi-list"></i>
            </button>
            <div>
              <h3 className="mb-0">{title}</h3>
              {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="icon-btn"><i className="bi bi-bell"></i></button>
            <div className="d-flex align-items-center gap-2">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0B0B0C&color=C9A24B&size=80`}
                style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} alt="Admin" />
              <div className="d-none d-md-block">
                <div className="fw-semibold small" id="adminNameSlot">{user?.name || 'Admin'}</div>
                <div className="text-muted small" style={{ fontSize: '.75rem' }}>Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
