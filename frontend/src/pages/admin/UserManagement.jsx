import { useEffect, useState } from 'react';
import { admin } from '../../services/api';
import { showToast } from '../../utils/helpers';
import AdminLayout from './AdminLayout';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);

  const load = () => admin.users().then(r => setUsers(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await admin.updateUserStatus(id, newStatus);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToast(`User ${newStatus === 'ACTIVE' ? 'unblocked' : 'blocked'} successfully`);
    } catch { showToast('Failed to update user', true); }
  };

  const list = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="User Management" subtitle="View and manage registered customers.">
      <div className="admin-card reveal">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="fw-bold mb-0">All Users ({users.length})</h6>
          <input type="text" className="form-control w-auto" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-responsive">
          <table className="table table-admin mb-0">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-3">No users found.</td></tr>}
              {list.map(u => (
                <tr key={u.id}>
                  <td><div className="d-flex align-items-center gap-2">
                    <img src={`https://i.pravatar.cc/40?u=${u.id}`} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    <span className="fw-semibold small">{u.name}</span>
                  </div></td>
                  <td className="small">{u.email}</td>
                  <td className="small">{u.role}</td>
                  <td><span className={`badge-status ${(u.status || 'ACTIVE') === 'ACTIVE' ? 'badge-active' : 'badge-blocked'}`}>{u.status || 'ACTIVE'}</span></td>
                  <td>
                    <button className="btn btn-sm btn-light-soft me-1" data-bs-toggle="modal" data-bs-target="#userModal" onClick={() => setViewUser(u)}><i className="bi bi-eye"></i></button>
                    <button className="btn btn-sm btn-light-soft" onClick={() => toggleStatus(u.id, u.status || 'ACTIVE')}>
                      <i className={`bi bi-${(u.status || 'ACTIVE') === 'ACTIVE' ? 'lock' : 'unlock'}`}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="modal fade" id="userModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 18 }}>
            <div className="modal-header border-0">
              <h5 className="modal-title">User Details</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {viewUser && (
                <div>
                  <div className="text-center mb-3">
                    <img src={`https://i.pravatar.cc/100?u=${viewUser.id}`} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    <h5 className="mt-2 mb-0">{viewUser.name}</h5>
                    <span className={`badge-status ${(viewUser.status || 'ACTIVE') === 'ACTIVE' ? 'badge-active' : 'badge-blocked'}`}>{viewUser.status || 'ACTIVE'}</span>
                  </div>
                  <div className="row small g-2">
                    <div className="col-5"><strong>Email:</strong></div><div className="col-7">{viewUser.email}</div>
                    <div className="col-5"><strong>Role:</strong></div><div className="col-7">{viewUser.role}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-light-soft" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
