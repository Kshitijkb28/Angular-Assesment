const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

// Validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required')
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post('/', categoryValidation, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryValidation, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
