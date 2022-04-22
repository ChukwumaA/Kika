const express = require('express');
const User = require('models/User');
const Vendor = require('models/Vendor');
const data = require('../data');
const asyncHandler = require('middleware/async');
const { cloudinaryConfig } = require('middleware/cloudinary');
const { multerUploads } = require('utils/multer');

const {
  register,
  registerVendor,
  login,
  updateDetails,
  updatePassword,
  getProfile,
} = require('controllers/auth');

const router = express.Router();

const { protect } = require('middleware/auth');

router.post('/register', register);
router.post(
  '/register/vendor',
  multerUploads,
  cloudinaryConfig,
  registerVendor
);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Populate database with dummy data(users)
router.get(
  '/seed',
  asyncHandler(async (req, res) => {
    // await User.deleteMany({});
    // await Vendor.deleteMany({});
    const createdUsers = await User.create(data.users);
    const createdVendors = await Vendor.create(data.vendors);

    res.send({ createdUsers, createdVendors });
  })
);

module.exports = router;
