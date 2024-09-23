const User = require("../models/User");
const AppError = require("../utils/appError");
const { createSendToken } = require("../utils/jwt");
const { jsend } = require("../utils/utils");

exports.signup = async function (req, res, next) {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password,
    });

    user.password = undefined; // Remove password from response
    createSendToken(res, user._id, 201, { user });
  } catch (error) {
    next(error);
  }
};

exports.login = async function (req, res, next) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new AppError("Please provide email and password!", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isPasswordCorrect(user.password, password))) {
      throw new AppError("Invalid credentials", 401);
    }

    createSendToken(res, user._id, 200);
  } catch (error) {
    next(error);
  }
};

exports.logout = async function (req, res, next) {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  jsend(res, 200, "success");
};

exports.authenticate = async function (req, res, next) {
  try {
    jsend(res, 200, "success", { id: req.user.id, role: req.user.role });
  } catch (error) {
    next(error);
  }
};
