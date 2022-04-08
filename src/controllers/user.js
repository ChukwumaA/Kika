const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendTokenResponse = require("utils/sendTokenResponse");
const User = require("../models/User");

// @desc      Get all Users
// @route     GET /api/v1/user
// @access    Public
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

// @desc      Get a User
// @route     GET /api/v1/user/:id
// @access    Public
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.send(user);
  } else {
    new ErrorResponse(`User not found with id of ${req.params.id}`, 404);
  }
});

// @desc      Register User
// @route     POST /api/v1/users/register/:role
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password , role} = req.body;

  if (await User.findOne({ email })) {
    return next(new ErrorResponse("Username or Email Already exists", 400));
  }

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    role: role
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Login User
// @route     POST /api/v1/user/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  // Validate email & password
  if (!email || !password) {
      return next(
        new ErrorResponse("Please provide a email and password", 400)
      );
  }

  // Check for User
  const user = await User.findOne({ email }).select(
    "+password"
  );

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/user/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Update User details
// @route     PATCH /api/v1/user/profile
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const to_update = Object.keys(data);
  const valid_keys = ["name", "email"];
  const is_valid = to_update.every((update) => valid_keys.includes(update));
  if (!is_valid)
    return res.status(400).send({
      message: "could not edit user details",
    });

  try {
    const { email } = data;
    //Check if user wants to update to an already existing username
    if (email && (await User.findOne({ email }))) {
      return next(new ErrorResponse("Email already exists", 400));
    }
    const fieldsToUpdate = {
      ...data,
    };

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new ErrorResponse("Internal server error", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Email already exists" });
    }
    console.log(error);
    res.status(400).send({
      message: "Could not edit details",
      error,
    });
  }
});

// @desc      Update User Password
// @route     PATCH /api/v1/user/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Delete Users
// @route     Delete /api/v1/user/:id
// @access    Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.email === "admin@example.com") {
      new ErrorResponse(
        `Can Not Delete Admin User with id of ${req.params.id}`,
        404
      );
      return;
    }
    await user.remove();
    res.send({ message: "User Deleted" });
  } else {
    new ErrorResponse(`User not found with id of ${req.params.id}`, 404);
  }
});
