const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  departmentAffiliation: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Club', ClubSchema);