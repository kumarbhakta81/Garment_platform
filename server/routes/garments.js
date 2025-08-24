const express = require('express');
const garmentController = require('../controllers/garmentController');
const authMiddleware = require('../middlewares/authenticateJWT');
const validation = require('../middlewares/validation');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', garmentController.getAllGarments);
router.get('/search', garmentController.searchGarments);
router.get('/:id', validation.idParam, garmentController.getGarmentById);

// Protected routes (authentication required)
router.post('/', authMiddleware, validation.createGarment, garmentController.createGarment);
router.put('/:id', authMiddleware, validation.idParam, validation.updateGarment, garmentController.updateGarment);
router.delete('/:id', authMiddleware, validation.idParam, garmentController.deleteGarment);

module.exports = router;