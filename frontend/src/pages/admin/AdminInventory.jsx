import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { inventory } from '../../services/api';

export default function AdminInventory() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInventory = async () => {

  try {

    setLoading(true);
    setError('');

    const response = await inventory.getProducts();

    console.log("Inventory products:", response.data);

    setProducts(response.data || []);

  } catch (err) {

    console.error('Inventory loading error:', err);

    setError(
      err.response?.data || 'Failed to load inventory'
    );

  } finally {

    setLoading(false);
  }
};

  useEffect(() => {
    loadInventory();
  }, []);

  const getStockStatus = (quantity) => {

    if (quantity === 0) {
      return {
        text: 'Out of Stock',
        className: 'bg-danger'
      };
    }

    if (quantity <= 5) {
      return {
        text: 'Low Stock',
        className: 'bg-warning text-dark'
      };
    }

    return {
      text: 'In Stock',
      className: 'bg-success'
    };
  };

  return (
    <AdminLayout
      title="Inventory"
      subtitle="Monitor and manage product stock"
    >

      <div className="container-fluid p-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h5 className="fw-bold mb-1">
              Inventory Management
            </h5>

            <p className="text-muted small mb-0">
              Track current product stock
            </p>
          </div>

          <button
            className="btn btn-dark"
            onClick={loadInventory}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (

          <div className="text-center py-5">
            <div
              className="spinner-border"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-muted mt-3">
              Loading inventory...
            </p>
          </div>

        ) : (

          <div className="admin-card">

            <div className="table-responsive">

              <table className="table table-admin align-middle mb-0">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {products.length === 0 ? (

                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-muted py-5"
                      >
                        No products found.
                      </td>
                    </tr>

                  ) : (

                    products.map(product => {

                      const quantity = Number(
                        product.quantity || 0
                      );

                      const status =
                        getStockStatus(quantity);

                      return (
                        <tr key={product.id}>

                          <td>
                            #{product.id}
                          </td>

                          <td>
                            <div className="fw-semibold">
                              {product.name}
                            </div>
                          </td>

                          <td>
                            {product.category || '—'}
                          </td>

                          <td>
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString('en-IN')}
                          </td>

                          <td>
                            <strong>
                              {quantity}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`badge ${status.className}`}
                            >
                              {status.text}
                            </span>
                          </td>

                        </tr>
                      );
                    })

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </AdminLayout>
  );
}