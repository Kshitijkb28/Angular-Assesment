const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation rules
const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isInt().withMessage('Valid category ID is required')
];

const updateValidation = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isInt().withMessage('Valid category ID is required')
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post('/', upload.single('image'), productValidation, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/report', productController.generateReport);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), updateValidation, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/bulk-upload', upload.single('file'), productController.bulkUpload);

module.exports = router;
