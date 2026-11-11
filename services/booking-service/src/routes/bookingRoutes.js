const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyAuth, requireRole } = require('../middleware/verifyAuth');

// Health check
router.get('/health', bookingController.healthCheck);

// Protected routes (require user login)
router.get('/my', verifyAuth, bookingController.getMyBookings);
router.get('/stats', bookingController.getStats);
router.get('/', verifyAuth, bookingController.getAllBookings);
router.post('/', verifyAuth, bookingController.createBooking);
router.delete('/:id', verifyAuth, bookingController.cancelBooking);

module.exports = router;
