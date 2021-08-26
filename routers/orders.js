const express = require('express');
const mongoose = require('mongoose');
const { saveItem, getAllItems, deleteItem, getItemById, updateItem, getItemCount } = require('../utils/db_utils');
const { errorResponse, successResponse } = require('../utils/responses');

const { Order, OrderStatus } = require('../models/order');
const OrderItem = require('../models/order_item');
const { instantiateModelFromRequestBody } = require('../utils/mongoose_utils');
const { requireAdminJwt, useJwt, hasJwt, isAdmin } = require('../utils/jwt');

const router = express.Router();

const getPopulateManyOptions = [
  ['user', 'name email phone'],
  { path: 'orderItems', populate: { path: 'product', populate: 'category' } }
];

router.get('/', requireAdminJwt(), async (_req, res) => {
  await getAllItems(Order, res, {
    populateMany: getPopulateManyOptions,
    sort: { dateOrdered: -1 }
  });
});

router.get('/:id', useJwt(), async (req, res) => {
  if (!hasJwt(req))
    return errorResponse(401, 'You are not logged in.', res);

  const filter = isAdmin(req) ? {} : { user: req.user.userId };

  await getItemById(Order, req.params.id, res, {
    filter,
    populateMany: getPopulateManyOptions
  });
});

router.post('/', useJwt(), async (req, res) => {
  if (!hasJwt(req))
    return errorResponse(401, 'You are not logged in.', res);

  if (!Array.isArray(req.body.orderItems) || req.body.orderItems.length === 0)
    return errorResponse(400, 'No order items given', res);

  if (typeof req.body.user !== 'string')
    return errorResponse(400, 'No user given', res);

  const orderItemIds = await Promise.all(req.body.orderItems.map(async orderItem => {
    let newOrderItem = instantiateModelFromRequestBody(OrderItem, orderItem);

    newOrderItem = await newOrderItem.save();

    return newOrderItem._id;
  }));

  const prices = await Promise.all(orderItemIds.map(async id => {
    const orderItem = await OrderItem.findById(id).populate('product', 'price');
    return orderItem.product.price * orderItem.quantity;
  }));

  const totalPrice = prices.reduce((prev, current) => prev + current, 0);

  const order = instantiateModelFromRequestBody(Order, {
    ...req.body,
    orderItems: orderItemIds,
    totalPrice
  });

  await saveItem(order, res);
});

router.post('/:id/set/status/:status', requireAdminJwt(), async (req, res) => {
  if (!Object.values(OrderStatus).includes(req.params.status))
    return errorResponse(400, 'Invalid order status', res);

  await updateItem(Order, req.params.id, { status: req.params.status }, res);
});

router.put('/:id', requireAdminJwt(), async (req, res) => {
  await updateItem(Order, req.params.id, req.body, res);
});

router.delete('/:id', requireAdminJwt(), async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return errorResponse(404, 'The order was not found!', res);

  const orderItemDeletions = Promise.all(
    order.orderItems.map(async id => OrderItem.findByIdAndRemove(id))
  ).catch(err => errorResponse(500, err, res));

  try {
    await orderItemDeletions;
  } catch (err) {
    return errorResponse(500, err, res);
  }

  await deleteItem(Order, req.params.id, res);
});

router.get('/get/user/:id', useJwt(), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return errorResponse(400, 'Invalid user ID', res);

  if (!hasJwt(req))
    return errorResponse(400, 'You are not logged in.', res);

  if (req.params.id !== req.user.userId && !isAdmin(req))
    return errorResponse(401, 'You are not authorized.', res);

  await getAllItems(Order, res, {
    filter: { user: req.params.id },
    populateMany: getPopulateManyOptions,
    sort: { dateOrdered: -1 }
  });
});

router.get('/get/count', requireAdminJwt(), (_req, res) => {
  getItemCount(Order, res);
});

router.get('/get/totalsales', requireAdminJwt(), async (_req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSalesSum: { $sum: '$totalPrice' } } },
    { $project: { _id: 0, totalSalesSum: 1 }}
  ]);

  if (!totalSales)
    return errorResponse(500, 'Order sales can not be generated', res);

  successResponse(200, { totalSales: totalSales.pop().totalSalesSum }, res);
});

module.exports = router;
