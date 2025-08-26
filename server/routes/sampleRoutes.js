const express = require('express');
const router = express.Router();
const {
  getSamples,
  createSample,
  updateSample,
  deleteSample,
  updateSampleStatus
} = require('../controllers/sampleController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { uploadSample, handleUploadError } = require('../middlewares/uploadMiddleware');
const { sampleValidationRules, statusValidationRules, handleValidationErrors } = require('../middlewares/validation');
const { uploadLimiter } = require('../middlewares/rateLimiting');

router.get('/', authenticateJWT, getSamples); // List samples with filtering
router.post('/', authenticateJWT, uploadLimiter, uploadSample, handleUploadError, sampleValidationRules(), handleValidationErrors, createSample); // Create sample with file
router.put('/:id', authenticateJWT, uploadLimiter, uploadSample, handleUploadError, sampleValidationRules(), handleValidationErrors, updateSample); // Update sample
router.delete('/:id', authenticateJWT, deleteSample); // Delete sample
router.patch('/:id/status', authenticateJWT, statusValidationRules(), handleValidationErrors, updateSampleStatus); // Approve/reject sample (admin)

module.exports = router;