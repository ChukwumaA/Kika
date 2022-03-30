const express = require("express");
const {
  getVendors,
  getVendor,
  register,
  login,
  logout,
  updateDetails,
  updatePassword,
  deleteAccount
} = require("controllers/vendors");

const router = express.Router();

const { protect } = require("middleware/auth");

router.get("/", getVendors);
router.get("/:id", getVendor);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.patch("/updateprofile", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.delete("/:id", protect, deleteAccount);

module.exports = router;
