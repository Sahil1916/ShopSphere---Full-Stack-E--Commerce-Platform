import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orders as ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { statusBadgeClass } from '../utils/helpers';

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    ordersApi.myOrders()
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const totalSpend = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);

  const formatCurrency = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!user) return null;

  return (
    <section className="section-sm">
      <div className="container">
        <nav className="breadcrumb-shop">
          <Link to="/">Home</Link> &nbsp;/&nbsp; <span className="text-coral fw-semibold">My Profile</span>
        </nav>

        <p className="eyebrow">Account</p>
        <h2 className="section-title mb-4">My Profile</h2>

        <div className="row g-4">
          {/* LEFT PROFILE CARD */}
          <div className="col-lg-4">
            <div className="admin-card text-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0B0B0C&color=C9A24B&size=180`}
                className="rounded-circle mx-auto mb-3 d-block"
                style={{ border: '3px solid var(--violet-light)', objectFit: 'cover' }}
                width={120} height={120} alt="User avatar"
              />
              <h4 className="section-title mb-1" style={{ fontSize: '1.3rem' }}>{user.name}</h4>
              <p className="stat-label mb-2">
                <i className="bi bi-envelope me-1"></i>{user.email}
              </p>
              <p className="mb-3">
                <span className="badge-status badge-active">{user.role}</span>
              </p>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="text-start">
                <p className="d-flex align-items-center mb-3">
                  <i className="bi bi-cart-check me-2 text-coral fs-5"></i>
                  <span>
                    <span className="d-block stat-label mb-0">Total Orders</span>
                    <span className="fw-semibold">{orders.length}</span>
                  </span>
                </p>
                <p className="d-flex align-items-center mb-0">
                  <i className="bi bi-currency-rupee me-2 text-coral fs-5"></i>
                  <span>
                    <span className="d-block stat-label mb-0">Total Spend</span>
                    <span className="fw-semibold">₹{formatCurrency(totalSpend)}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Recent Orders */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="section-title mb-0" style={{ fontSize: '1.3rem' }}>
                <i className="bi bi-box-seam me-2 text-coral"></i>Recent Orders
              </h4>
              <Link to="/orders" className="btn btn-outline-violet btn-sm-pill">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>

            {loading && (
              <div className="text-center py-5">
                <div className="loader-ring mx-auto"></div>
                <p className="section-sub mx-auto mt-3 mb-0">Loading your recent orders...</p>
              </div>
            )}

            {!loading && orders.length === 0 && (
              <div className="text-center py-5">
                <div className="cat-icon mx-auto mb-3" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                  <i className="bi bi-bag"></i>
                </div>
                <p className="section-sub mx-auto mb-0">You haven't placed any orders yet.</p>
              </div>
            )}

            {!loading && orders.slice(0, 5).map(o => (
              <div key={o.id} className="admin-card mb-3">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div>
                    <h5 className="mb-1" style={{ color: 'var(--ink)', fontWeight: 700 }}>Order #{o.id}</h5>
                    <p className="stat-label mb-2">{o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                    <p className="fw-bold mb-0" style={{ color: 'var(--ink)', fontSize: '1.05rem' }}>₹{formatCurrency(o.totalAmount)}</p>
                  </div>
                  <span className={`badge-status ${statusBadgeClass(o.status)}`}>{o.status}</span>
                </div>
                <hr style={{ borderColor: 'var(--border)', margin: '1.2rem 0' }} />
                <Link to={`/order-details/${o.id}`} className="btn btn-outline-violet btn-sm-pill">
                  <i className="bi bi-eye me-1"></i> View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
