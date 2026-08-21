import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cart as cartApi } from '../services/api';
import { showToast } from '../utils/helpers';

export default function Checkout() {
  const [items, setItems]         = useState([]);
  const [form, setForm]           = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [payMethod, setPayMethod] = useState('CARD');
  const formRef = useRef(null);   // ← ref to the form element
  const nav = useNavigate();

  useEffect(() => {
    cartApi.get().then(r => {
      const data = r.data || [];
      if (!data.length) nav('/cart');
      setItems(data);
    }).catch(() => nav('/cart'));
  }, []);

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shipping  = subtotal > 2000 ? 0 : 99;
  const tax       = Math.round(subtotal * 0.05);
  const total     = subtotal + shipping + tax;

  const goToPayment = () => {
    const formEl = formRef.current;

    // Validate required fields manually since the button is outside the form
    if (!formEl.checkValidity()) {
      formEl.classList.add('was-validated');
      showToast('Please fill in all shipping details correctly', true);
      formEl.querySelector(':invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const shippingAddress = [form.name, form.phone, form.address, form.city, form.state, form.pincode].join(', ');
    sessionStorage.setItem('shipping_address', shippingAddress);
    sessionStorage.setItem('payment_method', payMethod);
    sessionStorage.setItem('order_total', total);

    if (payMethod === 'COD') nav('/order-confirmation?cod=1');
    else nav('/payment');
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="container py-4">
      {/* Steps */}
      <div className="steps-track">
        <div className="step-item done"><div className="step-circle"><i className="bi bi-check-lg"></i></div><span className="label">Cart</span></div>
        <div className="step-item active"><div className="step-circle">2</div><span className="label">Shipping</span></div>
        <div className="step-item"><div className="step-circle">3</div><span className="label">Payment</span></div>
        <div className="step-item"><div className="step-circle">4</div><span className="label">Confirmation</span></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">

          {/* Shipping form — ref attached here */}
          <div className="filter-card mb-4">
            <h5 className="mb-3"><i className="bi bi-truck me-2 text-violet"></i>Shipping Details</h5>
            <form ref={formRef} className="row g-3" noValidate>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Full Name</label>
                <input type="text" className="form-control" placeholder="Enter your full name" required minLength={3} {...f('name')} />
                <div className="invalid-feedback">Please enter your full name.</div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Phone Number</label>
                <input type="tel" className="form-control" placeholder="10-digit mobile number" pattern="[0-9]{10}" required {...f('phone')} />
                <div className="invalid-feedback">Enter a valid 10-digit phone number.</div>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Address</label>
                <input type="text" className="form-control" placeholder="House no, street, area" required {...f('address')} />
                <div className="invalid-feedback">Please enter your address.</div>
              </div>
              <div className="col-md-5">
                <label className="form-label small fw-semibold">City</label>
                <input type="text" className="form-control" placeholder="City" required {...f('city')} />
                <div className="invalid-feedback">Please enter your city.</div>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">State</label>
                <input type="text" className="form-control" placeholder="State" required {...f('state')} />
                <div className="invalid-feedback">Please enter your state.</div>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">PIN Code</label>
                <input type="text" className="form-control" placeholder="6-digit PIN" pattern="[0-9]{6}" required {...f('pincode')} />
                <div className="invalid-feedback">Enter a valid 6-digit PIN.</div>
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="filter-card">
            <h5 className="mb-3"><i className="bi bi-credit-card me-2 text-violet"></i>Payment Method</h5>
            {[
              ['CARD', 'bi-credit-card-2-front', 'Credit / Debit Card'],
              ['UPI',  'bi-phone',               'UPI'],
              ['COD',  'bi-cash-stack',           'Cash on Delivery'],
            ].map(([m, ico, label]) => (
              <div key={m}
                className={`payment-method-card mb-2${payMethod === m ? ' active' : ''}`}
                onClick={() => setPayMethod(m)}
                style={{ cursor: 'pointer' }}>
                <i className={`bi ${ico} me-2`}></i>{label}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary — button is here, outside the form */}
        <div className="col-lg-5">
          <div className="summary-card">
            <h5 className="mb-3">Order Summary</h5>
            <div className="mb-3">
              {items.map(i => (
                <div key={i.cartId} className="d-flex justify-content-between small mb-2">
                  <span>{i.productName} <span className="text-muted">×{i.quantity}</span></span>
                  <span className="fw-semibold">₹{(Number(i.price) * i.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className="summary-row"><span>Tax (5%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>

            {/* Button calls goToPayment() directly — no form submit event */}
            <button className="btn btn-coral btn-lg w-100 mt-3" onClick={goToPayment}>
              Continue to Payment <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
