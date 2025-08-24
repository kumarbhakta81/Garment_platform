-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES garment_variants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, variant_id)
);