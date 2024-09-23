const jwt = require("jsonwebtoken");
const { jsend } = require("../utils/utils");

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_DAYS + "d",
  });
};

exports.createSendToken = (res, userId, statusCode, payload) => {
  const token = signToken(userId);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    ...(process.env.NODE_ENV === "production" && { secure: true }),
  };

  res.cookie("jwt", token, cookieOptions);
  jsend(res, statusCode, "success", { ...(payload && payload), token: token });
};
