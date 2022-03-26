const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Post = require('../models/Post');

// @desc      Get single user information
// @route     GET /api/v1/users/:id
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  const posts = await Post.find({ postedBy: req.params.id }).populate({
    path: 'postedBy',
    select: 'id name',
  });

  res.status(200).json({
    success: true,
    message: 'User information retrieved!',
    data: { user, posts },
  });
});
