const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Validation rules
const updateValidation = [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', updateValidation, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
