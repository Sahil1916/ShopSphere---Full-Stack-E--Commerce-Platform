import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { orders as ordersApi, products as productsApi } from '../services/api';
import { normalizeProduct } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    const placeCOD = searchParams.get('cod') === '1';
    const run = async () => {
      try {
        if (placeCOD) {
          await ordersApi.place({
            shippingAddress: sessionStorage.getItem('shipping_address') || '',
            paymentMethod: 'COD'
          });
        }
        const [myOrders, allProds] = await Promise.all([ordersApi.myOrders(), productsApi.getAll()]);
        const latest = (myOrders.data || []).sort((a, b) => b.id - a.id)[0];
        if (!latest) throw new Error('No order found');
        const details = await ordersApi.getById(latest.id);
        setOrder(details.data.order);
        setItems(details.data.items || []);
        setProducts((allProds.data || []).map(normalizeProduct));
      } catch { nav('/products'); }
      finally { setLoading(false); }
    };
    run();
  }, []);

  if (loading) return <div className="container py-5 text-center"><div className="loader-ring mx-auto"></div></div>;
  if (!order) return null;

  const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-IN');

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="text-center mb-5">
        <div className="success-check"><i className="bi bi-check-lg"></i></div>
        <h2 className="mb-2">Order Placed Successfully!</h2>
        <p className="text-muted">Thank you for shopping with ShopWith_Sahil. A confirmation email is on its way.</p>
      </div>

      <div className="invoice-box">
        <div className="d-flex justify-content-between flex-wrap mb-4 pb-3 border-bottom">
          <div>
            <h5 className="mb-1">Order #{order.id}</h5>
            <small className="text-muted">Placed on {dateStr}</small>
          </div>
          <span className="badge text-bg-success align-self-start rounded-pill px-3 py-2">{order.status}</span>
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <h6 className="text-violet small text-uppercase">Customer Details</h6>
            <p className="mb-0 small">{user?.name}</p>
          </div>
          <div className="col-md-6">
            <h6 className="text-violet small text-uppercase">Shipping Address</h6>
            <p className="mb-0 small">{order.shippingAddress || 'Not provided'}</p>
          </div>
        </div>
        <h6 className="text-violet small text-uppercase mb-3">Order Items</h6>
        <table className="table">
          <thead><tr className="small text-muted"><th>Product</th><th>Qty</th><th className="text-end">Price</th></tr></thead>
          <tbody>
            {items.map(i => {
              const p = products.find(pr => pr.id === i.productId);
              return (
                <tr key={i.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img src={p ? p.img : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} alt="" />
                      <span className="small">{p ? p.name : `Product #${i.productId}`}</span>
                    </div>
                  </td>
                  <td>{i.quantity}</td>
                  <td className="text-end">₹{(Number(i.price) * i.quantity).toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="d-flex justify-content-end">
          <div style={{ minWidth: 240 }}>
            <div className="summary-row total"><span>Total Paid</span><span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 justify-content-center mt-4">
        <button className="btn btn-light-soft btn-lg" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i> Print Invoice
        </button>
        <Link to="/products" className="btn btn-coral btn-lg">
          <i className="bi bi-bag me-1"></i> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
