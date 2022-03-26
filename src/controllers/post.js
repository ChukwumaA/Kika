const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Post = require('../models/Post');

// @desc      Get all users posts
// @route     GET /api/v1/posts
// @access    Private
exports.getAllUsersPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find()
    .populate('postedBy')
    .populate('comments.postedBy')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    message: 'Users posts retrieved!',
    data: { posts },
  });
});

// @desc      Create user post
// @route     CREATE /api/v1/posts
// @access    Private
exports.createPost = asyncHandler(async (req, res, next) => {
  // get user from the request
  const postedBy = req.user.id;

  const { caption, location } = req.body;

  // if (!caption || !location) {
  //   return next(new ErrorResponse('Please necessary fields', 404));
  // }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  // file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
  //   if (err) {
  //     console.error(err);
  //     return next(new ErrorResponse(`Problem with file upload`, 500));
  //   }

  //   await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

  //   res.status(200).json({
  //     success: true,
  //     data: file.name,
  //   });
  // });

  const newPost = {
    caption,
    location,
    postedBy,
  };

  const post = await Post.create(newPost);

  res.status(201).json({
    success: true,
    message: 'Created post successfully',
    data: post,
  });
});

// @desc      Like a user's post
// @route     PUT /api/v1/posts/like
// @access    Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user.id },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Post liked!',
    data: post,
  });
});

// @desc      Unlike a user's post
// @route     PUT /api/v1/posts/unlike
// @access    Private
exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user.id },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Post unliked!',
    data: post,
  });
});

// @desc      comment on a user's post
// @route     PUT /api/v1/posts/unlike
// @access    Private
exports.comment = asyncHandler(async (req, res, next) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user.id,
  };

  const postComment = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate('comments.postedBy', 'id name')
    .populate('postedBy', 'id name');

  res.status(200).json({
    success: true,
    message: 'User comment posted!',
    data: postComment,
  });
});

// @desc      delete single user posts
// @route     DELETE /api/v1/posts/:id
// @access    Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner
  if (post.postedBy.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this post`,
        401
      )
    );
  }

  post.remove();

  res
    .status(200)
    .json({ success: true, message: 'Post deleted successfully', data: {} });
});
