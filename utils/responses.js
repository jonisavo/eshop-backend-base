const { ErrorCode } = require("./error_codes");

const successResponse = (code, result, res) => {
  return res.status(code).json({
    success: true,
    result
  });
}

const errorResponse = (code, err, errCode, res) => {
  if (typeof err === 'string') {
    err = new Error(err);
  }
  
  if (!Object.values(ErrorCode).includes(errCode)) {
    errCode = ErrorCode.UNKNOWN_ERROR;
  }

  return res.status(code).json({
    success: false,
    error: {
      _toString: err.toString(),
      _code: errCode,
      ...err
    }
  });
}

module.exports = {
  successResponse,
  errorResponse
}
