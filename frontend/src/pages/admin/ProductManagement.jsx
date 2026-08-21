import { useEffect, useState } from 'react';
import { products as productsApi } from '../../services/api';
import { showToast } from '../../utils/helpers';
import AdminLayout from './AdminLayout';

const EMPTY = { name: '', description: '', category: 'Electronics', price: '', mrp: '', quantity: '', imageUrl: '' };
const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => productsApi.getAll().then(r => setProducts(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: +form.price, mrp: form.mrp ? +form.mrp : null, quantity: +form.quantity, imageUrl: form.imageUrl || PLACEHOLDER };
    try {
      if (editId) { await productsApi.update(editId, payload); showToast('Product updated'); }
      else { await productsApi.create(payload); showToast('Product added'); }
      setForm(EMPTY); setEditId(null); load();
    } catch { showToast('Failed to save product', true); }
    finally { setSaving(false); }
  };

  const editProduct = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description || '', category: p.category, price: p.price, mrp: p.mrp || '', quantity: p.quantity, imageUrl: p.imageUrl || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await productsApi.remove(deleteTarget);
      showToast('Product deleted');
      setDeleteTarget(null);
      const modal = window.bootstrap?.Modal.getInstance(document.getElementById('deleteModal'));
      modal?.hide();
      load();
    } catch { showToast('Failed to delete', true); }
  };

  const list = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Product Management" subtitle="Add, edit and manage your product catalog.">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="admin-card reveal">
            <h6 className="fw-bold mb-3">
              <i className={`bi ${editId ? 'bi-pencil-square' : 'bi-plus-circle'} me-1 text-violet`}></i>
              {editId ? 'Edit Product' : 'Add New Product'}
            </h6>
            <form onSubmit={save}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Product Image URL</label>
                <input type="url" className="form-control" placeholder="https://example.com/image.jpg" {...f('imageUrl')} />
                {form.imageUrl && <img src={form.imageUrl} style={{ maxWidth: '100%', borderRadius: 10, maxHeight: 120, objectFit: 'cover', marginTop: 8 }} onError={e => e.target.style.display = 'none'} alt="" />}
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Product Name</label>
                <input type="text" className="form-control" required {...f('name')} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Description</label>
                <textarea className="form-control" rows={2} required {...f('description')}></textarea>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <select className="form-select" required {...f('category')}>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Price (₹)</label>
                  <input type="number" className="form-control" min={1} required {...f('price')} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">MRP / Original Price (₹)</label>
                <input type="number" className="form-control" min={1} {...f('mrp')} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Quantity Available</label>
                <input type="number" className="form-control" min={0} required {...f('quantity')} />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className={`bi ${editId ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>{editId ? 'Update Product' : 'Add Product'}</>}
              </button>
              {editId && <button type="button" className="btn btn-light-soft w-100 mt-2" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel Edit</button>}
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="admin-card reveal">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h6 className="fw-bold mb-0">All Products (<span>{products.length}</span>)</h6>
              <input type="text" className="form-control w-auto" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="table-responsive">
              <table className="table table-admin mb-0">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Qty</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {list.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-3">No products found.</td></tr>}
                  {list.map(p => (
                    <tr key={p.id}>
                      <td><div className="d-flex align-items-center gap-2"><img src={p.imageUrl || PLACEHOLDER} style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover' }} alt="" /><span className="fw-semibold small">{p.name}</span></div></td>
                      <td><span className="badge-status badge-shipped">{p.category}</span></td>
                      <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td>{p.quantity}</td>
                      <td>{p.quantity > 0 ? <span className="badge-status badge-active">In Stock</span> : <span className="badge-status badge-blocked">Out of Stock</span>}</td>
                      <td>
                        <button className="btn btn-sm btn-light-soft me-1" onClick={() => editProduct(p)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-light-soft text-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" onClick={() => setDeleteTarget(p.id)}><i className="bi bi-trash3"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="deleteModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 18 }}>
            <div className="modal-body text-center py-4">
              <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '2.5rem' }}></i>
              <h5 className="mt-3">Delete this product?</h5>
              <p className="text-muted small">This action cannot be undone.</p>
              <div className="d-flex gap-2 justify-content-center mt-3">
                <button className="btn btn-light-soft" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-coral" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
