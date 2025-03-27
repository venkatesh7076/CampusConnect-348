const mongoose = require('mongoose');

const EventOrganizerSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'co-host', 'helper'],
    default: 'helper'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only be an organizer once per event
EventOrganizerSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Middleware to update the 'updatedAt' field on save
EventOrganizerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get all organizers for an event
EventOrganizerSchema.statics.getEventOrganizers = async function(eventId) {
  return this.find({ eventId })
    .populate('userId', 'firstName lastName email role')
    .sort({ role: 1 });
};

// Static method to check if a user is an organizer for an event
EventOrganizerSchema.statics.isEventOrganizer = async function(eventId, userId) {
  const organizer = await this.findOne({ eventId, userId });
  return !!organizer;
};

module.exports = mongoose.model('EventOrganizer', EventOrganizerSchema);