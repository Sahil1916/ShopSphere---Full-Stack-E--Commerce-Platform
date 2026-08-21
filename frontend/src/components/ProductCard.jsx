import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cart } from '../services/api';
import { showToast } from '../utils/helpers';
import { WishlistStore } from '../utils/wishlist';

export default function ProductCard({ p }) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(WishlistStore.has(p.id));
  const off = p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : 0;

  const addToCart = async (e) => {
    e.preventDefault();
    if (!user) { showToast('Please login to add to cart', true); return; }
    try { await cart.add(p.id, 1); showToast('Added to cart!'); }
    catch { showToast('Failed to add to cart', true); }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (wishlisted) {
      WishlistStore.remove(p.id);
      setWishlisted(false);
      showToast('Removed from wishlist');
    } else {
      WishlistStore.add(p);
      setWishlisted(true);
      showToast('Added to wishlist!');
    }
  };

  return (
    <div className="col-6 col-md-4 col-lg-3 reveal">
      <div className="product-card">
        <Link to={`/products/${p.id}`} className="product-img-wrap d-block">
          {off > 0 && <div className="product-badge">{off}% off</div>}
          <img src={p.img} alt={p.name} loading="lazy" />
        </Link>

        {/* Heart wishlist button — same as original */}
        <button
          className={`wishlist-btn${wishlisted ? ' is-active' : ''}`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={toggleWishlist}>
          <i className={`bi bi-heart${wishlisted ? '-fill' : ''}`}></i>
        </button>

        <div className="p-3">
          <div className="product-cat">{p.category}</div>
          <Link to={`/products/${p.id}`}>
            <div className="product-name">{p.name}</div>
          </Link>
          <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
            <span className="price-now">₹{p.price.toLocaleString('en-IN')}</span>
            {p.mrp && (
              <>
                <span className="price-mrp">₹{p.mrp.toLocaleString('en-IN')}</span>
                <span className="price-off">{off}% off</span>
              </>
            )}
          </div>
          <div className="qty-left mt-1">
            {p.qty <= 0 ? 'Out of stock' : p.qty < 15 ? `Only ${p.qty} left!` : 'In stock'}
          </div>
          <button
            className="btn btn-primary w-100 mt-2 btn-sm-pill"
            disabled={p.qty <= 0}
            onClick={addToCart}>
            <i className="bi bi-cart-plus me-1"></i>
            {p.qty <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
