-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  garment_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (garment_id) REFERENCES garments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_item (user_id, garment_id)
);