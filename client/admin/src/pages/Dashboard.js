import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryForm from './CategoryForm';
import Categories from './Categories';
import ProductForm from './ProductForm';
import Products from './Products';
import UserManagement from './UserManagement';

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [tab, setTab] = useState('products');

  const handleCategorySave = () => {
    setSelectedCategory(null);
    setRefresh(!refresh);
  };
  const handleProductSave = () => {
    setSelectedProduct(null);
    setRefresh(!refresh);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-fill container py-4 bg-light">
        <div className="mb-3">
          <button className={`btn btn-outline-primary me-2 ${tab==='products'&&'active'}`} onClick={()=>setTab('products')}>Products</button>
          <button className={`btn btn-outline-primary me-2 ${tab==='categories'&&'active'}`} onClick={()=>setTab('categories')}>Categories</button>
          <button className={`btn btn-outline-primary ${tab==='users'&&'active'}`} onClick={()=>setTab('users')}>Users</button>
        </div>
        {tab==='products' && (
          <div className="row">
            <section className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-3">Product Management</h2>
                  <ProductForm selected={selectedProduct} onSave={handleProductSave} />
                  <Products onEdit={setSelectedProduct} key={refresh} />
                </div>
              </div>
            </section>
          </div>
        )}
        {tab==='categories' && (
          <div className="row">
            <section className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-3">Category Management</h2>
                  <CategoryForm selected={selectedCategory} onSave={handleCategorySave} />
                  <Categories onEdit={setSelectedCategory} key={refresh} />
                </div>
              </div>
            </section>
          </div>
        )}
        {tab==='users' && <UserManagement />}
      </main>
      <Footer />
    </div>
  );
};
export default Dashboard;
