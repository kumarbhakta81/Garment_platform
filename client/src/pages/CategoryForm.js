import React, { useState, useEffect } from 'react';
import { addCategory, updateCategory } from '../api/categoryApi';

const CategoryForm = ({ selected, onSave }) => {
  const [name, setName] = useState('');
  useEffect(() => {
    setName(selected ? selected.name : '');
  }, [selected]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected) {
      await updateCategory(selected._id, { name });
    } else {
      await addCategory({ name });
    }
    onSave();
    setName('');
  };
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category Name"
        required
        style={{ marginRight: '1rem' }}
      />
      <button type="submit">{selected ? 'Update' : 'Add'} Category</button>
    </form>
  );
};
export default CategoryForm;
