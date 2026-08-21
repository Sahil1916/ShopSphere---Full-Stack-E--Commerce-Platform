import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/helpers';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.classList.add('was-validated'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'ADMIN') { showToast('This login is for administrators only', true); return; }
      nav('/admin/dashboard');
    } catch { showToast('Login failed. Please try again.', true); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap" style={{ background: 'var(--ink)' }}>
      <div className="auth-bg-orb" style={{ width: 300, height: 300, top: -80, left: -60 }}></div>
      <div className="auth-bg-orb" style={{ width: 200, height: 200, bottom: -40, right: '8%' }}></div>
      <div className="auth-card">
        <div className="text-center mb-3">
          <span className="cat-icon mx-auto" style={{ marginBottom: '1rem' }}><i className="bi bi-shield-lock-fill"></i></span>
        </div>
        <h3 className="text-center mb-1">Admin Console</h3>
        <p className="text-center text-muted small mb-4">Restricted access — authorized personnel only.</p>
        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Admin Email</label>
            <input type="email" className="form-control" placeholder="admin@shop_with_sahil.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <div className="invalid-feedback">Enter a valid admin email.</div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <input type="password" className="form-control" placeholder="Enter admin password" required minLength={6}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <div className="invalid-feedback">Password must be at least 6 characters.</div>
          </div>
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="adminRemember" />
            <label className="form-check-label small" htmlFor="adminRemember">Keep me signed in on this device</label>
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Authenticating...</> : 'Sign In to Dashboard'}
          </button>
        </form>
        <p className="text-center small text-muted mt-4 mb-0">
          <Link to="/" className="text-violet fw-semibold"><i className="bi bi-arrow-left me-1"></i>Back to Store</Link>
        </p>
      </div>
    </div>
  );
}
