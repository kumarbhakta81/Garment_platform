-- Initial database setup for Garment Platform
-- This script creates the necessary tables and initial data

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions table for JWT session management
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category_id INT,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_status (status)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, role) VALUES 
    ('admin', 'admin@garmentplatform.com', '$2b$10$rQJ8kJWfZhGZ9ZhGZ9ZhGOe.GGHGm/ZhGZ9ZhGZ9ZhGZ9ZhGZ9ZhG.', 'admin');

-- Insert default categories
INSERT IGNORE INTO categories (name, description) VALUES 
    ('Shirts', 'Various types of shirts and tops'),
    ('Pants', 'Trousers, jeans, and bottom wear'),
    ('Accessories', 'Belts, bags, and other accessories'),
    ('Dresses', 'Formal and casual dresses'),
    ('Outerwear', 'Jackets, coats, and sweaters');

-- Insert sample products
INSERT IGNORE INTO products (name, price, description, category_id, stock_quantity) VALUES 
    ('Cotton T-Shirt', 19.99, 'Comfortable cotton t-shirt for everyday wear', 1, 50),
    ('Denim Jeans', 59.99, 'Classic blue denim jeans with modern fit', 2, 30),
    ('Leather Belt', 29.99, 'Genuine leather belt with metal buckle', 3, 25),
    ('Summer Dress', 79.99, 'Light and airy summer dress perfect for warm weather', 4, 20),
    ('Wool Sweater', 89.99, 'Warm wool sweater for cold weather', 5, 15);