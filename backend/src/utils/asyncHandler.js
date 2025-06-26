const asyncHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    // console.log(error, "************************");
    res.status(error.statusCode || 500).json({
      status: "failed",
      message: error.message,
      error: error,
    });
  }
};

module.exports = asyncHandler;
