import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { showToast } from '../utils/helpers';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwStrength, setPwStrength] = useState({ width: '0%', color: '', label: 'Use 6+ characters with a number and symbol for a strong password.' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const calcStrength = (v) => {
    let score = 0;
    if (v.length >= 6) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    if (/[A-Z]/.test(v)) score++;
    const colors = ['#FF5D73', '#F5A623', '#F5A623', '#1FAA70'];
    const widths = ['25%', '50%', '75%', '100%'];
    const labels = ['Weak password', 'Fair password', 'Good password', 'Strong password'];
    const idx = Math.max(0, score - 1);
    setPwStrength({ width: v ? widths[idx] : '0%', color: colors[idx], label: v ? labels[idx] : 'Use 6+ characters with a number and symbol for a strong password.' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { showToast('Passwords do not match', true); return; }
    if (!e.target.checkValidity()) { e.target.classList.add('was-validated'); return; }
    setLoading(true);
    try {
      await auth.register({ name: form.name, email: form.email, password: form.password });
      showToast('Account created! Please log in.');
      setTimeout(() => nav('/login'), 900);
    } catch (err) {
      showToast(err.response?.data || 'Registration failed', true);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-bg-orb" style={{ width: 280, height: 280, top: -60, left: -60 }}></div>
      <div className="auth-bg-orb" style={{ width: 200, height: 200, bottom: -40, right: '5%' }}></div>
      <div className="auth-card">
        <Link to="/" className="brand-logo justify-content-center d-flex mb-3">
          <i className="bi bi-bag-check-fill text-violet"></i>&nbsp;Shop_With_Sahil
        </Link>
        <h3 className="text-center mb-1">Create your account</h3>
        <p className="text-center text-muted small mb-4">Join ShopWith_Sahil and start shopping smarter.</p>

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Full Name</label>
            <input type="text" className="form-control" placeholder="Enter your full name" required minLength={3}
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div className="invalid-feedback">Name must be at least 3 characters.</div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <div className="invalid-feedback">Enter a valid email address.</div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Phone Number</label>
            <input type="tel" className="form-control" placeholder="10-digit mobile number" required pattern="[0-9]{10}"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <div className="invalid-feedback">Enter a valid 10-digit phone number.</div>
          </div>
          <div className="mb-2">
            <label className="form-label small fw-semibold">Password</label>
            <div className="position-relative">
              <input type={showPw ? 'text' : 'password'} className="form-control" placeholder="Create a password" required minLength={6}
                value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); calcStrength(e.target.value); }} />
              <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'} position-absolute`}
                style={{ right: 14, top: 12, cursor: 'pointer', color: 'var(--slate-light)' }}
                onClick={() => setShowPw(!showPw)}></i>
            </div>
            <div className="pw-strength"><div className="pw-strength-bar" style={{ width: pwStrength.width, background: pwStrength.color }}></div></div>
            <small className="text-muted">{pwStrength.label}</small>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Confirm Password</label>
            <input type="password" className="form-control" placeholder="Re-enter password" required
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="terms" required />
            <label className="form-check-label small" htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</> : 'Create Account'}
          </button>
        </form>
        <p className="text-center small text-muted mt-4 mb-0">
          Already have an account? <Link to="/login" className="text-violet fw-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
