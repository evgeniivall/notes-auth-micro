const express = require("express");
const {
  signup,
  login,
  logout,
  forgetPassword,
  resetPassword,
  changePassword,
  introspect,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/introspect", protect, introspect);
router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/changePassword/:userId", changePassword);

module.exports = router;
