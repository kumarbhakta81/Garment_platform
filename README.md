# Garment Platform Backend

A comprehensive backend API for a garment e-commerce platform built with Express.js and MySQL, featuring cart management, wishlist functionality, and complete garment inventory management.

## Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role management
- **Garment Management** - Complete CRUD operations with variant support
- **Cart System** - Add, update, remove items with stock validation
- **Wishlist System** - Save items for later, move to cart functionality
- **Inventory Management** - Size/color variants with stock tracking
- **Search & Filtering** - Advanced product search and filtering options

### Security Features
- Helmet.js security headers
- Rate limiting for API protection
- Input validation with express-validator
- Password hashing with bcrypt
- CORS configuration
- Comprehensive error handling

### Technical Features
- MySQL database with connection pooling
- Database migrations for easy setup
- Winston logging system
- Comprehensive API documentation
- Jest testing framework
- Environment-based configuration

## Database Schema

### Core Tables
- **users** - User accounts with role management
- **garments** - Product catalog with categories
- **garment_variants** - Size/color variants with pricing
- **cart** - Shopping cart items
- **wishlist** - Saved items for later

## API Endpoints

### Authentication
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/auth/me - Get current user profile
POST /api/auth/logout - User logout
```

### Garments
```
GET /api/garments - Get all garments with filtering
GET /api/garments/search - Search garments
GET /api/garments/:id - Get garment with variants
POST /api/garments - Create garment (admin only)
PUT /api/garments/:id - Update garment (admin only)
DELETE /api/garments/:id - Delete garment (admin only)
```

### Cart Management
```
POST /api/cart/add - Add item to cart
PUT /api/cart/update - Update cart item quantity
GET /api/cart - Get user's cart
DELETE /api/cart/remove/:variantId - Remove specific item
DELETE /api/cart/clear - Clear entire cart
GET /api/cart/total - Get cart summary
```

### Wishlist Management
```
POST /api/wishlist/add - Add item to wishlist
DELETE /api/wishlist/remove/:garmentId - Remove from wishlist
GET /api/wishlist - Get user's wishlist
DELETE /api/wishlist/clear - Clear wishlist
POST /api/wishlist/move-to-cart - Move item to cart
GET /api/wishlist/check/:garmentId - Check if item in wishlist
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd garment_platform/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. **Database Setup**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE garment_platform;"

# Run migrations
mysql -u root -p garment_platform < migrations/001_create_users.sql
mysql -u root -p garment_platform < migrations/002_create_garments.sql
mysql -u root -p garment_platform < migrations/003_create_carts.sql
mysql -u root -p garment_platform < migrations/004_create_wishlists.sql
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## API Usage Examples

### Authentication
```javascript
// Register user
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();
```

### Cart Operations
```javascript
// Add to cart
await fetch('/api/cart/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    variant_id: 1,
    quantity: 2
  })
});

// Get cart
const cartResponse = await fetch('/api/cart', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const cart = await cartResponse.json();
```

### Wishlist Operations
```javascript
// Add to wishlist
await fetch('/api/wishlist/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    garment_id: 1
  })
});

// Move to cart
await fetch('/api/wishlist/move-to-cart', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    garment_id: 1,
    variant_id: 1,
    quantity: 1
  })
});
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` - Database configuration
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5002)
- `NODE_ENV` - Environment (development/production)

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Protection**: Parameterized queries prevent SQL injection
- **XSS Protection**: Helmet.js provides security headers
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.