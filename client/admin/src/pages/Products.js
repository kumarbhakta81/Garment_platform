import React, { useEffect, useState } from 'react';
import { getProducts } from '../api/productApi';

const Products = ({ onEdit }) => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    getProducts().then(setProducts);
  }, []);
  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map(prod => (
          <li key={prod._id}>
            {prod.name} - ${prod.price}
            <button onClick={() => onEdit(prod)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Products;
