const { body, validationResult } = require('express-validator');

// Validation rules for product creation/update
const productValidationRules = () => {
  return [
    body('name')
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Product name must be between 2 and 255 characters')
      .escape(),
    body('price')
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters')
      .escape(),
    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    body('category_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer')
  ];
};

// Validation rules for sample creation/update
const sampleValidationRules = () => {
  return [
    body('product_id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('title')
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Sample title must be between 2 and 255 characters')
      .escape(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters')
      .escape()
  ];
};

// Validation rules for order creation
const orderValidationRules = () => {
  return [
    body('product_id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('shipping_address')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Shipping address must be between 10 and 500 characters')
      .escape(),
    body('order_notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Order notes must not exceed 1000 characters')
      .escape()
  ];
};

// Validation rules for user registration
const userValidationRules = () => {
  return [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
      .escape(),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['admin', 'wholesaler', 'retailer'])
      .withMessage('Role must be admin, wholesaler, or retailer')
  ];
};

// Validation rules for status updates
const statusValidationRules = () => {
  return [
    body('status')
      .isIn(['pending', 'approved', 'rejected', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status value')
  ];
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  productValidationRules,
  sampleValidationRules,
  orderValidationRules,
  userValidationRules,
  statusValidationRules,
  handleValidationErrors
};