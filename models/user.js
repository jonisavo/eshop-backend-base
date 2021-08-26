const mongoose = require('mongoose');
const addVirtualId = require('../utils/add_virtual_id');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  street: {
    type: String,
    default: ''
  },
  apartment: {
    type: String,
    default: ''
  },
  zip: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
});

addVirtualId(userSchema);

module.exports = mongoose.model('User', userSchema);
