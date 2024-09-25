const User = require("../models/User");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
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

    await new Email(user).sendWelcome();

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

exports.forgetPassword = async function (req, res, next) {
  const email = req.body.email;
  let token = undefined;

  try {
    if (!email) {
      throw new AppError("Please provide user email", 400);
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("No user with the specified email address", 404);
    }

    token = user.generateResetPasswordToken(
      process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN_SEC
    );
    await user.save({ validateBeforeSave: false });

    try {
      await new Email(user).sendPasswordReset(token);
    } catch (error) {
      throw new AppError("An error sending an email.", 500);
    }

    jsend(res, 200, "success", {
      message: "Password reset URL was send to your email.",
    });
  } catch (error) {
    if (token) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;

      await user.save({ validateBeforeSave: false });
    }
    next(error);
  }
};

exports.resetPassword = async function (req, res, next) {
  try {
    const password = req.body.password;
    const decryptedToken = User.decryptResetPasswordToken(req.params.token);
    const user = await User.findOne({ resetPasswordToken: decryptedToken });

    if (!password) {
    }

    if (!user) {
      throw new AppError("Token is invalid", 400);
    }

    if (user.resetPasswordTokenExpires.getTime() < Date.now()) {
      throw AppError("Token has expired", 400);
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    createSendToken(res, user._id, 200);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async function (req, res, next) {
  try {
    const { id: userId, currentPassword, password } = req.body;

    if (!currentPassword || !userId || !password) {
      throw new AppError(
        "Please provide all required fields: id, currentPassword, and password",
        400
      );
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found!", 400);
    }

    if (
      !(await user.isPasswordCorrect(user.password, req.body.currentPassword))
    ) {
      throw new AppError("Current password is wrong", 401);
    }

    user.password = req.body.password;
    await user.save();

    createSendToken(res, user._id, 200);
  } catch (error) {
    next(error);
  }
};
