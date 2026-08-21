import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-shop">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <Link className="brand-logo text-white mb-3 d-inline-flex" to="/">
              <i className="bi bi-bag-check-fill text-coral"></i>&nbsp;Shop_With_Sahil
            </Link>
            <p className="small mb-3">Premium products, honest prices, and delivery you can trust. Shop_With_Sahil brings the best of electronics, fashion and home to your doorstep.</p>
            <div className="footer-social">
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-instagram"></i></a>
              <a href="#"><i className="bi bi-twitter-x"></i></a>
              <a href="#"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          <div className="col-lg-2 col-6">
            <h6>Shop</h6>
            <Link to="/products">All Products</Link>
            <Link to="/products?cat=Electronics">Electronics</Link>
            <Link to="/products?cat=Fashion">Fashion</Link>
            <Link to="/products?cat=Home">Home</Link>
          </div>
          <div className="col-lg-2 col-6">
            <h6>Account</h6>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/cart">My Cart</Link>
            <Link to="/orders">My Orders</Link>
          </div>
          <div className="col-lg-2 col-6">
            <h6>Company</h6>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <Link to="/admin/login">Admin Login</Link>
            <a href="#">Contact</a>
          </div>
          <div className="col-lg-2 col-6">
            <h6>Support</h6>
            <a href="#">Help Center</a>
            <a href="#">Returns</a>
            <a href="#">Shipping Info</a>
            <a href="#">Track Order</a>
          </div>
        </div>
        <hr className="border-light opacity-10 mt-4" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small pt-2 gap-2">
          <span>© 2026 Shop_With_Sahil. All rights reserved. Built for MCA Advanced Java Project.</span>
          <span className="d-flex gap-3">
            <i className="bi bi-credit-card-2-front"></i>
            <i className="bi bi-paypal"></i>
            <i className="bi bi-wallet2"></i>
            <i className="bi bi-google-pay"></i>
          </span>
        </div>
      </div>
    </footer>
  );
}
