-- Create garments table
CREATE TABLE IF NOT EXISTS garments (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create garment variants table
CREATE TABLE IF NOT EXISTS garment_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  garment_id INT NOT NULL,
  size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL') NOT NULL,
  color VARCHAR(50) NOT NULL,
  stock_quantity INT DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (garment_id) REFERENCES garments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_variant (garment_id, size, color)
);