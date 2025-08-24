-- Products table (modernized from garments)
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category ENUM('shirts', 'pants', 'dresses', 'jackets', 'accessories') NOT NULL,
  brand VARCHAR(100),
  material VARCHAR(100),
  season ENUM('spring', 'summer', 'fall', 'winter', 'all-season') DEFAULT 'all-season',
  gender ENUM('men', 'women', 'unisex') NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  images JSON,
  is_active BOOLEAN DEFAULT TRUE,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_brand (brand),
  INDEX idx_gender (gender),
  INDEX idx_active (is_active),
  INDEX idx_slug (slug)
);