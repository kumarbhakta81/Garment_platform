const Garment = require('../models/Garment');
const { validationResult } = require('express-validator');

const garmentController = {
  // Get all garments with filtering
  getAllGarments: async (req, res, next) => {
    try {
      const filters = {
        category: req.query.category,
        brand: req.query.brand,
        gender: req.query.gender,
        season: req.query.season,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const garments = await Garment.getAll(filters);
      
      res.json({
        message: 'Garments retrieved successfully',
        data: garments,
        filters: filters
      });
    } catch (error) {
      next(error);
    }
  },

  // Get garment details with variants
  getGarmentById: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          message: 'Invalid garment ID' 
        });
      }

      const garment = await Garment.findByIdWithVariants(parseInt(id));
      
      if (!garment) {
        return res.status(404).json({ 
          message: 'Garment not found' 
        });
      }

      res.json({
        message: 'Garment retrieved successfully',
        data: garment
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new garment (admin only)
  createGarment: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Access denied. Admin role required.' 
        });
      }

      const garment = await Garment.create(req.body);
      
      res.status(201).json({
        message: 'Garment created successfully',
        data: garment
      });
    } catch (error) {
      next(error);
    }
  },

  // Update garment (admin only)
  updateGarment: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { id } = req.params;

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Access denied. Admin role required.' 
        });
      }

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          message: 'Invalid garment ID' 
        });
      }

      const garment = await Garment.update(parseInt(id), req.body);
      
      if (!garment) {
        return res.status(404).json({ 
          message: 'Garment not found' 
        });
      }

      res.json({
        message: 'Garment updated successfully',
        data: garment
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete garment (admin only) - soft delete
  deleteGarment: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Access denied. Admin role required.' 
        });
      }

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          message: 'Invalid garment ID' 
        });
      }

      const success = await Garment.delete(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ 
          message: 'Garment not found' 
        });
      }

      res.json({
        message: 'Garment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Search garments
  searchGarments: async (req, res, next) => {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        return res.status(400).json({ 
          message: 'Search term is required' 
        });
      }

      const garments = await Garment.search(searchTerm);
      
      res.json({
        message: 'Search completed successfully',
        data: garments,
        searchTerm: searchTerm
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = garmentController;