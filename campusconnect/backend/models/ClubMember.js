const mongoose = require('mongoose');

const ClubMemberSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['president', 'vicePresident', 'treasurer', 'secretary', 'member'],
    default: 'member'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
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

// Compound index to ensure a user can only be a member of a club once
ClubMemberSchema.index({ clubId: 1, userId: 1 }, { unique: true });

// Middleware to update the 'updatedAt' field on save
ClubMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find club officers for a specific club
ClubMemberSchema.statics.findClubOfficers = async function(clubId) {
  return this.find({
    clubId,
    role: { $in: ['president', 'vicePresident', 'treasurer', 'secretary'] }
  }).populate('userId', 'firstName lastName email');
};

// Static method to check if a user is an officer of a club
ClubMemberSchema.statics.isClubOfficer = async function(clubId, userId) {
  const member = await this.findOne({
    clubId,
    userId,
    role: { $in: ['president', 'vicePresident', 'treasurer', 'secretary'] },
    status: 'active'
  });
  
  return !!member;
};

module.exports = mongoose.model('ClubMember', ClubMemberSchema);