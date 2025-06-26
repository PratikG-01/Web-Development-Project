const User = require("../models/user.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { refreshToken };
  } catch (error) {
    throw new ApiError(404, "Error while creating the token");
  }
};

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // if (password.length < 8) throw new ApiError(400, "Password should be at least 8 characters long");
  if (!email || !password) throw new ApiError(400, "All fields are required");

  const user = await User.findOne({ email });

  if (!user || !(await user.passwordIsCorrect(password)))
    throw new ApiError(400, "Invalid user credentials");

  const { refreshToken } = await generateToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { refreshToken }, `You've logged in successfully`)
    );
});

exports.register = asyncHandler(async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    throw new ApiError(400, "Both passwords should be same");

  if (password.length < 8)
    throw new ApiError(400, "Password should be at least 8 characters long");

  if (!email || !password) throw new ApiError(400, "All fields are required");

  const user = await User.findOne({ email });

  if (user) throw new ApiError(400, "User already exists, try different email");
  // throw new ApiError(400, "User already exists");
  const newUser = await User.create({ email, password });
  //   console.log(newUser);
  if (!newUser) throw new ApiError(400, "Error creating user");

  res
    .status(200)
    .json(new ApiResponse(200, newUser, "User created successfully"));
});


exports.getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, user, "Your'e logged in")
  );
});


exports.logout = asyncHandler(async (req, res) => {
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    expires: new Date(0),
  };

  return res
    .setHeader("Cache-Control", "no-store")
    .status(200)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, [], "Logged out successfully"));
  
});
