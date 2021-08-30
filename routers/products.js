const express = require('express');
const { saveItem, getAllItems, findItemById, getItemById, updateItem, deleteItem, getItemCount } = require('../utils/db_utils');
const { instantiateModelFromRequestBody } = require('../utils/mongoose_utils');
const { errorResponse } = require('../utils/responses');
const { upload, getFullStorageFilePath } = require('../utils/storage');

const Product = require('../models/product');

const Category = require('../models/category');
const { requireAdminJwt } = require('../utils/jwt');
const { ErrorCode } = require('../utils/error_codes');

const router = express.Router();

const BRIEF_SELECTION_OBJECT = { name: 1, image: 1, _id: 0 };

const getCategoryFilter = (req) =>
  req.query.categories ? { category: req.query.categories.split(',') } : {};

router.get('/', async (req, res) => {
  await getAllItems(Product, res, {
    populate: 'category', filter: getCategoryFilter(req)
  });
});

router.get('/brief', async (req, res) => {
  await getAllItems(Product, res, {
    selection: BRIEF_SELECTION_OBJECT, filter: getCategoryFilter(req)
  });
});

router.get('/:id', async (req, res) => {
  await getItemById(Product, req.params.id, res, {
    populate: 'category'
  });
});

router.get('/brief/:id', async (req, res) => {
  await getItemById(Product, req.params.id, res, {
    selection: BRIEF_SELECTION_OBJECT
  });
});

router.post('/', [upload.single('image'), requireAdminJwt()], async (req, res) => {
  if (!await findItemById(Category, req.body.category))
    return errorResponse(400, 'Invalid category', ErrorCode.REQUEST_INVALID_PARAMS, res);

  const file = req.file;

  if (!file)
    return errorResponse(400, 'No image found', ErrorCode.REQUEST_MISSING_PARAMS, res);

  const product = instantiateModelFromRequestBody(Product, {
    ...req.body,
    image: getFullStorageFilePath(req, file.filename)
  });

  await saveItem(product, res);
});

router.put('/:id', [upload.single('image'), requireAdminJwt()], async (req, res) => {
  if (typeof req.body.category === 'string' && !await findItemById(Category, req.body.category))
    return errorResponse(400, 'Invalid category', ErrorCode.REQUEST_INVALID_PARAMS, res);

  const product = await findItemById(Product, req.params.id);

  if (!product)
    return errorResponse(404, 'Product not found', ErrorCode.DB_ITEM_NOT_FOUND, res);

  const file = req.file;

  let body = req.body;

  if (file)
    body['image'] = getFullStorageFilePath(req, file.filename);

  await updateItem(Product, product._id, body, res);
});

router.put('/:id/gallery', [upload.array('images', 20), requireAdminJwt()], async (req, res) => {
  const product = await findItemById(Product, req.params.id);

  if (!product)
    return errorResponse(404, 'Product not found', ErrorCode.DB_ITEM_NOT_FOUND, res);

  let images = req.files;

  if (!images || images.length === 0)
    return errorResponse(400, 'No images given', ErrorCode.REQUEST_MISSING_PARAMS, res);

  images = images.map(image => getFullStorageFilePath(req, image.filename));

  await updateItem(Product, product._id, { images }, res);
});

router.delete('/:id', requireAdminJwt(), async (req, res) => {
  await deleteItem(Product, req.params.id, res);
});

router.get('/get/count', (_req, res) => {
  getItemCount(Product, res);
});

router.get('/get/featured(/:count)?', async (req, res) => {
  let limit = 0;

  if (typeof req.params.count === 'string') {
    limit = parseInt(req.params.count, 10);

    if (isNaN(limit)) {
      return errorResponse(400, 'Invalid count', ErrorCode.REQUEST_INVALID_PARAMS, res);
    }
  }

  await getAllItems(Product, res, {
    filter: { isFeatured: true, ...getCategoryFilter(req) }, limit
  });
});

module.exports = router;
