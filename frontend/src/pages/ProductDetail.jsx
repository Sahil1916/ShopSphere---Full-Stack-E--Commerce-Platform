import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products as productsApi, cart } from '../services/api';
import { normalizeProduct, initReveal, showToast } from '../utils/helpers';
import { WishlistStore } from '../utils/wishlist';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct]     = useState(null);
  const [related, setRelated]     = useState([]);
  const [qty, setQty]             = useState(1);
  const [loading, setLoading]     = useState(true);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsApi.getById(id).then(r => {
      const p = normalizeProduct(r.data);
      setProduct(p);
      setWishlisted(WishlistStore.has(p.id));
      productsApi.getAll().then(all => {
        const rel = (all.data || [])
          .map(normalizeProduct)
          .filter(x => x.category === p.category && x.id !== p.id)
          .slice(0, 4);
        setRelated(rel);
        setTimeout(() => initReveal(), 100);
      }).catch(() => {});
    }).catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const changeQty = (d) => setQty(q => Math.max(1, Math.min(product?.qty || 1, q + d)));

  const addToCart = async () => {
    try { await cart.add(product.id, qty); showToast('Added to cart!'); }
    catch { showToast('Failed to add to cart', true); }
  };

  const buyNow = async () => {
    try { await cart.add(product.id, qty); window.location.href = '/checkout'; }
    catch { showToast('Failed to add to cart', true); }
  };

  const toggleWishlist = () => {
    if (wishlisted) {
      WishlistStore.remove(product.id);
      setWishlisted(false);
      showToast('Removed from wishlist');
    } else {
      WishlistStore.add(product);
      setWishlisted(true);
      showToast('Added to wishlist!');
    }
  };

  if (loading) return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-6"><div className="skeleton" style={{ height: 420, borderRadius: 18 }}></div></div>
        <div className="col-lg-6">
          <div className="skeleton mb-3" style={{ height: 32, width: '70%' }}></div>
          <div className="skeleton mb-3" style={{ height: 20, width: '40%' }}></div>
          <div className="skeleton mb-4" style={{ height: 60 }}></div>
          <div className="skeleton" style={{ height: 48, width: 200 }}></div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container py-5 text-center">
      <h5>Product not found</h5>
      <Link to="/products" className="btn btn-primary mt-2">Back to Shop</Link>
    </div>
  );

  const off = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <div className="container py-4">
      <nav className="breadcrumb-shop">
        <Link to="/">Home</Link> / <Link to="/products">Shop</Link> / <span className="text-dark fw-semibold">{product.name}</span>
      </nav>

      <div className="row g-5">
        <div className="col-lg-6">
          <div className="pd-gallery-main mb-3">
            <img src={product.img} alt={product.name} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="product-cat">{product.category}</div>
          <h2 className="mb-2">{product.name}</h2>

          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="price-now fs-2">₹{product.price.toLocaleString('en-IN')}</span>
            {product.mrp && (
              <>
                <span className="price-mrp fs-5">₹{product.mrp.toLocaleString('en-IN')}</span>
                <span className="price-off">{off}% off</span>
              </>
            )}
          </div>

          <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>{product.description}</p>

          <div className="mb-3">
            <span className={`badge rounded-pill px-3 py-2 ${product.qty <= 0 ? 'text-bg-danger' : product.qty < 15 ? 'text-bg-warning' : 'text-bg-success'}`}>
              <i className="bi bi-box-seam me-1"></i>
              {product.qty <= 0 ? 'Out of Stock' : product.qty < 15 ? `Only ${product.qty} left!` : `${product.qty} units available`}
            </span>
          </div>

          {/* Qty selector */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="fw-semibold">Quantity:</span>
            <div className="qty-selector">
              <button onClick={() => changeQty(-1)}>−</button>
              <input type="text" value={qty} readOnly />
              <button onClick={() => changeQty(1)}>+</button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex gap-3 flex-wrap mb-3">
            <button className="btn btn-outline-violet btn-lg flex-grow-1"
              disabled={product.qty <= 0} onClick={addToCart}>
              <i className="bi bi-cart-plus me-1"></i> Add to Cart
            </button>
            <button className="btn btn-coral btn-lg flex-grow-1"
              disabled={product.qty <= 0} onClick={buyNow}>
              <i className="bi bi-lightning-charge-fill me-1"></i> Buy Now
            </button>
          </div>

          {/* Wishlist button */}
          <button
            className={`btn w-100 mb-4${wishlisted ? ' btn-danger' : ' btn-light-soft'}`}
            onClick={toggleWishlist}>
            <i className={`bi bi-heart${wishlisted ? '-fill' : ''} me-1`}></i>
            {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>

          {/* Trust badges */}
          <div className="row g-3 small text-muted text-center">
            <div className="col-4"><i className="bi bi-truck fs-5 text-violet d-block mb-1"></i>Free Delivery</div>
            <div className="col-4"><i className="bi bi-arrow-counterclockwise fs-5 text-violet d-block mb-1"></i>7-Day Returns</div>
            <div className="col-4"><i className="bi bi-shield-check fs-5 text-violet d-block mb-1"></i>Secure Payment</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-4">You May Also Like</h4>
          <div className="row g-4">{related.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </div>
      )}
    </div>
  );
}
