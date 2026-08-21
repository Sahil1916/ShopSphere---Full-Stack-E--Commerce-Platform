import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin, products as productsApi } from '../../services/api';
import { statusBadgeClass } from '../../utils/helpers';
import AdminLayout from './AdminLayout';

function animateCounter(el, target) {
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = cur.toLocaleString('en-IN');
  }, 20);
}

// Wait for Chart.js to load (it's a deferred script in index.html)
function waitForChart(cb, retries = 20) {
  if (typeof window.Chart !== 'undefined') { cb(); return; }
  if (retries <= 0) return;
  setTimeout(() => waitForChart(cb, retries - 1), 200);
}

export default function Dashboard() {
  const [orders, setOrders]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [products, setProducts] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const chartRef = useRef(null);
  const pieRef   = useRef(null);

  useEffect(() => {
    Promise.all([productsApi.getAll(), admin.users(), admin.orders()])
      .then(([p, u, o]) => {
        setProducts(p.data || []);
        setUsers(u.data || []);
        setOrders(o.data || []);
        setDataReady(true);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!dataReady) return;

    // Animate stat counters
    const revenue = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    animateCounter(document.getElementById('statProducts'), products.length);
    animateCounter(document.getElementById('statUsers'), users.length);
    animateCounter(document.getElementById('statOrders'), orders.length);
    animateCounter(document.getElementById('statRevenue'), Math.round(revenue));

    // Draw charts only after Chart.js is available
    waitForChart(() => {
      // Revenue line chart
      const byDay = {};
      orders.forEach(o => {
        const d = o.orderDate
          ? new Date(o.orderDate).toLocaleDateString('en-IN', { weekday: 'short' })
          : 'Unknown';
        byDay[d] = (byDay[d] || 0) + Number(o.totalAmount || 0);
      });
      const dayLabels = Object.keys(byDay).length ? Object.keys(byDay) : ['No data'];
      const dayValues = Object.keys(byDay).length ? Object.values(byDay) : [0];

      if (chartRef.current) {
        if (chartRef.current._chart) chartRef.current._chart.destroy();
        chartRef.current._chart = new window.Chart(chartRef.current, {
          type: 'line',
          data: {
            labels: dayLabels,
            datasets: [{
              label: 'Revenue (₹)', data: dayValues,
              borderColor: '#C9A24B', backgroundColor: 'rgba(201,162,75,0.12)',
              fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#C9A24B'
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { grid: { color: '#F8F7F5' } }, x: { grid: { display: false } } }
          }
        });
      }

      // Category doughnut
      const catCounts = {};
      products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
      if (pieRef.current && Object.keys(catCounts).length) {
        if (pieRef.current._chart) pieRef.current._chart.destroy();
        pieRef.current._chart = new window.Chart(pieRef.current, {
          type: 'doughnut',
          data: {
            labels: Object.keys(catCounts),
            datasets: [{ data: Object.values(catCounts), backgroundColor: ['#0B0B0C', '#C9A24B', '#9C7A2E', '#85807A'], borderWidth: 0 }]
          },
          options: { plugins: { legend: { position: 'bottom' } }, cutout: '65%' }
        });
      }
    });
  }, [dataReady, orders, products, users]);

  const userById = Object.fromEntries(users.map(u => [u.id, u]));
  const recent   = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back, here's what's happening today.">
      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        {[
          { id: 'statProducts', label: 'Total Products',   icon: 'bi-box-seam-fill',   bg: 'var(--violet)' },
          { id: 'statUsers',    label: 'Total Users',      icon: 'bi-people-fill',     bg: 'var(--coral)'  },
          { id: 'statOrders',   label: 'Total Orders',     icon: 'bi-receipt-cutoff',  bg: 'var(--success)'},
          { id: 'statRevenue',  label: 'Total Revenue (₹)',icon: 'bi-currency-rupee',  bg: 'var(--warn)'   },
        ].map(s => (
          <div key={s.id} className="col-md-6 col-xl-3">
            <div className="stat-card reveal">
              <div className="stat-icon" style={{ background: s.bg }}><i className={`bi ${s.icon}`}></i></div>
              <div className="stat-num" id={s.id}>0</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="admin-card reveal h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Revenue Overview</h6>
              <select className="form-select form-select-sm w-auto">
                <option>Last 7 Days</option><option>Last 30 Days</option><option>This Year</option>
              </select>
            </div>
            <canvas ref={chartRef} height={120}></canvas>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="admin-card reveal h-100">
            <h6 className="fw-bold mb-3">Orders by Category</h6>
            <canvas ref={pieRef} height={180}></canvas>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card reveal">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Recent Orders</h6>
          <Link to="/admin/orders" className="small text-violet fw-semibold">View All <i className="bi bi-arrow-right"></i></Link>
        </div>
        <div className="table-responsive">
          <table className="table table-admin mb-0">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-3">No orders yet.</td></tr>}
              {recent.map(o => (
                <tr key={o.id}>
                  <td className="fw-semibold">#{o.id}</td>
                  <td>{userById[o.userId]?.name || `User #${o.userId}`}</td>
                  <td>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                  <td><span className="badge-status badge-paid">{o.paymentMethod || '—'}</span></td>
                  <td><span className={`badge-status ${statusBadgeClass(o.status)}`}>{o.status}</span></td>
                  <td>{o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
