const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth'); // Assuming authentication middleware

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', eventController.getAllEvents);

// @route   GET /api/events/form-data
// @desc    Get data needed for event form dropdowns
// @access  Private
router.get('/form-data', auth, eventController.getEventFormData);

// @route   GET /api/events/search
// @desc    Search events with filters
// @access  Public
router.get('/search', eventController.searchEvents);

// @route   GET /api/events/:id
// @desc    Get a single event by ID
// @access  Public
router.get('/:id', eventController.getEventById);

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', auth, eventController.createEvent);

// @route   PUT /api/events/:id
// @desc    Update an existing event
// @access  Private
router.put('/:id', auth, eventController.updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, eventController.deleteEvent);

// @route   PUT /api/events/:id/organizers
// @desc    Manage event organizers
// @access  Private
router.put('/:id/organizers', auth, eventController.manageEventOrganizers);

module.exports = router;