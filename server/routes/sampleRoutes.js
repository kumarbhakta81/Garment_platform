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

router.get('/', authenticateJWT, getSamples); // List samples with filtering
router.post('/', authenticateJWT, uploadSample, handleUploadError, createSample); // Create sample with file
router.put('/:id', authenticateJWT, uploadSample, handleUploadError, updateSample); // Update sample
router.delete('/:id', authenticateJWT, deleteSample); // Delete sample
router.patch('/:id/status', authenticateJWT, updateSampleStatus); // Approve/reject sample (admin)

module.exports = router;