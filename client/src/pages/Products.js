import React, { useEffect, useState } from 'react';
import { getProducts, deleteProduct, updateProductStatus } from '../api/productApi';

const Products = ({ onEdit, userRole = 'retailer' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, search]);

  const fetchProducts = async () => {
    try {
      const searchFilters = { ...filters };
      if (search) {
        searchFilters.search = search;
      }
      const data = await getProducts(searchFilters);
      setProducts(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        // eslint-disable-next-line no-console
      console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateProductStatus(id, status);
      setProducts(products.map(p => 
        p.id === id ? { ...p, status } : p
      ));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating product status:', error);
      alert('Error updating product status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <select 
            className="form-select"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {userRole === 'admin' && (
          <div className="col-md-2">
            <select 
              className="form-select"
              value={filters.wholesaler_id || ''}
              onChange={(e) => handleFilterChange('wholesaler_id', e.target.value)}
            >
              <option value="">All Wholesalers</option>
              {/* This would be populated with actual wholesaler data */}
            </select>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-4 text-muted">
          <h5>No products found</h5>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                {/* Product Images */}
                {product.images && product.images.length > 0 ? (
                  <div id={`carousel-${product.id}`} className="carousel slide">
                    <div className="carousel-inner">
                      {product.images.map((image, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                          <img 
                            src={`http://localhost:5001${image}`} 
                            className="d-block w-100" 
                            alt={product.name}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                    {product.images.length > 1 && (
                      <>
                        <button className="carousel-control-prev" type="button" data-bs-target={`#carousel-${product.id}`} data-bs-slide="prev">
                          <span className="carousel-control-prev-icon"></span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target={`#carousel-${product.id}`} data-bs-slide="next">
                          <span className="carousel-control-next-icon"></span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                    <span className="text-muted">No Image</span>
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted flex-grow-1">{product.description}</p>
                  
                  <div className="mb-2">
                    <strong className="text-success">${product.price}</strong>
                    {product.quantity !== undefined && (
                      <span className="text-muted ms-2">Qty: {product.quantity}</span>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className={`badge ${getStatusBadgeClass(product.status)}`}>
                      {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                    </span>
                    {product.category_name && (
                      <span className="badge bg-secondary ms-2">{product.category_name}</span>
                    )}
                  </div>

                  {product.wholesaler_name && (
                    <small className="text-muted mb-2">
                      By: {product.wholesaler_name}
                    </small>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto">
                    {(userRole === 'wholesaler' || userRole === 'admin') && (
                      <div className="d-flex gap-2 mb-2">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onEdit(product)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {userRole === 'admin' && product.status === 'pending' && (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusUpdate(product.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatusUpdate(product.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
