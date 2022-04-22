const express = require('express');
const {
  getUsers,
  getUser,
  deleteUser,
  getVendors,
} = require('controllers/users');
const advancedResults = require('middleware/advancedResults');
const User = require('models/User');
const Vendor = require('models/Vendor');

const router = express.Router();

const { protect, authorize } = require('middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', advancedResults(User), getUsers);
router.get('/vendors', advancedResults(Vendor), getVendors);

router.route('/:id').get(getUser).delete(deleteUser);

module.exports = router;
