const express = require('express');
const User = require('models/User');
const data = require('../data');
const asyncHandler = require('middleware/async');

const {
  register,
  login,
  logout,
  updateDetails,
  updatePassword,
  getProfile
} = require('controllers/auth');

const router = express.Router();

const { protect } = require('middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Populate database with dummy data(users)
router.get(
  '/seed',
  asyncHandler(async (req, res) => {
    // await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);

module.exports = router;
