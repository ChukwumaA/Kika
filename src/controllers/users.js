const asyncHandler = require('middleware/async');
const ErrorResponse = require('utils/errorResponse');
const User = require('models/User');
const Vendor = require('models/Vendor');

// @desc      Get all Users
// @route     GET /api/v1/users
// @access    Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get all Vendors
// @route     GET /api/v1/users/vendors
// @access    Private (Admin)
exports.getVendors = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get a User/vendor
// @route     GET /api/v1/users/:id
// @access    Private (Admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user =
    (await User.findById(req.params.id)) ||
    (await Vendor.findById(req.params.id));

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved!',
    data: user,
  });
});

// @desc      Delete User/vendor
// @route     Delete /api/v1/user/:id
// @access    Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user =
    (await User.findById(req.params.id)) ||
    (await Vendor.findById(req.params.id));

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  if (user.id === req.user.id) {
    return next(new ErrorResponse(`Cannot delete your personal account`, 405));
  }

  user.remove();

  res.status(200).json({
    success: true,
    message: 'User deleted!',
    data: {},
  });
});
