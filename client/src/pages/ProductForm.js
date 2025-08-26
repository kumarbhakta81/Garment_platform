import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct } from '../api/productApi';
import { getCategories } from '../api/categoryApi';

const ProductForm = ({ selected, onSave }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selected) {
      setName(selected.name || '');
      setPrice(selected.price || '');
      setDescription(selected.description || '');
      setQuantity(selected.quantity || '');
      setCategoryId(selected.category_id || '');
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setQuantity('');
      setCategoryId('');
      setImages([]);
    }
  }, [selected]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('quantity', quantity);
      if (categoryId) formData.append('category_id', categoryId);
      
      // Add images
      images.forEach((image) => {
        formData.append('images', image);
      });

      if (selected) {
        await updateProduct(selected.id, formData);
        setMessage('Product updated successfully!');
      } else {
        await addProduct(formData);
        setMessage('Product created successfully!');
      }
      
      onSave();
      
      // Reset form if creating new product
      if (!selected) {
        setName('');
        setPrice('');
        setDescription('');
        setQuantity('');
        setCategoryId('');
        setImages([]);
        // Reset file input
        const fileInput = document.getElementById('product-images');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving product:', error);
      setMessage('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">{selected ? 'Edit Product' : 'Add New Product'}</h5>
        
        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="product-name" className="form-label">Product Name *</label>
                <input
                  id="product-name"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="product-price" className="form-label">Price *</label>
                <input
                  id="product-price"
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="Enter price"
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="product-quantity" className="form-label">Quantity</label>
                <input
                  id="product-quantity"
                  type="number"
                  className="form-control"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="product-category" className="form-label">Category</label>
                <select
                  id="product-category"
                  className="form-select"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="product-description" className="form-label">Description</label>
            <textarea
              id="product-description"
              className="form-control"
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product-images" className="form-label">Product Images</label>
            <input
              id="product-images"
              type="file"
              className="form-control"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="form-text">You can select multiple images (Max 5 files, 10MB each)</div>
          </div>

          {selected && selected.images && selected.images.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Current Images</label>
              <div className="row">
                {selected.images.map((image, index) => (
                  <div key={index} className="col-md-3 mb-2">
                    <img 
                      src={`http://localhost:5001${image}`} 
                      alt={`Product ${index + 1}`}
                      className="img-thumbnail"
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {selected ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              selected ? 'Update Product' : 'Add Product'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
