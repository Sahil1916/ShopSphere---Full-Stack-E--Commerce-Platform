import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/helpers';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  // After login, redirect to where user came from (or home)
  const from = loc.state?.from || '/';

  const submit = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.classList.add('was-validated'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'ADMIN') nav('/admin/dashboard', { replace: true });
      else nav(from, { replace: true });
    } catch (err) {
      if (err.message === 'BLOCKED') {
        showToast('Your account has been blocked. Contact support.', true);
      } else {
        showToast('Invalid email or password', true);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-bg-orb" style={{ width: 300, height: 300, top: -80, right: -60 }}></div>
      <div className="auth-bg-orb" style={{ width: 180, height: 180, bottom: -30, left: '8%' }}></div>
      <div className="auth-card">
        <Link to="/" className="brand-logo justify-content-center d-flex mb-3">
          <i className="bi bi-bag-check-fill text-violet"></i>&nbsp;Shop_With_Sahil
        </Link>
        <h3 className="text-center mb-1">Welcome back</h3>
        <p className="text-center text-muted small mb-4">Log in to continue shopping.</p>

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <div className="invalid-feedback">Enter a valid email address.</div>
          </div>
          <div className="mb-2">
            <label className="form-label small fw-semibold">Password</label>
            <div className="position-relative">
              <input type={showPw ? 'text' : 'password'} className="form-control"
                placeholder="Enter your password" required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'} position-absolute`}
                style={{ right: 14, top: 12, cursor: 'pointer', color: 'var(--slate-light)' }}
                onClick={() => setShowPw(!showPw)}></i>
            </div>
            <div className="invalid-feedback">Password must be at least 6 characters.</div>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="remember" />
              <label className="form-check-label small" htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="small text-violet fw-semibold"
              data-bs-toggle="modal" data-bs-target="#forgotModal">Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Logging in...</>
              : 'Log In'}
          </button>
          <div className="text-center my-3 text-muted small">— or continue with —</div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-light-soft w-50"
              onClick={() => showToast('Google sign-in not available in demo')}>
              <i className="bi bi-google me-1"></i> Google
            </button>
            <button type="button" className="btn btn-light-soft w-50"
              onClick={() => showToast('Facebook sign-in not available in demo')}>
              <i className="bi bi-facebook me-1"></i> Facebook
            </button>
          </div>
        </form>
        <p className="text-center small text-muted mt-4 mb-0">
          New to ShopWith_Sahil?{' '}
          <Link to="/register" className="text-violet fw-semibold">Create an account</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <div className="modal fade" id="forgotModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 18 }}>
            <div className="modal-header border-0">
              <h5 className="modal-title">Reset your password</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p className="text-muted small">Enter your registered email and we'll send a reset link.</p>
              <input type="email" className="form-control" placeholder="you@example.com" />
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-light-soft" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" data-bs-dismiss="modal"
                onClick={() => showToast('Password reset link sent to your email')}>
                Send Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
