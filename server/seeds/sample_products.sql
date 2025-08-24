-- Sample products data
INSERT INTO products (name, description, category, brand, material, season, gender, base_price, images, slug) VALUES
('Classic White T-Shirt', 'Comfortable cotton t-shirt perfect for everyday wear', 'shirts', 'BasicWear', 'Cotton', 'all-season', 'unisex', 29.99, '["https://example.com/tshirt1.jpg"]', 'classic-white-t-shirt'),
('Blue Jeans', 'Stylish blue denim jeans with a modern fit', 'pants', 'DenimCo', 'Denim', 'all-season', 'unisex', 79.99, '["https://example.com/jeans1.jpg"]', 'blue-jeans'),
('Summer Dress', 'Light and airy summer dress perfect for warm weather', 'dresses', 'SummerStyle', 'Linen', 'summer', 'women', 89.99, '["https://example.com/dress1.jpg"]', 'summer-dress'),
('Leather Jacket', 'Premium leather jacket for style and warmth', 'jackets', 'LeatherLux', 'Leather', 'fall', 'unisex', 199.99, '["https://example.com/jacket1.jpg"]', 'leather-jacket'),
('Designer Handbag', 'Elegant handbag for all occasions', 'accessories', 'LuxBags', 'Leather', 'all-season', 'women', 149.99, '["https://example.com/bag1.jpg"]', 'designer-handbag');

-- Sample product variants
INSERT INTO product_variants (product_id, size, color, stock_quantity, price, sku) VALUES
-- T-Shirt variants
(1, 'S', 'White', 50, 29.99, 'TWS-WHT-S'),
(1, 'M', 'White', 75, 29.99, 'TWS-WHT-M'),
(1, 'L', 'White', 60, 29.99, 'TWS-WHT-L'),
(1, 'XL', 'White', 40, 29.99, 'TWS-WHT-XL'),

-- Jeans variants
(2, 'S', 'Blue', 30, 79.99, 'JNS-BLU-S'),
(2, 'M', 'Blue', 45, 79.99, 'JNS-BLU-M'),
(2, 'L', 'Blue', 35, 79.99, 'JNS-BLU-L'),
(2, 'XL', 'Blue', 25, 79.99, 'JNS-BLU-XL'),

-- Dress variants
(3, 'S', 'Yellow', 20, 89.99, 'DRS-YLW-S'),
(3, 'M', 'Yellow', 25, 89.99, 'DRS-YLW-M'),
(3, 'L', 'Yellow', 15, 89.99, 'DRS-YLW-L'),

-- Jacket variants
(4, 'M', 'Black', 10, 199.99, 'JKT-BLK-M'),
(4, 'L', 'Black', 8, 199.99, 'JKT-BLK-L'),
(4, 'XL', 'Black', 5, 199.99, 'JKT-BLK-XL'),

-- Handbag variants (one size)
(5, 'M', 'Brown', 12, 149.99, 'BAG-BRN-M'),
(5, 'M', 'Black', 15, 149.99, 'BAG-BLK-M');