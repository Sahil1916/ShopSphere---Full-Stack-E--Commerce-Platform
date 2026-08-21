import { useEffect, useState } from 'react';
import { admin } from '../../services/api';
import { showToast, statusBadgeClass } from '../../utils/helpers';
import AdminLayout from './AdminLayout';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    Promise.all([admin.orders(), admin.users()]).then(([o, u]) => {
      setOrders(o.data || []);
      setUsers(u.data || []);
    }).catch(() => {});
  }, []);

  const userNameById = (id) => users.find(u => u.id === id)?.name || `User #${id}`;

  const updateStatus = async (id, status) => {
    try {
      await admin.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast(`Order #${id} marked as ${status}`);
    } catch { showToast('Failed to update order', true); }
  };

  const list = orders.filter(o =>
    (String(o.id).includes(search) || userNameById(o.userId).toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || o.status === statusFilter)
  );

  return (
    <AdminLayout title="Order Management" subtitle="Track and update customer orders.">
      <div className="admin-card reveal">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="fw-bold mb-0">All Orders ({orders.length})</h6>
          <div className="d-flex gap-2 flex-wrap">
            <select className="form-select form-select-sm w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" className="form-control form-control-sm w-auto" placeholder="Search order/customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-admin mb-0">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-3">No orders found.</td></tr>}
              {list.map(o => (
                <tr key={o.id}>
                  <td className="fw-semibold">#{o.id}</td>
                  <td>{userNameById(o.userId)}</td>
                  <td>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="small">{o.paymentMethod || '—'}</td>
                  <td>
                    <select className="form-select form-select-sm" style={{ fontSize: '.78rem' }} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="small">{o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-light-soft" data-bs-toggle="modal" data-bs-target="#orderModal" onClick={() => setViewOrder(o)}>
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="modal fade" id="orderModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 18 }}>
            <div className="modal-header border-0">
              <h5 className="modal-title">Order Details</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {viewOrder && (
                <div>
                  <div className="d-flex justify-content-between mb-3">
                    <h6 className="mb-0">Order #{viewOrder.id}</h6>
                    <span className={`badge-status ${statusBadgeClass(viewOrder.status)}`}>{viewOrder.status}</span>
                  </div>
                  <div className="row small g-2">
                    <div className="col-5"><strong>Customer:</strong></div><div className="col-7">{userNameById(viewOrder.userId)}</div>
                    <div className="col-5"><strong>Amount:</strong></div><div className="col-7">₹{Number(viewOrder.totalAmount).toLocaleString('en-IN')}</div>
                    <div className="col-5"><strong>Payment:</strong></div><div className="col-7">{viewOrder.paymentMethod || '—'}</div>
                    <div className="col-5"><strong>Shipping:</strong></div><div className="col-7">{viewOrder.shippingAddress || '—'}</div>
                    <div className="col-5"><strong>Date:</strong></div><div className="col-7">{viewOrder.orderDate ? new Date(viewOrder.orderDate).toLocaleDateString('en-IN') : '—'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
