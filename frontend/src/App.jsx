import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminInventory from './pages/admin/AdminInventory';

import OrderManagement from './pages/admin/OrderManagement';
import { useAuth } from './context/AuthContext';
import { hideLoader, initReveal } from './utils/helpers';

// Protected — redirect to /login with current path saved in state
// so after login user goes back to where they tried to go
function Protected({ children, adminOnly }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

// GuestOnly — if already logged in redirect away from login/register
function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/'} replace />;
  return children;
}

const ADMIN_PATHS = [
  '/admin/dashboard',
  '/admin/products',
  '/admin/inventory',
  '/admin/orders',
  '/admin/users'
];
const AUTH_PATHS  = ['/login', '/register', '/admin/login'];

export default function App() {
  const loc     = useLocation();
  const isAdmin = ADMIN_PATHS.some(p => loc.pathname.startsWith(p));
  const isAuth  = AUTH_PATHS.includes(loc.pathname);
  const active  = loc.pathname === '/' ? 'home' : loc.pathname.startsWith('/products') ? 'shop' : '';

  useEffect(() => { hideLoader(); setTimeout(initReveal, 200); }, [loc.pathname]);

  useEffect(() => {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    const fn = () => btn.classList.toggle('show', window.scrollY > 400);
    window.addEventListener('scroll', fn);
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      {!isAdmin && !isAuth && <Navbar active={active} />}
      <Routes>
        {/* Public */}
        <Route path="/"                   element={<Home />} />
        <Route path="/products"           element={<Products />} />
        <Route path="/products/:id"       element={<ProductDetail />} />

        {/* Guest only — redirect if already logged in */}
        <Route path="/login"              element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register"           element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/admin/login"        element={<GuestOnly><AdminLogin /></GuestOnly>} />

        {/* Protected — customer */}
        <Route path="/cart"               element={<Protected><Cart /></Protected>} />
        <Route path="/checkout"           element={<Protected><Checkout /></Protected>} />
        <Route path="/payment"            element={<Protected><Payment /></Protected>} />
        <Route path="/order-confirmation" element={<Protected><OrderConfirmation /></Protected>} />
        <Route path="/orders"             element={<Protected><Orders /></Protected>} />
        <Route path="/order-details/:id"  element={<Protected><OrderDetails /></Protected>} />
        <Route path="/profile"            element={<Protected><Profile /></Protected>} />
        <Route path="/wishlist"           element={<Protected><Wishlist /></Protected>} />

        {/* Protected — admin only */}
        <Route path="/admin/dashboard"    element={<Protected adminOnly><Dashboard /></Protected>} />
        <Route path="/admin/products"     element={<Protected adminOnly><ProductManagement /></Protected>} />
        <Route path="/admin/users"        element={<Protected adminOnly><UserManagement /></Protected>} />
        <Route path="/admin/inventory"    element={<Protected adminOnly><AdminInventory /></Protected>}
/>
        <Route path="/admin/orders"       element={<Protected adminOnly><OrderManagement /></Protected>} />
        <Route path="/admin"              element={<Navigate to="/admin/login" replace />} />

        {/* 404 */}
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && !isAuth && <Footer />}
    </>
  );
}
