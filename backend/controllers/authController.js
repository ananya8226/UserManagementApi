const db = require('../models');
const User = db.users;
const bcrypt = require('bcrypt');
const { SECRET, EXPIRES_IN, ALGORITHM, LOGIN_TOKEN_TYPE, FORGOT_TOKEN_TYPE, RESET_TOKEN_TYPE } = require('../config/authConfig');
const jwt = require('jsonwebtoken');
const { failureResponse, successResponse } = require('../utils/response');
const sendEmail = require('../utils/nodeMailer');
const fs = require('fs');
const sendSms = require('../utils/sendSmsTwilio');

const signUp = async (req, res) => {
  try {
    const { fullname, email, phone } = req.body;
    const info = { fullname, email, phone };
    info.profileImage = req.file?.path;
    info.password = bcrypt.hashSync(req.body.password, 6);
    const user = await User.create(info);
    return successResponse(res, 200, user, 'Registration Successful');
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        console.log("image can't be deleted", error);
      });
    }
    return failureResponse(res, 500, err.message);
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    const token = jwt.sign({ email: user.email, tokenType: LOGIN_TOKEN_TYPE }, SECRET, { algorithm: ALGORITHM, allowInsecureKeySizes: true, expiresIn: EXPIRES_IN });
    await user.update({ session: token }, { where: { email: req.body.email } });
    return successResponse(res, 200, { id: user.id, fullname: user.fullname, email: user.email, authToken: token }, 'Login Successful');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const logout = async (req, res) => {
  try {
    const user = await User.update({ session: null }, { where: { email: req.email } });
    return successResponse(res, 200, user.session, 'Logged Out');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const newPassword = bcrypt.hashSync(req.body.newPassword, 6);
    // await user.update({ password: newPassword });
    await User.update({ password: newPassword }, { where: { email: req.email } });
    return successResponse(res, 200, null, 'Password changed Successfully');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ email: req.body.email, otp: process.env.BYPASS_OTP, tokenType: FORGOT_TOKEN_TYPE }, SECRET, { algorithm: ALGORITHM, allowInsecureKeySizes: true, expiresIn: EXPIRES_IN });
    await user.update({ session: token });
    sendEmail(req.body.email);
    sendSms(req.body.phone);
    return successResponse(res, 200, token, 'OTP and Token generated');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const newToken = jwt.sign({ email: req.email, tokenType: RESET_TOKEN_TYPE }, SECRET, { algorithm: ALGORITHM, allowInsecureKeySizes: true, expiresIn: EXPIRES_IN });
    await User.update({ session: newToken }, { where: { email: req.email } });
    // sendEmail(req.email);
    return successResponse(res, 200, newToken, 'OTP verification successful');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const newPassword = bcrypt.hashSync(req.body.newPassword, 6);
    await User.update({ password: newPassword }, { where: { email: req.email } });
    return successResponse(res, 200, null, 'Password reset successfully, Please login.');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

module.exports = {
  signUp, login, logout, changePassword, forgotPassword, resetPassword, verifyOtp
};
