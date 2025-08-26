const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File type checking
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_SAMPLE_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf', 'text/plain'];

// Generate secure filename
const generateSecureFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, file.fieldname === 'sample' ? 'samples' : 'products');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate secure filename to prevent path traversal attacks
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

// Enhanced file filter for security
const fileFilter = (req, file, cb) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension. Only images, PDF, and text files are allowed.'), false);
  }

  // Check MIME type
  if (file.fieldname === 'images') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  } else if (file.fieldname === 'sample') {
    if (!ALLOWED_SAMPLE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only images, PDF, and text files are allowed for samples.'), false);
    }
  } else {
    return cb(new Error('Unexpected field name'), false);
  }

  // Additional security: check for null bytes in filename (path traversal prevention)
  if (file.originalname.includes('\0')) {
    return cb(new Error('Invalid filename'), false);
  }

  cb(null, true);
};

// Configure multer with enhanced security
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_LIMIT) || 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100, // 100 bytes field name limit
    fields: 10, // Maximum 10 non-file fields
    parts: 20 // Maximum 20 parts (files + fields)
  }
});

// Enhanced middleware for handling upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 10MB per file.',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          message: 'Too many files. Maximum 5 files allowed.',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({ 
          message: 'Too many fields in form.',
          code: 'TOO_MANY_FIELDS'
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({ 
          message: 'Field name too long.',
          code: 'FIELD_NAME_TOO_LONG'
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({ 
          message: 'Field value too long.',
          code: 'FIELD_VALUE_TOO_LONG'
        });
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({ 
          message: 'Too many parts in multipart form.',
          code: 'TOO_MANY_PARTS'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          message: 'Unexpected file field.',
          code: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({ 
          message: 'File upload error: ' + err.message,
          code: 'UPLOAD_ERROR'
        });
    }
  }
  
  if (err) {
    return res.status(400).json({ 
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// Middleware to validate uploaded files after upload
const validateUploadedFiles = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      // Additional validation can be added here
      // e.g., virus scanning, image dimension validation, etc.
      
      // Check if file was properly uploaded
      if (!fs.existsSync(file.path)) {
        return res.status(500).json({ 
          message: 'File upload failed',
          code: 'UPLOAD_FAILED'
        });
      }
    }
  }
  
  if (req.file) {
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({ 
        message: 'File upload failed',
        code: 'UPLOAD_FAILED'
      });
    }
  }
  
  next();
};

module.exports = {
  uploadProductImages: [upload.array('images', 5), validateUploadedFiles],
  uploadSample: [upload.single('sample'), validateUploadedFiles],
  handleUploadError
};