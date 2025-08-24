import React, { useEffect, useState } from 'react';
import { getProducts, deleteProduct } from '../api/productApi';

const Products = ({ onEdit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    page: 1,
    limit: 10
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(filters);
      
      if (response.success) {
        setProducts(response.data.products || []);
      } else {
        setError(response.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Error loading products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await deleteProduct(id);
        if (response.success) {
          loadProducts(); // Reload products list
        } else {
          alert('Failed to delete product: ' + response.message);
        }
      } catch (err) {
        alert('Error deleting product: ' + err.message);
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Products</h2>
        <span className="badge bg-secondary">{products.length} products</span>
      </div>

      {/* Search and Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-control"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="shirts">Shirts</option>
            <option value="pants">Pants</option>
            <option value="dresses">Dresses</option>
            <option value="jackets">Jackets</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-control"
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
          >
            <option value="">All Brands</option>
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="row">
        {products.map(product => (
          <div key={product.id} className="col-md-6 col-lg-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h6">${product.base_price}</span>
                  <small className="text-muted">{product.category}</small>
                </div>
                <div className="mt-2">
                  <span className="badge bg-info me-2">{product.brand}</span>
                  <span className="badge bg-secondary">{product.gender}</span>
                </div>
                <div className="mt-3">
                  <button 
                    className="btn btn-sm btn-primary me-2" 
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No products found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};
export default Products;
