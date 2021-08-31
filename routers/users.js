const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { requireAdminJwt, useJwt, hasJwt, isAdmin } = require('../utils/jwt');
const { saveItem, getAllItems, getItemById, updateItem, getItemCount, deleteItem } = require('../utils/db_utils');
const { instantiateModelFromRequestBody } = require('../utils/mongoose_utils');
const { successResponse, errorResponse } = require('../utils/responses');

const { PWT_RSA_KEY } = require('../utils/jwt');

const User = require('../models/user');
const { requestContainsNonEmptyStringField } = require('../utils/request_utils');
const { ErrorCode } = require('../utils/error_codes');

const router = express.Router();

const getSelection = '-passwordHash';

router.get('/', requireAdminJwt(), async (_req, res) => {
  await getAllItems(User, res, { selection: getSelection });
})

router.get('/:id', useJwt(), async (req, res) => {
  if (!hasJwt(req) || (req.user.userId !== req.params.id && !isAdmin(req)))
    return errorResponse(401, "You are not authorized.", ErrorCode.USER_NOT_AUTHORIZED, res);

  await getItemById(User, req.params.id, res, { selection: getSelection });
});

const register = async (req, res) => {
  if (typeof req.body.password !== 'string')
    return errorResponse(400, 'No password given.', ErrorCode.REQUEST_MISSING_PARAMS, res);

  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser)
    return errorResponse(400, 'User already exists with that e-mail.', ErrorCode.USER_ALREADY_EXISTS, res);

  const passwordHash = bcryptjs.hashSync(req.body.password, 10);

  const user = instantiateModelFromRequestBody(User, { ...req.body, passwordHash });

  await saveItem(user, res, getSelection);
};

router.post('/', requireAdminJwt(), async (req, res) => {
  await register(req, res);
});

router.post('/register', async (req, res) => {
  await register(req, res);
});

router.put('/:id', requireAdminJwt(), async (req, res) => {
  await updateItem(User, req.params.id, req.body, res);
});

router.delete('/:id', requireAdminJwt(), async (req, res) => {
  await deleteItem(User, req.params.id, res, getSelection);
});

router.post('/login', useJwt(), async (req, res) => {
  if (hasJwt(req))
    return errorResponse(400, 'Already logged in.', ErrorCode.USER_ALREADY_LOGGED_IN, res);

  if (!requestContainsNonEmptyStringField(req, 'email'))
    return errorResponse(400, 'E-mail not given.', ErrorCode.REQUEST_MISSING_PARAMS, res);

  if (!requestContainsNonEmptyStringField(req, 'password'))
    return errorResponse(400, 'Password not given.', ErrorCode.REQUEST_MISSING_PARAMS, res);

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return errorResponse(404, 'User not found.', ErrorCode.DB_ITEM_NOT_FOUND, res);

  if (!bcryptjs.compareSync(req.body.password, user.passwordHash))
    return errorResponse(400, 'Wrong password.', ErrorCode.USER_WRONG_PASSWORD, res);

  const jwtData = { userId: user.id, isAdmin: user.isAdmin };

  const token = jwt.sign(jwtData, PWT_RSA_KEY, { expiresIn: '1d' });

  successResponse(200, { user: user.email, id: user._id, token }, res);
});

router.post('/change/password', async (req, res) => {
  if (!requestContainsNonEmptyStringField(req, 'email'))
    return errorResponse(400, 'No e-mail given.', ErrorCode.REQUEST_MISSING_PARAMS, res);

  if (!requestContainsNonEmptyStringField(req, 'newPassword'))
    return errorResponse(400, 'No new password given.', ErrorCode.REQUEST_MISSING_PARAMS, res);

  if (!requestContainsNonEmptyStringField(req, 'currentPassword'))
    return errorResponse(400, 'No current password given.', ErrorCode.REQUEST_MISSING_PARAMS, res);

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return errorResponse(404, 'User not found.', ErrorCode.DB_ITEM_NOT_FOUND, res);
  
  if (!bcryptjs.compareSync(req.body.currentPassword, user.passwordHash))
    return errorResponse(400, 'Wrong current password.', ErrorCode.USER_WRONG_PASSWORD, res);

  if (bcryptjs.compareSync(req.body.newPassword, user.passwordHash))
    return errorResponse(400, 'New password can not be the same as the current password.', ErrorCode.REQUEST_INVALID_PARAMS, res);

  const passwordHash = bcryptjs.hashSync(req.body.newPassword, 10);

  await updateItem(User, user._id, { passwordHash }, res, getSelection);
});

router.get('/get/count', async (_req, res) => {
  getItemCount(User, res);
});

module.exports = router;
