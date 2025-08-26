# Comprehensive Admin Order Management System

A comprehensive garment platform with role-based admin order management system that allows wholesalers to upload products and samples while providing admins with instant notifications and comprehensive order management capabilities.

## 🚀 Features

### 👥 Role-Based Access Control
- **Admin**: Complete platform management and oversight
- **Wholesaler**: Product and sample upload, order management
- **Retailer**: Product browsing, order placement

### 📦 Product Management
- Upload products with images, descriptions, pricing, and inventory
- Edit and remove product listings
- Product approval workflow (pending → approved/rejected)
- Image upload with security validation
- Category-based organization
- Advanced filtering and search capabilities

### 🎯 Sample Management
- Upload sample files linked to products
- Sample approval workflow
- File upload security with type validation

### 🛒 Order Management
- Complete order lifecycle tracking
- Status updates (pending → confirmed → processing → shipped → delivered)
- Role-based order permissions
- Order analytics and reporting
- Automated inventory management

### 🔔 Real-Time Notifications
- Instant admin notifications for product/sample uploads
- Order status update notifications
- Real-time polling system
- Notification categorization and filtering

### 📊 Analytics Dashboard
- Order analytics and metrics
- Product performance tracking
- Revenue and inventory insights
- Role-specific analytics views

### 🔒 Security Features
- Input validation and sanitization
- File upload security (type validation, size limits)
- Rate limiting for API endpoints
- Security headers with Helmet.js
- Authentication and authorization middleware
- Error handling with proper logging

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with connection pooling
- **JWT** authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet.js** for security headers
- **Express Rate Limit** for API protection

### Frontend
- **React** with functional components and hooks
- **Bootstrap** for responsive UI
- **Axios** for API communication
- Role-based routing and components

## 📁 Project Structure

```
├── server/                 # Backend API
│   ├── controllers/        # Business logic
│   ├── middlewares/        # Security and validation
│   ├── routes/            # API endpoints
│   ├── migrations/        # Database schema
│   ├── models/            # Data models
│   └── uploads/           # File storage
├── client/                # Frontend React app
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── contexts/      # React contexts
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kumarbhakta81/Garment_platform.git
   cd Garment_platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   cd server
   npm run migrate
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 👤 Demo Credentials

The system supports role-based authentication. Use these demo credentials:

- **Admin**: admin@example.com
- **Wholesaler**: wholesaler@example.com  
- **Retailer**: retailer@example.com
- **Password**: Any password (for demo purposes)

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - List products (with filters)
- `POST /api/products` - Create product (with images)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/status` - Approve/reject product

### Orders
- `GET /api/orders` - List orders (role-based)
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/analytics` - Order analytics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Samples
- `GET /api/samples` - List samples
- `POST /api/samples` - Upload sample
- `PATCH /api/samples/:id/status` - Approve/reject sample

## 🔒 Security Implementation

### Input Validation
- All user inputs are validated and sanitized
- Express Validator middleware for comprehensive validation
- SQL injection prevention
- XSS protection through input escaping

### File Upload Security
- File type validation (MIME type + extension)
- File size limits (10MB per file)
- Secure filename generation
- Path traversal prevention
- Virus scanning ready architecture

### API Security
- Rate limiting by endpoint type
- JWT token authentication
- Role-based authorization
- Security headers with Helmet.js
- CORS configuration

### Error Handling
- Comprehensive error logging
- Sanitized error responses
- Development vs production error details
- Graceful failure handling

## 📊 Database Schema

### Users Table
- id, username, email, password, role
- Sessions for JWT management

### Products Table
- Enhanced with wholesaler_id, images, quantity, status
- Foreign key relationships

### Orders Table
- Complete order lifecycle tracking
- Retailer, wholesaler, and product relationships

### Notifications Table
- Real-time notification system
- Categorized by type and read status

### Samples Table
- Linked to products
- File storage and approval workflow

## 🎨 UI Features

### Role-Based Dashboards
- **Admin**: Complete oversight with notifications, user management, and system analytics
- **Wholesaler**: Product upload, order management, and business analytics
- **Retailer**: Product browsing, order placement, and order tracking

### Responsive Design
- Bootstrap-based responsive UI
- Mobile-friendly interface
- Intuitive navigation

### Real-Time Updates
- Notification polling every 30 seconds
- Instant status updates
- Live order tracking

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test              # Run tests
npm run lint          # Linting
npm run test:coverage # Coverage report
```

### Frontend Testing
```bash
cd client
npm test              # React tests
npm run lint          # ESLint
npm run build         # Production build
```

## 🚀 Deployment

### Production Environment Variables
```bash
NODE_ENV=production
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-secure-jwt-secret
UPLOAD_LIMIT=10MB
CORS_ORIGIN=https://your-domain.com
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## 📈 Performance Optimizations

- Database query optimization with indexes
- Image optimization and compression
- API response caching strategies
- Lazy loading for large datasets
- Connection pooling for database

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Automated testing on pull requests
- Code quality checks
- Security scanning
- Deployment automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For issues and questions:
- Create a GitHub issue
- Review the documentation
- Check the troubleshooting guide

---

Built with ❤️ for modern e-commerce platforms