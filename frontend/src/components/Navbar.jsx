import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cart as cartApi } from '../services/api';
import { WishlistStore } from '../utils/wishlist';

export default function Navbar({ active = '' }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [cartCount, setCartCount]         = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled]           = useState(false);

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Cart count from backend
  useEffect(() => {
    if (user) {
      cartApi.get()
        .then(r => setCartCount((r.data || []).reduce((s, i) => s + i.quantity, 0)))
        .catch(() => {});
    } else {
      setCartCount(0);
    }
  }, [user]);

  // Wishlist count from localStorage — refresh every focus
  const refreshWishlist = () => setWishlistCount(WishlistStore.count());
  useEffect(() => {
    refreshWishlist();
    window.addEventListener('focus', refreshWishlist);
    return () => window.removeEventListener('focus', refreshWishlist);
  }, []);

  const handleLogout = async () => { await logout(); nav('/'); };

  return (
    <nav className={`navbar navbar-shop navbar-expand-lg${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <Link className="brand-logo" to="/">
          <i className="bi bi-bag-check-fill text-violet"></i>&nbsp;Shop_With_Sahil
        </Link>
        <button className="navbar-toggler border-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#mainNav">
          <i className="bi bi-list fs-2"></i>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom${active === 'home' ? ' active' : ''}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom${active === 'shop' ? ' active' : ''}`} to="/products">Shop</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-link-custom" to="/products#categories">Categories</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-link-custom" to="/#testimonials">Reviews</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">

            {/* Account dropdown */}
            {user ? (
              <div className="dropdown">
                <button className="icon-btn border-0 dropdown-toggle"
                  data-bs-toggle="dropdown" title="Account"
                  style={{ background: 'none' }}>
                  <i className="bi bi-person"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end"
                  style={{ borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', minWidth: 190 }}>
                  <li>
                    <span className="dropdown-item-text fw-semibold small" style={{ color: 'var(--ink)' }}>
                      {user.name}
                    </span>
                    <span className="dropdown-item-text small text-muted" style={{ marginTop: -6 }}>
                      {user.email}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person-circle me-2"></i>My Profile</Link></li>
                  <li><Link className="dropdown-item" to="/orders"><i className="bi bi-receipt me-2"></i>My Orders</Link></li>
                  <li><Link className="dropdown-item" to="/wishlist"><i className="bi bi-heart me-2"></i>Wishlist {wishlistCount > 0 && <span className="badge bg-danger rounded-pill ms-1">{wishlistCount}</span>}</Link></li>
                  {user.role === 'ADMIN' && (
                    <li><Link className="dropdown-item" to="/admin/dashboard"><i className="bi bi-shield-check me-2"></i>Admin Panel</Link></li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="icon-btn" title="Login / Register">
                <i className="bi bi-person"></i>
              </Link>
            )}

            {/* Wishlist icon */}
            <Link to="/wishlist" className="icon-btn" title="Wishlist">
              <i className="bi bi-heart"></i>
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart icon */}
            <Link to="/cart" className="icon-btn" title="Cart">
              <i className="bi bi-bag"></i>
              {cartCount > 0 && <span className="cart-badge js-cart-count">{cartCount}</span>}
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}
