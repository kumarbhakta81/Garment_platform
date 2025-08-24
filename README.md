# Product Platform API Documentation

A modern e-commerce platform for fashion products with comprehensive API endpoints for products, cart, wishlist, and user management.

## Overview

This platform has been modernized from the previous "Garment Platform" to use industry-standard naming conventions and modern e-commerce features.

## API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login with JWT |
| GET | `/api/auth/profile` | Get current user profile |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh-token` | Refresh JWT token |

### Product APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products with filtering |
| GET | `/api/products/:id` | Get product details with variants |
| GET | `/api/products/:id/variants` | Get product variants (sizes/colors) |
| GET | `/api/products/search` | Search products |
| GET | `/api/products/categories` | Get all categories |
| GET | `/api/products/brands` | Get all brands |

### Cart APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/items` | Add product variant to cart |
| PUT | `/api/cart/items/:itemId` | Update cart item quantity |
| DELETE | `/api/cart/items/:itemId` | **Remove specific cart item** |
| DELETE | `/api/cart` | Clear entire cart |
| GET | `/api/cart/summary` | Get cart summary and totals |
| POST | `/api/cart/move-to-wishlist/:itemId` | Move cart item to wishlist |

### Wishlist APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist/items` | Add product to wishlist |
| DELETE | `/api/wishlist/items/:productId` | Remove product from wishlist |
| DELETE | `/api/wishlist` | Clear entire wishlist |
| POST | `/api/wishlist/move-to-cart/:productId` | Move wishlist item to cart |
| GET | `/api/wishlist/count` | Get wishlist item count |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/products` | Create new product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |

## Database Schema

### Products Table
```sql
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Product Variants Table
```sql
CREATE TABLE product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL') NOT NULL,
  color VARCHAR(50) NOT NULL,
  stock_quantity INT DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### Cart Table
```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);
```

### Wishlist Table
```sql
CREATE TABLE wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  },
  "message": "Products retrieved successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Product not found",
  "error": "PRODUCT_NOT_FOUND"
}
```

## Key Features

### 🛒 Shopping Cart
- Add products to cart by variant (size/color)
- Update quantities
- **Remove specific items** (Challenge Solution)
- Move items to wishlist
- Cart validation and stock checking

### ❤️ Wishlist
- Save products for later
- Move items to cart
- Get personalized recommendations
- Track wishlist count

### 🎯 Product Management
- Rich product filtering (category, brand, gender, season)
- Search functionality
- Product variants with stock management
- Image support
- SEO-friendly slugs

### 🔐 Authentication
- JWT-based authentication
- Session management
- Token refresh capability
- User profile management

### 📱 Modern Features
- Responsive design
- Real-time stock validation
- Pagination support
- RESTful API design
- Comprehensive error handling

## Getting Started

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Database Setup
```bash
cd server
node scripts/migrate.js
```

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5002
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=authdb
JWT_SECRET=supersecretkey123
```

## Modern Naming Conventions

This platform has been updated from "Garment Platform" to use modern e-commerce terminology:

- **Products** instead of "Garments"
- **Product Variants** for sizes and colors
- **Shopping Cart** with full CRUD operations
- **Wishlist** functionality
- **User-friendly** API endpoints
- **Modern UI** terminology

The API is designed to be frontend-friendly and follows REST conventions with proper HTTP status codes and standardized JSON responses.