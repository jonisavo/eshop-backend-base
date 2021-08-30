const { ErrorCode } = require('./error_codes');
const { errorResponse } = require('./responses');

const handleErrors = (err, _req, res, next) => {
  if (err?.name === 'UnauthorizedError') {
    return errorResponse(err.status || 500, err, ErrorCode.USER_NOT_AUTHORIZED, res);
  }

  if (err?.name === 'ValidationError') {
    return errorResponse(err.status || 500, err, ErrorCode.REQUEST_VALIDATION_ERROR, res);
  }

  next();
};

module.exports = {
  handleErrors
};
