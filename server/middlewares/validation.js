const { body, param } = require('express-validator');

const validationRules = {
  // Cart validation rules
  addToCart: [
    body('variant_id')
      .isInt({ min: 1 })
      .withMessage('Variant ID must be a positive integer'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Quantity must be between 1 and 50')
  ],

  updateCart: [
    body('variant_id')
      .isInt({ min: 1 })
      .withMessage('Variant ID must be a positive integer'),
    body('quantity')
      .isInt({ min: 1, max: 50 })
      .withMessage('Quantity must be between 1 and 50')
  ],

  // Wishlist validation rules
  addToWishlist: [
    body('garment_id')
      .isInt({ min: 1 })
      .withMessage('Garment ID must be a positive integer')
  ],

  moveToCart: [
    body('garment_id')
      .isInt({ min: 1 })
      .withMessage('Garment ID must be a positive integer'),
    body('variant_id')
      .isInt({ min: 1 })
      .withMessage('Variant ID must be a positive integer'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Quantity must be between 1 and 50')
  ],

  // Garment validation rules
  createGarment: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Name must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('category')
      .isIn(['shirts', 'pants', 'dresses', 'jackets', 'accessories'])
      .withMessage('Invalid category'),
    body('brand')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Brand must not exceed 100 characters'),
    body('material')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Material must not exceed 100 characters'),
    body('season')
      .optional()
      .isIn(['spring', 'summer', 'fall', 'winter', 'all-season'])
      .withMessage('Invalid season'),
    body('gender')
      .isIn(['men', 'women', 'unisex'])
      .withMessage('Invalid gender'),
    body('base_price')
      .isFloat({ min: 0 })
      .withMessage('Base price must be a positive number'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array')
  ],

  updateGarment: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Name must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('category')
      .optional()
      .isIn(['shirts', 'pants', 'dresses', 'jackets', 'accessories'])
      .withMessage('Invalid category'),
    body('brand')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Brand must not exceed 100 characters'),
    body('material')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Material must not exceed 100 characters'),
    body('season')
      .optional()
      .isIn(['spring', 'summer', 'fall', 'winter', 'all-season'])
      .withMessage('Invalid season'),
    body('gender')
      .optional()
      .isIn(['men', 'women', 'unisex'])
      .withMessage('Invalid gender'),
    body('base_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Base price must be a positive number'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active must be a boolean')
  ],

  // Parameter validation
  idParam: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer')
  ],

  variantIdParam: [
    param('variantId')
      .isInt({ min: 1 })
      .withMessage('Variant ID must be a positive integer')
  ],

  garmentIdParam: [
    param('garmentId')
      .isInt({ min: 1 })
      .withMessage('Garment ID must be a positive integer')
  ]
};

module.exports = validationRules;