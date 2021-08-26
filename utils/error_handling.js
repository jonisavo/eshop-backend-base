const { errorResponse } = require('./responses');

const errorsToHandle = ['UnauthorizedError', 'ValidationError'];

const handleErrors = (err, _req, res, next) => {
  if (typeof err?.name === 'string' && errorsToHandle.includes(err.name)) {
    return errorResponse(err.status || 500, err, res);
  }

  next();
};

module.exports = {
  handleErrors
};
