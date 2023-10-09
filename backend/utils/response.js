const successResponse = (res, status, data, message) => {
  res.json({
    status,
    success: true,
    message,
    result: data
  });
};

const failureResponse = (res, status, message) => {
  res.json({
    status,
    success: false,
    message
  });
};

module.exports = {
  successResponse,
  failureResponse
};
