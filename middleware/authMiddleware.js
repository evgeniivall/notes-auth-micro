const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");

exports.protect = async function (req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies?.jwt;
  }
  try {
    if (!token) {
      throw new AppError("Not logged in", 401);
    }

    // Token validation
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError(
        "The user belonging to specified token does no longer exists",
        401
      );
    }

    // Check if user changed password after the token was issued
    if (user.isChangedPasswordAfter(decoded.iat)) {
      throw new AppError(
        "The user has changed password after token generation",
        401
      );
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
