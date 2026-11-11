const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/health', authController.healthCheck);
router.post('/register', authController.register);
router.post('/login', authController.login);

// Inter-service endpoints
router.post('/verify', authController.verifyToken);
router.get('/verify', authController.verifyToken);
router.get('/users/:id', authController.getUserById);

// Protected endpoints
router.get('/profile', verifyAuth, authController.getProfile);
router.get('/users', verifyAuth, requireRole(['ADMIN', 'MANAGER']), authController.getAllUsers);

module.exports = router;
