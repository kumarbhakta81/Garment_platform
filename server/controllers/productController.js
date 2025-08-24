const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

// Standardized response helper
const sendResponse = (res, success, data = null, message = '', statusCode = 200) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Get all products with filtering, search, and pagination
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      gender,
      search,
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const filters = {
      category,
      brand,
      gender,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const products = await Product.findAll(filters);
    
    // Get total count for pagination
    const totalQuery = await Product.findAll({ ...filters, limit: null, offset: null });
    const total = totalQuery.length;
    const pages = Math.ceil(total / limit);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages
    };

    sendResponse(res, true, { products, pagination }, 'Products retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Get single product with variants
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return sendResponse(res, false, null, 'Product not found', 404);
    }

    sendResponse(res, true, { product }, 'Product retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Get product variants
exports.getProductVariants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variants = await ProductVariant.findByProductId(id);
    
    sendResponse(res, true, { variants }, 'Product variants retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Search products
exports.searchProducts = async (req, res, next) => {
  try {
    const { q: search, category, brand, gender, page = 1, limit = 20 } = req.query;
    
    if (!search || search.trim().length < 2) {
      return sendResponse(res, false, null, 'Search query must be at least 2 characters', 400);
    }

    const offset = (page - 1) * limit;
    const filters = {
      search: search.trim(),
      category,
      brand,
      gender,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const products = await Product.findAll(filters);
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: products.length,
      pages: Math.ceil(products.length / limit)
    };

    sendResponse(res, true, { products, pagination }, `Found ${products.length} products`);
  } catch (err) {
    next(err);
  }
};

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.getCategories();
    sendResponse(res, true, { categories }, 'Categories retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Get all brands
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.getBrands();
    sendResponse(res, true, { brands }, 'Brands retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Admin: Create a product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, category, brand, material, season, gender, base_price, images } = req.body;
    
    if (!name || !category || !gender || !base_price) {
      return sendResponse(res, false, null, 'Name, category, gender, and base_price are required', 400);
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const productData = {
      name,
      description,
      category,
      brand,
      material,
      season: season || 'all-season',
      gender,
      base_price: parseFloat(base_price),
      images: images || [],
      slug: slug + '-' + Date.now() // Ensure uniqueness
    };

    const product = await Product.create(productData);
    sendResponse(res, true, { product }, 'Product created successfully', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return sendResponse(res, false, null, 'Product with this slug already exists', 409);
    }
    next(err);
  }
};

// Admin: Update a product
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, brand, material, season, gender, base_price, images, is_active } = req.body;
    
    if (!name || !category || !gender || !base_price) {
      return sendResponse(res, false, null, 'Name, category, gender, and base_price are required', 400);
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return sendResponse(res, false, null, 'Product not found', 404);
    }

    const productData = {
      name,
      description,
      category,
      brand,
      material,
      season,
      gender,
      base_price: parseFloat(base_price),
      images,
      is_active
    };

    const product = await Product.update(id, productData);
    sendResponse(res, true, { product }, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

// Admin: Delete a product (soft delete)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return sendResponse(res, false, null, 'Product not found', 404);
    }

    await Product.delete(id);
    sendResponse(res, true, null, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};
