import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryForm from './CategoryForm';
import Categories from './Categories';
import ProductForm from './ProductForm';
import Products from './Products';
import UserManagement from './UserManagement';
import NotificationPanel from '../components/NotificationPanel';
import OrderManagement from '../components/OrderManagement';

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [tab, setTab] = useState('products');
  
  // Get user role from localStorage (in real app, this would come from context/auth)
  const userRole = localStorage.getItem('userRole') || 'retailer';

  const handleCategorySave = () => {
    setSelectedCategory(null);
    setRefresh(!refresh);
  };
  
  const handleProductSave = () => {
    setSelectedProduct(null);
    setRefresh(!refresh);
  };

  const renderAdminTabs = () => (
    <>
      <button className={`btn btn-outline-primary me-2 ${tab==='products'&&'active'}`} onClick={()=>setTab('products')}>Products</button>
      <button className={`btn btn-outline-primary me-2 ${tab==='orders'&&'active'}`} onClick={()=>setTab('orders')}>Orders</button>
      <button className={`btn btn-outline-primary me-2 ${tab==='notifications'&&'active'}`} onClick={()=>setTab('notifications')}>Notifications</button>
      <button className={`btn btn-outline-primary me-2 ${tab==='categories'&&'active'}`} onClick={()=>setTab('categories')}>Categories</button>
      <button className={`btn btn-outline-primary ${tab==='users'&&'active'}`} onClick={()=>setTab('users')}>Users</button>
    </>
  );

  const renderWholesalerTabs = () => (
    <>
      <button className={`btn btn-outline-primary me-2 ${tab==='products'&&'active'}`} onClick={()=>setTab('products')}>My Products</button>
      <button className={`btn btn-outline-primary me-2 ${tab==='orders'&&'active'}`} onClick={()=>setTab('orders')}>Orders</button>
      <button className={`btn btn-outline-primary me-2 ${tab==='notifications'&&'active'}`} onClick={()=>setTab('notifications')}>Notifications</button>
      <button className={`btn btn-outline-primary ${tab==='analytics'&&'active'}`} onClick={()=>setTab('analytics')}>Analytics</button>
    </>
  );

  const renderRetailerTabs = () => (
    <>
      <button className={`btn btn-outline-primary me-2 ${tab==='products'&&'active'}`} onClick={()=>setTab('products')}>Browse Products</button>
      <button className={`btn btn-outline-primary me-2 ${tab==='orders'&&'active'}`} onClick={()=>setTab('orders')}>My Orders</button>
      <button className={`btn btn-outline-primary ${tab==='notifications'&&'active'}`} onClick={()=>setTab('notifications')}>Notifications</button>
    </>
  );

  const renderTabs = () => {
    switch (userRole) {
      case 'admin': return renderAdminTabs();
      case 'wholesaler': return renderWholesalerTabs();
      case 'retailer': return renderRetailerTabs();
      default: return renderRetailerTabs();
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-fill container py-4 bg-light">
        {/* Role-based welcome message */}
        <div className="mb-3">
          <h2>
            {userRole === 'admin' && 'Admin Dashboard'}
            {userRole === 'wholesaler' && 'Wholesaler Dashboard'}
            {userRole === 'retailer' && 'Retailer Dashboard'}
          </h2>
          <p className="text-muted">
            Welcome to your {userRole} dashboard. {userRole === 'admin' && 'Manage all platform activities from here.'}
            {userRole === 'wholesaler' && 'Upload products and manage your orders.'}
            {userRole === 'retailer' && 'Browse products and manage your orders.'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-3">
          {renderTabs()}
        </div>

        {/* Tab Content */}
        {tab === 'products' && (
          <div className="row">
            <section className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-3">
                    {userRole === 'wholesaler' ? 'Product Management' : 
                     userRole === 'admin' ? 'All Products' : 'Browse Products'}
                  </h2>
                  
                  {/* Show product form only for wholesalers and admins */}
                  {(userRole === 'wholesaler' || userRole === 'admin') && (
                    <ProductForm selected={selectedProduct} onSave={handleProductSave} />
                  )}
                  
                  <Products 
                    onEdit={setSelectedProduct} 
                    userRole={userRole}
                    key={refresh} 
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'orders' && (
          <div className="row">
            <section className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-3">Order Management</h2>
                  <OrderManagement userRole={userRole} />
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="row">
            <section className="col-md-12 mb-4">
              <NotificationPanel userRole={userRole} />
            </section>
          </div>
        )}

        {tab === 'categories' && userRole === 'admin' && (
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

        {tab === 'users' && userRole === 'admin' && (
          <UserManagement />
        )}

        {tab === 'analytics' && userRole === 'wholesaler' && (
          <div className="row">
            <section className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-3">Analytics Dashboard</h2>
                  <p className="text-muted">View your product and sales analytics here.</p>
                  {/* Analytics component would go here */}
                  <div className="alert alert-info">
                    Analytics dashboard coming soon! Track your product performance, sales trends, and customer insights.
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
