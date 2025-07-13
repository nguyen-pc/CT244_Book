// service/auth.service.js
const JWT = require("jsonwebtoken");
const User = require("../models/User");
const Token = require("../models/Token");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendEmailResetPassword } = require("./emailService");
const bcryptSalt = process.env.BCRYPT_SALT;

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User does not exist");
  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `localhost:3006/passwordReset?token=${resetToken}&id=${user._id}`;
  sendEmailResetPassword(user.email, link);
  return link;
};

// service/auth.service.js
const resetPassword = async (userId, token, password) => {
  let passwordResetToken = await Token.findOne({ userId });
  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }
  const hash = await bcrypt.hash(password, Number(bcryptSalt));
  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );
  const user = await User.findById({ _id: userId });
  //   sendEmail(
  //     user.email,
  //     "Password Reset Successfully",
  //     {
  //       name: user.name,
  //     },
  //     "./template/resetPassword.handlebars"
  //   );
  await passwordResetToken.deleteOne();
  return true;
};

module.exports = {
  requestPasswordReset: requestPasswordReset,
  resetPassword: resetPassword,
  // sendAttachment: sendAttachment,
};
