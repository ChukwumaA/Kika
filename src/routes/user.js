const express = require('express');
const {
  register,
  login,
  logout,
  updateDetails,
  updatePassword,
} = require('controllers/auth');

const router = express.Router();

const { protect, isAdmin} = require('middleware/auth');

router.get("/",getUsers);
router.get("/:id",getUser);
router.post('/register/:role', register);
router.post('/login', login);
router.get('/logout', logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.delete("/:id", protect, deleteAccount);
module.exports = router;