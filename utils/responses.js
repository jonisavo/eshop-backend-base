const successResponse = (code, result, res) => {
  return res.status(code).json({
    success: true,
    result
  });
}

const errorResponse = (code, err, res) => {
  if (typeof err === 'string') {
    err = new Error(err);
  }

  return res.status(code).json({
    success: false,
    error: {
      toString: err.toString(),
      ...err
    }
  });
}

module.exports = {
  successResponse,
  errorResponse
}
