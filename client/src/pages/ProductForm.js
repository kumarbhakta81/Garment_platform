import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct } from '../api/productApi';

const ProductForm = ({ selected, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    material: '',
    season: 'all-season',
    gender: '',
    base_price: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selected) {
      setFormData({
        name: selected.name || '',
        description: selected.description || '',
        category: selected.category || '',
        brand: selected.brand || '',
        material: selected.material || '',
        season: selected.season || 'all-season',
        gender: selected.gender || '',
        base_price: selected.base_price || '',
        images: selected.images || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        brand: '',
        material: '',
        season: 'all-season',
        gender: '',
        base_price: '',
        images: []
      });
    }
  }, [selected]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (selected) {
        response = await updateProduct(selected.id, formData);
      } else {
        response = await addProduct(formData);
      }

      if (response.success) {
        onSave();
        if (!selected) {
          // Reset form only for new products
          setFormData({
            name: '',
            description: '',
            category: '',
            brand: '',
            material: '',
            season: 'all-season',
            gender: '',
            base_price: '',
            images: []
          });
        }
      } else {
        setError(response.message || 'Failed to save product');
      }
    } catch (err) {
      setError('Error saving product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4>{selected ? 'Update Product' : 'Add New Product'}</h4>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Base Price *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="shirts">Shirts</option>
                <option value="pants">Pants</option>
                <option value="dresses">Dresses</option>
                <option value="jackets">Jackets</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Gender *</label>
              <select
                className="form-control"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Season</label>
              <select
                className="form-control"
                name="season"
                value={formData.season}
                onChange={handleChange}
              >
                <option value="all-season">All Season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Brand</label>
              <input
                type="text"
                className="form-control"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter brand name"
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Material</label>
              <input
                type="text"
                className="form-control"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g., Cotton, Polyester, Wool"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
            />
          </div>

          <div className="d-flex justify-content-end">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (selected ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProductForm;
