const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth'); // Assuming authentication middleware

// @route   GET /api/reports/events
// @desc    Generate event report
// @access  Private
router.get('/events', auth, reportController.generateEventReport);

module.exports = router;