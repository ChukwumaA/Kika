const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendTokenResponse = require("utils/sendTokenResponse");
const Buyer = require("../models/Buyer");
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");

// @desc      Get all Vendors
// @route     GET /api/v1/vendor
// @access    Public
exports.getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({});
  res.send(vendors);
});

// @desc      Get a Vendor
// @route     GET /api/v1/vendor/:id
// @access    Public
exports.getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (vendor) {
    res.send(vendor);
  } else {
    new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404);
  }
});

// @desc      Register Vendor
// @route     POST /api/v1/vendors/signup
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  if (await Buyer.findOne({ $or: [{ email }, { username }] })) {
    return next(new ErrorResponse("Username or Email Already exists", 400));
  }
  if (await Vendor.findOne({ username })) {
    return next(new ErrorResponse("Username Already exists", 400));
  }
  // Create Vendor
  const vendor = await Vendor.create({
    name,
    username,
    email,
    password,
  });

  sendTokenResponse(vendor, 200, res);
});

// @desc      Login Vendor
// @route     POST /api/v1/vendor/signin
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

  // Check for Vendor
  const vendor = await Vendor.findOne({ $or: [{ email }, { username }] }).select(
    "+password"
  );

  if (!vendor) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await vendor.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(vendor, 200, res);
});

// @desc      Log vendor out / clear cookie
// @route     GET /api/v1/vendor/logout
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

// @desc      Update Vendor details
// @route     PATCH /api/v1/vendor/profile
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const to_update = Object.keys(data);
  const valid_keys = ["name", "email", "username"];
  const is_valid = to_update.every((update) => valid_keys.includes(update));
  if (!is_valid)
    return res.status(400).send({
      message: "could not edit vendor details",
    });


  try {
    const { username } = data;
    //Check if user wants to update to an already existing username
    if (username && (await Vendor.findOne({ username }))) {
      return next(new ErrorResponse("Username already exists", 400));
    }
    const fieldsToUpdate = {
      ...data,
    };

    const vendor = await Vendor.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!vendor) {
      return next(new ErrorResponse("Internal server error", 401));
    }

    sendTokenResponse(vendor, 200, res);
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

// @desc      Update Vendor Password
// @route     PATCH /api/v1/vendor/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.user._id).select("+password");

  // Check current password
  if (!(await vendor.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  vendor.password = req.body.newPassword;
  await vendor.save();

  sendTokenResponse(vendor, 200, res);
});

// @desc      Delete Vendors
// @route     Delete /api/v1/vendor/:id
// @access    Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (vendor) {
    if (vendor.email === "admin@example.com") {
      new ErrorResponse(
        `Can Not Delete Admin Vendor with id of ${req.params.id}`,
        404
      );
      return;
    }
    await vendor.remove();
    res.send({ message: "Vendor Deleted" });
  } else {
    new ErrorResponse(`Vendor not found with id of ${req.params.id}`, 404);
  }
});
