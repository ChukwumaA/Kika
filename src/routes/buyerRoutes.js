const express = require("express");
const {
  getBuyers,
  getBuyer,
  register,
  login,
  logout,
  updateDetails,
  updatePassword,
  deleteAccount
} = require("controllers/buyers");

const router = express.Router();
 
const { protect } = require("middleware/auth");

router.get("/", getBuyers);
router.get("/:id", getBuyer);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.patch("/updateprofile", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.delete("/:id", protect, deleteAccount);

module.exports = router;
