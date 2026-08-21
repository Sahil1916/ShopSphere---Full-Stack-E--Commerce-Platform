import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orders as ordersApi } from '../services/api';
import { statusBadgeClass } from '../utils/helpers';

export default function Orders() {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    ordersApi.myOrders().then(r => setMyOrders(r.data || []))
      .catch(err => setError(err.message || 'Something went wrong.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <main className="section-sm">
      <div className="container">
        <nav className="breadcrumb-shop"><Link to="/">Home</Link> &nbsp;/&nbsp; <span className="text-coral fw-semibold">My Orders</span></nav>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p className="eyebrow">Account</p>
            <h2 className="section-title mb-1">My Orders</h2>
            <p className="section-sub mb-0">Track, review and manage everything you've ordered from ShopWith_Sahil.</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="loader-ring mx-auto"></div>
            <p className="section-sub mx-auto mt-3 mb-0">Fetching your orders...</p>
          </div>
        )}

        {error && !loading && (
          <div>
            <div className="admin-card d-flex align-items-start gap-3" style={{ borderColor: '#f3d2d2' }}>
              <div className="stat-icon flex-shrink-0" style={{ background: 'var(--coral-dark)', width: 48, height: 48 }}>
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Unable to load orders</h6>
                <p className="section-sub mb-0">{error}</p>
              </div>
            </div>
            <button className="btn btn-primary btn-lg mt-3" onClick={load}>
              <i className="bi bi-arrow-clockwise me-1"></i> Retry
            </button>
          </div>
        )}

        {!loading && !error && myOrders.length === 0 && (
          <div className="text-center py-5">
            <div className="cat-icon mx-auto mb-4" style={{ width: 96, height: 96, fontSize: '2.4rem' }}>
              <i className="bi bi-bag-x"></i>
            </div>
            <h4 className="section-title" style={{ fontSize: '1.5rem' }}>No Orders Yet</h4>
            <p className="section-sub mx-auto mb-4">Looks like you haven't placed any orders. Start shopping and everything you buy will show up here.</p>
            <Link to="/products" className="btn btn-primary btn-lg"><i className="bi bi-shop me-1"></i> Start Shopping</Link>
          </div>
        )}

        {!loading && !error && myOrders.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {myOrders.map(o => (
              <div key={o.id} className="admin-card reveal in">
                <div className="row align-items-center">
                  <div className="col-lg-3">
                    <p className="stat-label mb-1">Order #{o.id}</p>
                    <strong>{new Date(o.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </div>
                  <div className="col-lg-3">
                    <p className="mb-1">{o.paymentMethod}</p>
                    <strong>₹{Number(o.totalAmount).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="col-lg-4">
                    <small>{o.shippingAddress}</small>
                  </div>
                  <div className="col-lg-2 text-end">
                    <span className={`badge-status ${statusBadgeClass(o.status)}`}>{o.status}</span>
                    <br /><br />
                    <Link to={`/order-details/${o.id}`} className="btn btn-outline-violet btn-sm-pill">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
