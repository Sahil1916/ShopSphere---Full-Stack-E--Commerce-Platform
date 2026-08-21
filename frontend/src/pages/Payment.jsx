import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orders as ordersApi } from '../services/api';
import { showToast } from '../utils/helpers';

export default function Payment() {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const total = sessionStorage.getItem('order_total') || 0;

  const fmtNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry = (v) => { let d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  const submit = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.classList.add('was-validated'); showToast('Please check your card details', true); return; }
    setLoading(true);
    setTimeout(async () => {
      try {
        await ordersApi.place({
          shippingAddress: sessionStorage.getItem('shipping_address') || '',
          paymentMethod: sessionStorage.getItem('payment_method') || 'CARD'
        });
        nav('/order-confirmation');
      } catch { showToast('Payment failed. Please try again.', true); setLoading(false); }
    }, 1200);
  };

  const displayNumber = card.number || '•••• •••• •••• ••••';

  return (
    <div className="container py-4">
      <div className="steps-track">
        <div className="step-item done"><div className="step-circle"><i className="bi bi-check-lg"></i></div><span className="label">Cart</span></div>
        <div className="step-item done"><div className="step-circle"><i className="bi bi-check-lg"></i></div><span className="label">Shipping</span></div>
        <div className="step-item active"><div className="step-circle">3</div><span className="label">Payment</span></div>
        <div className="step-item"><div className="step-circle">4</div><span className="label">Confirmation</span></div>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <div className={`credit-card-preview${flipped ? ' flipped' : ''}`}>
            <div className="d-flex justify-content-between align-items-start">
              <div className="cc-chip"></div>
              <i className="bi bi-wifi fs-5" style={{ transform: 'rotate(90deg)' }}></i>
            </div>
            <div className="cc-number">{displayNumber}</div>
            <div className="cc-row">
              <div>Card Holder<strong>{card.name.toUpperCase() || 'YOUR NAME'}</strong></div>
              <div>Expires<strong>{card.expiry || 'MM/YY'}</strong></div>
            </div>
          </div>
          <div className="filter-card">
            <h6 className="mb-3">Total Payable</h6>
            <h3 className="text-violet">₹{Number(total).toLocaleString('en-IN')}</h3>
            <p className="text-muted small mb-0"><i className="bi bi-shield-lock me-1"></i>256-bit SSL encrypted secure payment</p>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="filter-card">
            <h5 className="mb-4"><i className="bi bi-credit-card-2-front me-2 text-violet"></i>Card Details</h5>
            <form onSubmit={submit} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Card Number</label>
                <input type="text" className="form-control" placeholder="1234 5678 9012 3456" maxLength={19}
                  required pattern="[0-9\s]{19}" value={card.number}
                  onChange={e => setCard({ ...card, number: fmtNumber(e.target.value) })} />
                <div className="invalid-feedback">Enter a valid 16-digit card number.</div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Card Holder Name</label>
                <input type="text" className="form-control" placeholder="As shown on card" required value={card.name}
                  onChange={e => setCard({ ...card, name: e.target.value })} />
                <div className="invalid-feedback">Card holder name is required.</div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Expiry Date</label>
                  <input type="text" className="form-control" placeholder="MM/YY" maxLength={5}
                    required pattern="(0[1-9]|1[0-2])\/[0-9]{2}" value={card.expiry}
                    onChange={e => setCard({ ...card, expiry: fmtExpiry(e.target.value) })} />
                  <div className="invalid-feedback">Use MM/YY format.</div>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">CVV</label>
                  <input type="password" className="form-control" placeholder="123" maxLength={3}
                    required pattern="[0-9]{3}" value={card.cvv}
                    onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} />
                  <div className="invalid-feedback">Enter a valid 3-digit CVV.</div>
                </div>
              </div>
              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="saveCard" />
                <label className="form-check-label small" htmlFor="saveCard">Save this card for future payments</label>
              </div>
              <button type="submit" className="btn btn-coral btn-lg w-100" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing payment...</> : <><i className="bi bi-lock-fill me-1"></i> Pay Now</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
