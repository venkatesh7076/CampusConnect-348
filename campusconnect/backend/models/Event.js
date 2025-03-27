const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    building: {
      type: String,
      required: true,
      trim: true
    },
    room: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      min: 1
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Middleware to update the 'updatedAt' field on save
EventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate event duration in hours
EventSchema.virtual('durationHours').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffMs = end - start;
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
});

// Static method to update event statuses based on date
EventSchema.statics.updateEventStatuses = async function() {
  const now = new Date();
  
  // Update upcoming to ongoing
  await this.updateMany(
    { 
      status: 'upcoming',
      startDate: { $lte: now }
    },
    { 
      status: 'ongoing' 
    }
  );
  
  // Update ongoing to completed
  await this.updateMany(
    { 
      status: 'ongoing',
      endDate: { $lte: now }
    },
    { 
      status: 'completed' 
    }
  );
  
  return { success: true };
};

module.exports = mongoose.model('Event', EventSchema);