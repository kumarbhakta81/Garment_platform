import React, { useEffect, useState } from 'react';
import { getCategories } from '../api/categoryApi';

const Categories = ({ onEdit }) => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);
  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat._id}>
            {cat.name}
            <button onClick={() => onEdit(cat)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Categories;
