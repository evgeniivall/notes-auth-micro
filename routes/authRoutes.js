const express = require("express");
const {
  signup,
  login,
  authenticate,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/authenticate", protect, authenticate);

module.exports = router;
