const express = require('express');
const User = require('models/User');
const data = require('../data');
const asyncHandler = require('middleware/async');

const {
  register,
  registerVendor,
  login,
  loginVendor,
  logout,
  updateDetails,
  updatePassword,
  getProfile,
} = require('controllers/auth');

const router = express.Router();

const { protect } = require('middleware/auth');

router.post('/register', register);
router.post('/register/vendor', registerVendor);
router.post('/login', login);
router.post('/login/vendor', loginVendor);
router.get('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Populate database with dummy data(users)
router.get(
  '/seed',
  asyncHandler(async (req, res) => {
    // await User.deleteMany({});
    const createdUsers = await User.create(data.users);
    res.send({ createdUsers });
  })
);

module.exports = router;
