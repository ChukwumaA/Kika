const express = require('express');
const router = express.Router();

const {
  getAllUsersPosts,
  createPost,
  likePost,
  unlikePost,
  comment,
  deletePost,
} = require('controllers/post');

const { protect } = require('middleware/auth');

router.use(protect);

router.route('/').get(getAllUsersPosts);
router.route('/').post(createPost);

router.route('/:id').delete(deletePost);

router.route('/like').put(likePost);
router.route('/unlike').put(unlikePost);
router.route('/comment').put(comment);

module.exports = router;
