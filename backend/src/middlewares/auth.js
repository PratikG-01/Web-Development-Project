const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");

exports.verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, "Unauthorized request");

  const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );
  if (!user)
    throw new ApiError(400, "Token is invalid or expired, please login again");
  req.user = user;
  return next();
});
