const express = require('express');
const {
  register,
  login,
  logout,
  updateDetails,
  updatePassword,
} = require('controllers/auth');

const router = express.Router();

const { protect } = require('middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
