const mongoose = require('mongoose');
const addVirtualId = require('../utils/add_virtual_id');

const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 0,
    max: 99
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
});

addVirtualId(orderItemSchema);

module.exports = mongoose.model('OrderItem', orderItemSchema);
