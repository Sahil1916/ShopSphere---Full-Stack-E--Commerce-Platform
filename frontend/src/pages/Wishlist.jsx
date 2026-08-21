import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cart } from '../services/api';
import { WishlistStore } from '../utils/wishlist';
import { showToast } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const { user } = useAuth();
  const nav = useNavigate();

  const refresh = () => setItems(WishlistStore.get());
  useEffect(() => { refresh(); }, []);

  const remove = (id) => {
    WishlistStore.remove(id);
    showToast('Removed from wishlist');
    refresh();
  };

  const moveToCart = async (p) => {
    if (!user) { nav('/login'); return; }
    try {
      await cart.add(p.id, 1);
      WishlistStore.remove(p.id);
      showToast('Moved to cart');
      refresh();
    } catch { showToast('Failed to add to cart', true); }
  };

  const clearAll = () => {
    WishlistStore.clear();
    showToast('Wishlist cleared');
    refresh();
  };

  return (
    <div className="container py-4">
      <nav className="breadcrumb-shop">
        <Link to="/">Home</Link> / <span className="text-dark fw-semibold">My Wishlist</span>
      </nav>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="section-title mb-0">My Wishlist</h2>
          <p className="text-muted small mb-0">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
        </div>
        {items.length > 0 && (
          <button className="btn btn-light-soft" onClick={clearAll}>
            <i className="bi bi-trash3 me-1"></i> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-heart" style={{ fontSize: '3.5rem', color: 'var(--border)' }}></i>
          <h4 className="mt-3">Your wishlist is empty</h4>
          <p className="text-muted">Tap the heart icon on any product to save it here for later.</p>
          <Link to="/products" className="btn btn-primary btn-lg mt-2">Explore Products</Link>
        </div>
      ) : (
        <div className="row g-4">
          {items.map(p => {
            const off = p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : 0;
            return (
              <div key={p.id} className="col-6 col-md-4 col-lg-3 reveal in">
                <div className="product-card">
                  <Link to={`/products/${p.id}`} className="product-img-wrap d-block">
                    {off > 0 && <span className="product-badge">{off}% off</span>}
                    <img src={p.img} alt={p.name} loading="lazy" />
                  </Link>
                  <button
                    className="wishlist-btn is-active"
                    title="Remove from wishlist"
                    onClick={() => remove(p.id)}>
                    <i className="bi bi-heart-fill"></i>
                  </button>
                  <div className="p-3">
                    <div className="product-cat">{p.category}</div>
                    <Link to={`/products/${p.id}`}>
                      <div className="product-name">{p.name}</div>
                    </Link>
                    <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                      <span className="price-now">₹{Number(p.price).toLocaleString('en-IN')}</span>
                      {p.mrp && (
                        <>
                          <span className="price-mrp">₹{Number(p.mrp).toLocaleString('en-IN')}</span>
                          <span className="price-off">{off}% off</span>
                        </>
                      )}
                    </div>
                    <button
                      className="btn btn-primary w-100 mt-2 btn-sm-pill"
                      onClick={() => moveToCart(p)}>
                      <i className="bi bi-cart-plus me-1"></i> Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
