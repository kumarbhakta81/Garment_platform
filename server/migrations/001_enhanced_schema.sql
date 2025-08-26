-- Enhanced schema for comprehensive admin order management system

-- Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin', 'wholesaler', 'retailer') DEFAULT 'retailer';

-- Update existing users to have roles (make first user admin, others wholesalers for demo)
UPDATE users SET role = 'admin' WHERE id = 1;
UPDATE users SET role = 'wholesaler' WHERE id > 1;

-- Enhance products table with additional fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesaler_id INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT; -- JSON array of image URLs
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add foreign key constraints
ALTER TABLE products ADD CONSTRAINT fk_products_wholesaler FOREIGN KEY (wholesaler_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Create samples table
CREATE TABLE IF NOT EXISTS samples (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sample_file_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  retailer_id INT NOT NULL,
  wholesaler_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  order_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (retailer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wholesaler_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('product_upload', 'sample_upload', 'order_placed', 'order_updated', 'product_approved', 'product_rejected') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id INT, -- ID of related product/order/sample
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_products_wholesaler ON products(wholesaler_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_retailer ON orders(retailer_id);
CREATE INDEX idx_orders_wholesaler ON orders(wholesaler_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);