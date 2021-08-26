const mongoose = require('mongoose');
const addVirtualId = require('../utils/add_virtual_id');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
});

addVirtualId(categorySchema);

module.exports = mongoose.model('Category', categorySchema);
