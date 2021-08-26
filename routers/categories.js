const express = require('express');
const { saveItem, getAllItems, getItemById, deleteItem, updateItem } = require('../utils/db_utils');
const { instantiateModelFromRequestBody } = require('../utils/mongoose_utils');
const { requireAdminJwt } = require('../utils/jwt');

const Category = require('../models/category');

const router = express.Router();

router.get('/', async (_req, res) => {
  await getAllItems(Category, res);
});

router.get('/:id', async (req, res) => {
  await getItemById(Category, req.params.id, res);
});

router.post('/', requireAdminJwt(), async (req, res) => {
  const category = instantiateModelFromRequestBody(Category, req.body);
  await saveItem(category, res);
});

router.put('/:id', requireAdminJwt(), async (req, res) => {
  await updateItem(Category, req.params.id, req.body, res);
});

router.delete('/:id', requireAdminJwt(), async (req, res) => {
  await deleteItem(Category, req.params.id, res);
});

module.exports = router;
