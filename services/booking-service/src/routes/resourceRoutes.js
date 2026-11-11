const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyAuth, requireRole } = require('../middleware/verifyAuth');

// Public or semi-public resource catalog
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.get('/:id/availability', resourceController.checkAvailability);

// Admin / Manager endpoints to manage facilities
router.post('/', verifyAuth, requireRole(['ADMIN', 'MANAGER']), resourceController.createResource);

module.exports = router;
