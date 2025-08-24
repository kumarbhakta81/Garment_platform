-- Product variants table (sizes, colors, stock)
CREATE TABLE product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL') NOT NULL,
  color VARCHAR(50) NOT NULL,
  stock_quantity INT DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_variant (product_id, size, color),
  INDEX idx_product_size (product_id, size),
  INDEX idx_stock (stock_quantity),
  INDEX idx_sku (sku)
);