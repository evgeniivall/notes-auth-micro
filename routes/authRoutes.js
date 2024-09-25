const express = require("express");
const {
  signup,
  login,
  authenticate,
  logout,
  forgetPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/authenticate", protect, authenticate);
router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/changePassword", changePassword);

module.exports = router;
