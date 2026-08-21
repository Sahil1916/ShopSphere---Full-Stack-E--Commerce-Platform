import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { orders as ordersApi, products as productsApi } from '../services/api';
import { statusBadgeClass, normalizeProduct } from '../utils/helpers';

export default function OrderDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [state, setState] = useState('loading'); // loading | error | empty | ready
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const load = async () => {
    setState('loading');
    try {
      if (!id) { setState('empty'); return; }
      const [res, allProds] = await Promise.all([ordersApi.getById(id), productsApi.getAll()]);
      if (!res.data || !res.data.order) { setState('empty'); return; }
      setOrder(res.data.order);
      setItems(res.data.items || []);
      setProducts((allProds.data || []).map(normalizeProduct));
      setState('ready');
    } catch (err) {
      setErrorMsg(err.response?.data || err.message || 'Something went wrong. Please try again later.');
      setState('error');
    }
  };

  useEffect(() => { load(); }, [id]);

  const formatCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const shipping = order && Number(order.totalAmount) > subtotal ? Number(order.totalAmount) - subtotal : 0;

  const getProductImg = (productId) => {
    const p = products.find(pr => pr.id === productId);
    return p ? p.img : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80';
  };
  const getProductName = (productId) => {
    const p = products.find(pr => pr.id === productId);
    return p ? p.name : `Product #${productId}`;
  };

  return (
    <main className="section-sm">
      <div className="container">
        <nav className="breadcrumb-shop">
          <Link to="/">Home</Link> &nbsp;/&nbsp;
          <Link to="/orders">My Orders</Link> &nbsp;/&nbsp;
          <span className="text-coral fw-semibold">Order Details</span>
        </nav>

        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p className="eyebrow">Order</p>
            <h2 className="section-title mb-0">Order Details</h2>
          </div>
          {state === 'ready' && (
            <button className="btn btn-outline-violet" onClick={() => window.print()}>
              <i className="bi bi-download me-1"></i> Download Invoice
            </button>
          )}
        </div>

        {/* Loading */}
        {state === 'loading' && (
          <div className="text-center py-5">
            <div className="loader-ring mx-auto"></div>
            <p className="section-sub mx-auto mt-3 mb-0">Fetching order details...</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div>
            <div className="admin-card d-flex align-items-start gap-3" style={{ borderColor: '#f3d2d2' }}>
              <div className="stat-icon flex-shrink-0" style={{ background: 'var(--coral-dark)', width: 48, height: 48 }}>
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Unable to load order</h6>
                <p className="section-sub mb-0">{errorMsg}</p>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button className="btn btn-primary" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i> Retry</button>
              <Link to="/orders" className="btn btn-light-soft">Back to Orders</Link>
            </div>
          </div>
        )}

        {/* Empty */}
        {state === 'empty' && (
          <div className="text-center py-5">
            <div className="cat-icon mx-auto mb-4" style={{ width: 96, height: 96, fontSize: '2.4rem' }}>
              <i className="bi bi-file-earmark-x"></i>
            </div>
            <h4 className="section-title" style={{ fontSize: '1.5rem' }}>Order Not Found</h4>
            <p className="section-sub mx-auto mb-4">We couldn't find the order you're looking for.</p>
            <Link to="/orders" className="btn btn-primary btn-lg"><i className="bi bi-arrow-left me-1"></i> Back to Orders</Link>
          </div>
        )}

        {/* Order Content */}
        {state === 'ready' && order && (
          <div>
            {/* Order Summary Card */}
            <div className="admin-card mb-4">
              <div className="row g-4">
                <div className="col-md-3 col-6">
                  <p className="stat-label mb-1">Order ID</p>
                  <p className="fw-bold mb-0" style={{ color: 'var(--ink)' }}>#{order.id}</p>
                </div>
                <div className="col-md-3 col-6">
                  <p className="stat-label mb-1">Order Date</p>
                  <p className="fw-semibold mb-0">{formatDate(order.orderDate)}</p>
                </div>
                <div className="col-md-3 col-6">
                  <p className="stat-label mb-1">Status</p>
                  <span className={`badge-status ${statusBadgeClass(order.status)}`}>{order.status}</span>
                </div>
                <div className="col-md-3 col-6">
                  <p className="stat-label mb-1">Payment Method</p>
                  <p className="fw-semibold mb-0">{order.paymentMethod || 'N/A'}</p>
                </div>
              </div>
              <hr style={{ borderColor: 'var(--border)', margin: '1.6rem 0' }} />
              <div className="row">
                <div className="col-12">
                  <p className="stat-label mb-1"><i className="bi bi-geo-alt-fill text-coral me-1"></i>Shipping Address</p>
                  <p className="mb-0 fw-semibold" style={{ color: 'var(--slate)' }}>{order.shippingAddress || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="admin-card mb-4">
              <h5 className="section-title mb-3" style={{ fontSize: '1.2rem' }}>Items in this Order</h5>
              <div className="table-responsive">
                <table className="table table-admin align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>Image</th>
                      <th>Product</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--slate-light)' }}>No items found for this order.</td></tr>
                    )}
                    {items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <img src={getProductImg(item.productId)} alt={getProductName(item.productId)}
                            style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
                        </td>
                        <td className="fw-semibold" style={{ color: 'var(--ink)' }}>{getProductName(item.productId)}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">{formatCurrency(item.price)}</td>
                        <td className="text-end fw-bold" style={{ color: 'var(--ink)' }}>{formatCurrency(Number(item.price) * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="row justify-content-end mb-4">
              <div className="col-lg-5 col-md-7">
                <div className="summary-card">
                  <h5 className="section-title mb-3" style={{ fontSize: '1.15rem' }}>Order Summary</h5>
                  <div className="summary-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
                  <div className="summary-row total"><span>Grand Total</span><span className="text-coral">{formatCurrency(order.totalAmount)}</span></div>
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-between">
              <Link to="/orders" className="btn btn-light-soft"><i className="bi bi-arrow-left me-1"></i> Back to Orders</Link>
              <button className="btn btn-primary" onClick={() => window.print()}><i className="bi bi-download me-1"></i> Download Invoice</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
