const asyncHandler = require('middleware/async');
const ErrorResponse = require('utils/errorResponse');
const User = require('models/User');

// @desc      Get all Users
// @route     GET /api/v1/users
// @access    Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    data: users,
  });
});

// @desc      Get a User
// @route     GET /api/v1/users/:id
// @access    Private (Admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

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

// @desc      Delete User
// @route     Delete /api/v1/user/:id
// @access    Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

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
