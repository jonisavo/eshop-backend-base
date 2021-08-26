const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('./responses');

const saveItem = async (item, res, responseSelection = undefined) => {
  try {
    await item.save();
  } catch (err) {
    return errorResponse(500, err, res);
  }

  const savedItem = await item.constructor.findById(item._id).select(responseSelection || {});

  return successResponse(201, savedItem, res);
}

const getAllItems = async (model, res, options = {}) => {
  let itemList = [];

  try {
    const query = model.find();

    itemList = await applyGetOptionsToQuery(query, options).exec();
  } catch (err) {
    return errorResponse(500, err, res);
  }

  return successResponse(200, itemList, res);
}

const getItemById = async (model, id, res, options = {}) => {
  if (!mongoose.isValidObjectId(id))
    return errorResponse(400, 'Invalid object ID', res);

  let items;

  try {
    const query = model.findById(id);

    items = await applyGetOptionsToQuery(query, options).exec();
  } catch (err) {
    return errorResponse(500, err, res);
  }

  if (!items || items.length === 0)
    return errorResponse(404, 'Item not found', res);

  return successResponse(200, items[0], res);
}

const findItemById = async (model, id) => {
  if (!mongoose.isValidObjectId(id))
    return undefined;

  let item;

  try {
    item = await model.findById(id);
  } catch {
    return undefined;
  }

  return item || undefined;
}

const updateItem = async (model, id, data, res, responseSelection = undefined) => {
  if (!mongoose.isValidObjectId(id))
    return errorResponse(404, 'Invalid object ID', res);

  let item;

  try {
    item = await model.findByIdAndUpdate(id, data, { new: true }).select(responseSelection || {});
  } catch (err) {
    return errorResponse(500, err, res);
  }

  if (!item)
    return errorResponse(404, 'The item was not found.', res);

  return successResponse(200, {
    message: 'The item was updated.',
    item
  }, res);
}

const deleteItem = async (model, id, res, responseSelection = undefined) => {
  if (!mongoose.isValidObjectId(id))
    return errorResponse(400, 'Invalid object ID', res);

  const item = await model.findById(id).select(responseSelection || {});

  if (!item)
    return errorResponse(404, 'The item was not found!', res);

  item.remove()
    .then(item => successResponse(500, item, res))
    .catch(err => errorResponse(500, err, res));
}

const getItemCount = (model, res) => {
  model.countDocuments((err, count) => {
    if (err)
      return errorResponse(500, err, res);

    successResponse(200, count, res);
  });
}

const applyGetOptionsToQuery = (query, options) => {
  query.find(options.filter || {});
  query.select(options.selection || {});

  if (typeof options.limit === 'number' && options.limit > 0) {
    query.limit(options.limit);
  }

  const populate = (param) => {
    if (Array.isArray(param)) {
      query.populate(...param);
    } else if (param) {
      query.populate(param);
    }
  }

  if (typeof options.populate === 'string' || Array.isArray(options.populate)) {
    populate(options.populate);
  }

  if (Array.isArray(options.populateMany)) {
    options.populateMany.forEach(param => populate(param));
  }

  if (['string', 'object'].includes(typeof options.sort)) {
    query.sort(options.sort)
  }

  return query;
}

module.exports = {
  saveItem,
  getAllItems,
  getItemById,
  findItemById,
  updateItem,
  deleteItem,
  getItemCount
}
