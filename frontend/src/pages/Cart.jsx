import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cart } from '../services/api';
import { showToast } from '../utils/helpers';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const load = () => cart.get().then(r => setItems(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const removeItem = async (cartId) => {
    try { await cart.remove(cartId); setItems(prev => prev.filter(i => i.cartId !== cartId)); showToast('Item removed from cart'); }
    catch { showToast('Failed to remove item', true); }
  };

  const update = async (cartId, qty) => {
    if (qty < 1) return removeItem(cartId);
    try {
      await cart.update(cartId, qty);
      setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity: qty } : i));
    } catch { showToast('Failed to update quantity', true); }
  };

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shipping = subtotal > 2000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  if (loading) return (
    <div className="container py-4 text-center py-5">
      <div className="loader-ring mx-auto"></div>
    </div>
  );

  if (!items.length) return (
    <div className="container py-4">
      <div className="text-center py-5">
        <i className="bi bi-cart-x" style={{ fontSize: '3.5rem', color: 'var(--border)' }}></i>
        <h4 className="mt-3">Your cart is empty</h4>
        <p className="text-muted">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary btn-lg mt-2">Continue Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <nav className="breadcrumb-shop"><Link to="/">Home</Link> / <span className="text-dark fw-semibold">Shopping Cart</span></nav>
      <h2 className="section-title mb-4">Your Shopping Cart</h2>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="table-responsive">
            <table className="table cart-table align-middle">
              <thead>
                <tr className="text-muted small text-uppercase">
                  <th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.cartId} className="cart-row">
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img src={i.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'} alt={i.productName} />
                        <div><div className="fw-semibold">{i.productName}</div></div>
                      </div>
                    </td>
                    <td>₹{Number(i.price).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="qty-selector">
                        <button onClick={() => update(i.cartId, i.quantity - 1)}>−</button>
                        <input type="text" value={i.quantity} readOnly />
                        <button onClick={() => update(i.cartId, i.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td className="fw-bold">₹{(Number(i.price) * i.quantity).toLocaleString('en-IN')}</td>
                    <td>
                      <button className="btn btn-sm text-danger" onClick={() => removeItem(i.cartId)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/products" className="btn btn-light-soft"><i className="bi bi-arrow-left me-1"></i> Continue Shopping</Link>
        </div>

        <div className="col-lg-4">
          <div className="summary-card">
            <h5 className="mb-3">Order Summary</h5>
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className="summary-row"><span>Tax (5%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            <Link to="/checkout" className="btn btn-coral btn-lg w-100 mt-3">
              Proceed to Checkout <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
