const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendTokenResponse = require("utils/sendTokenResponse");
const Buyer = require("../models/Buyer");
const User = require("../models/Vendor");

// @desc      Get all Buyers
// @route     GET /api/v1/buyer
// @access    Public
exports.getBuyers = asyncHandler(async (req, res) => {
  const buyers = await Buyer.find({});
  res.send(buyers);
});

// @desc      Get a Buyer
// @route     GET /api/v1/buyer/:id
// @access    Public
exports.getBuyer = asyncHandler(async (req, res) => {
  const buyer = await Buyer.findById(req.params.id);
  if (buyer) {
    res.send(buyer);
  } else {
    new ErrorResponse(`Buyer not found with id of ${req.params.id}`, 404);
  }
});

// @desc      Register Buyer
// @route     POST /api/v1/buyers/signup
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  if (await Buyer.findOne({ $or: [{ email }, { username }] })) {
    return next(new ErrorResponse("Username or Email Already exists", 400));
  }
  if (await User.findOne({ username })) {
    return next(new ErrorResponse("Username Already exists", 400));
  }
  // Create Buyer
  const buyer = await Buyer.create({
    name,
    username,
    email,
    password,
  });

  sendTokenResponse(buyer, 200, res);
});

// @desc      Login Buyer
// @route     POST /api/v1/buyer/signin
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  // Validate email or username & password
  if (!email || !password) {
    // Validate username
    if (!username || !password) {
      return next(
        new ErrorResponse("Please provide a username and password", 400)
      );
    }
  }

  // Check for Buyer
  const buyer = await Buyer.findOne({ $or: [{ email }, { username }] }).select(
    "+password"
  );

  if (!buyer) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await buyer.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(buyer, 200, res);
});

// @desc      Log buyer out / clear cookie
// @route     GET /api/v1/buyer/logout
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

// @desc      Update Buyer details
// @route     PATCH /api/v1/buyer/profile
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const to_update = Object.keys(data);
  const valid_keys = ["name", "email", "username"];
  const is_valid = to_update.every((update) => valid_keys.includes(update));
  if (!is_valid)
    return res.status(400).send({
      message: "could not edit buyer details",
    });

  try {
    const { username } = data;
    //Check if user wants to update to an already existing username
    if (username && (await User.findOne({ username }))) {
      return next(new ErrorResponse("Username already exists", 400));
    }
    const fieldsToUpdate = {
      ...data,
    };

    const buyer = await Buyer.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!buyer) {
      return next(new ErrorResponse("Internal server error", 401));
    }

    sendTokenResponse(buyer, 200, res);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Username already exists" });
    }
    console.log(error);
    res.status(400).send({
      message: "Could not edit details",
      error,
    });
  }
});

// @desc      Update Buyer Password
// @route     PATCH /api/v1/buyer/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const buyer = await Buyer.findById(req.user._id).select("+password");

  // Check current password
  if (!(await buyer.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  buyer.password = req.body.newPassword;
  await buyer.save();

  sendTokenResponse(buyer, 200, res);
});

// @desc      Delete Buyers
// @route     Delete /api/v1/buyer/:id
// @access    Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  const buyer = await Buyer.findById(req.params.id);
  if (buyer) {
    if (buyer.email === "admin@example.com") {
      new ErrorResponse(
        `Can Not Delete Admin Buyer with id of ${req.params.id}`,
        404
      );
      return;
    }
    await buyer.remove();
    res.send({ message: "Buyer Deleted" });
  } else {
    new ErrorResponse(`Buyer not found with id of ${req.params.id}`, 404);
  }
});
