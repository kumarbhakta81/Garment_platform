import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct } from '../api/productApi';

const ProductForm = ({ selected, onSave }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    setName(selected ? selected.name : '');
    setPrice(selected ? selected.price : '');
    setDescription(selected ? selected.description : '');
  }, [selected]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = { name, price, description };
    if (selected) {
      await updateProduct(selected._id, product);
    } else {
      await addProduct(product);
    }
    onSave();
    setName('');
    setPrice('');
    setDescription('');
  };
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        required
        style={{ marginRight: '1rem' }}
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        type="number"
        required
        style={{ marginRight: '1rem' }}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={{ marginRight: '1rem' }}
      />
      <button type="submit">{selected ? 'Update' : 'Add'} Product</button>
    </form>
  );
};
export default ProductForm;
