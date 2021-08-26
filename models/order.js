const mongoose = require('mongoose');
const addVirtualId = require('../utils/add_virtual_id');

const OrderStatus = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled'
}

const orderSchema = mongoose.Schema({
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  }],
  shippingAddress1: {
    type: String,
    required: true
  },
  shippingAddress2: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    default: OrderStatus.PENDING
  },
  totalPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOrdered: {
    type: Date,
    default: Date.now
  }
});

addVirtualId(orderSchema);

module.exports = {
  Order: mongoose.model('Order', orderSchema),
  OrderStatus
};
