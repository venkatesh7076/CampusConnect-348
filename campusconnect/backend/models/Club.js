const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  departmentAffiliation: {
    type: String,
    required: true,
    trim: true
  },
  foundedYear: {
    type: Number,
    required: true
  },
  logo: {
    type: String,
    trim: true
  },
  socialMedia: {
    website: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },
  active: {
    type: Boolean,
    default: true
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
ClubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for club full name with department
ClubSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.departmentAffiliation})`;
});

module.exports = mongoose.model('Club', ClubSchema);