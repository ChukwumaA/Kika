const ErrorResponse = require("utils/errorResponse");
const asyncHandler = require("middleware/async");
const sendTokenResponse = require("utils/sendTokenResponse");
const Vendor = require("models/Vendor");
const Buyer = require("models/Buyer");

// @desc      Register user
// @route     POST /api/v1/auth/register/:accounttype
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, username, email, password} = req.body;
  const accountType = req.params.accounttype

  // Assign working Database collection
  const UserType = accountType == "vendor" ? Vendor : accountType == "buyer" ? Buyer : undefined;

  // If i am a vendor and I want to open a buyer account,
  // I can use the same email for buyer db but not the same username for buyer db

  //Check if email  exists in chosen database
    if (await UserType.findOne({ email })) {
      return next(new ErrorResponse("Email Already exists", 400));
    }
  //Check if Username exists in chosen database
    if (await UserType.findOne({ username })) {
      return next(new ErrorResponse("Username Already exists", 400));
    }

    
  //If isVendor is true check if username exists in Buyer DB
  //Hence - You can have a vendor and buyer account with same email but different usernames
    if (accountType == "vendor" && await Buyer.findOne({ username })) {
      return next(new ErrorResponse("Username Already exists", 400));
    }
  //If !isVendor is true check if username exists in Vendor DB 
  //Hence - You can have a vendor and buyer account with same email but different usernames
    if (accountType == "buyer" && await Vendor.findOne({ username })) {
      return next(new ErrorResponse("Username Already exists", 400));
    }
   

  // Create user
  const user = await UserType.create({
    name,
    username,
    email,
    password,
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login/:vendor or /api/v1/auth/login/:buyer
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const accountType = req.params.accounttype

  // Assign working Database collection
  const UserType = accountType == "vendor" ? Vendor : accountType == "buyer" ? Buyer : undefined;

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

  // Check for user
  const user = await UserType.findOne({
    $or: [{ email }, { username }],
  }).select("+password");

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
// @route     GET /api/v1/auth/logout
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

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const UserType = req.user.isVendor ? Vendor : Buyer; //Assign working Database collection

  //Block admin, password and role updates
  if ("isAdmin" in req.body || "password" in req.body || "role" in req.body) {
    return next(new ErrorResponse("Operation not authorized", 401));
  }

  const fieldsToUpdate = {
    ...req.body,
  };

  const user = await UserType.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  res.status(200).json({
    success: true,
    message: "Details updated!",
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const UserType = req.user.isVendor ? Vendor : Buyer; // Assign working Database collection
  const user = await UserType.findById(req.user._id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
