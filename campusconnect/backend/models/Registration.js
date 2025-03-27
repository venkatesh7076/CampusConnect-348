const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
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
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'waitlisted', 'cancelled', 'attended'],
    default: 'registered'
  },
  checkinTime: {
    type: Date
  },
  checkoutTime: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'refunded', 'not applicable'],
    default: 'not applicable'
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

// Compound index to ensure a user can only register once for an event
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Middleware to update the 'updatedAt' field on save
RegistrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to check in a user to an event
RegistrationSchema.statics.checkInUser = async function(eventId, userId) {
  return this.findOneAndUpdate(
    { eventId, userId, status: 'registered' },
    { 
      status: 'attended',
      checkinTime: new Date() 
    },
    { new: true }
  );
};

// Static method to check out a user from an event
RegistrationSchema.statics.checkOutUser = async function(eventId, userId) {
  return this.findOneAndUpdate(
    { eventId, userId, status: 'attended' },
    { checkoutTime: new Date() },
    { new: true }
  );
};

// Static method to get registration counts for an event
RegistrationSchema.statics.getRegistrationCounts = async function(eventId) {
  return this.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Registration', RegistrationSchema);