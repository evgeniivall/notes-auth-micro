const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is a required field."],
      minlength: [2, "User name must be at least 2 characters long."],
      maxlength: [64, "User name must be at most 64 characters long."],
      validate: [
        validator.isAscii,
        "User name can only contain ASCII characters.",
      ],
    },
    email: {
      type: String,
      required: [true, "User email is a required field."],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format."],
    },
    photo: {
      type: String,
      default: "default.jpg",
      validate: [validator.isURL, "Invalid URL format for photo."],
    },
    password: {
      type: String,
      required: [true, "User password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  /* '-1000' (-1 second) is required to prevent the case when saving to the DB takes longer than
   * JWT generation. In such case 'passwordChangedAt' will be set a to a datetime a bit after JWT was generated
   * and the token will fail validation as a password was changed after JWT generation.
   */
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/* Skip all non active users in queries */
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.isPasswordCorrect = async function (pass, candidatePass) {
  return bcrypt.compare(candidatePass, pass);
};

userSchema.methods.isChangedPasswordAfter = function (timestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return timestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.generateResetPasswordToken = function (expiresInSec) {
  const token = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetPasswordTokenExpires = Date.now() + expiresInSec * 1000;

  return token;
};

userSchema.statics.decryptResetPasswordToken = function (token) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = mongoose.model("User", userSchema);
