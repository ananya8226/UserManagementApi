const db = require('../models');
const User = db.users;
const Post = db.posts;
const bcrypt = require('bcrypt');
const { failureResponse, successResponse } = require('../utils/response');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { ADMIN_FULLNAME, ADMIN_EMAIL, ADMIN_PASSWORD, SECRET, ADMIN_TYPE, LOGIN_TOKEN_TYPE, ALGORITHM, EXPIRES_IN, FORGOT_TOKEN_TYPE, RESET_TOKEN_TYPE, ACTIVE, USER_TYPE, DELETED, INACTIVE, PENDING } = require('../config/authConfig');
const sendEmail = require('../utils/nodeMailer');
const { customSearchUser, customSearchPost } = require('../middleware/customSearch');

// Script to create admin once
const adminSignup = async (req, res) => {
  try {
    const admin = {
      fullname: ADMIN_FULLNAME,
      email: ADMIN_EMAIL,
      phone: null,
      status: ACTIVE,
      role: ADMIN_TYPE,
      profileImage: req.file?.path,
      password: bcrypt.hashSync(ADMIN_PASSWORD, 6)
    };
    const user = await User.create(admin);
    return successResponse(res, 200, user, 'Admin Created');
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file?.path, (error) => {
        console.log(error);
      });
    }
    return failureResponse(res, 500, error.message);
  }
};

const adminLogin = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    const token = jwt.sign({ email: user.email, tokenType: LOGIN_TOKEN_TYPE }, SECRET, { algorithm: ALGORITHM, allowInsecureKeySizes: true, expiresIn: EXPIRES_IN });
    await user.update({ session: token }, { where: { email: req.body.email } });
    return successResponse(res, 200, { id: user.id, fullname: user.fullname, email: user.email, authToken: token }, 'Login Successful');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const adminChangePassword = async (req, res) => {
  try {
    const newPassword = bcrypt.hashSync(req.body.newPassword, 6);
    // await user.update({ password: newPassword });
    await User.update({ password: newPassword }, { where: { email: req.email } });
    return successResponse(res, 200, null, 'Admin Password changed Successfully');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const adminForgotPassword = async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ email: req.body.email, otp: process.env.BYPASS_OTP, tokenType: FORGOT_TOKEN_TYPE }, SECRET, { algorithm: ALGORITHM, allowInsecureKeySizes: true, expiresIn: EXPIRES_IN });
    await user.update({ session: token });
    sendEmail(req.email);
    return successResponse(res, 200, token, 'OTP and Token generated');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const adminVerifyOtp = async (req, res) => {
  try {
    const newToken = jwt.sign({ email: req.email, tokenType: RESET_TOKEN_TYPE }, SECRET, { algorithm: ALGORITHM, allowInsecureKeySizes: true, expiresIn: EXPIRES_IN });
    await User.update({ session: newToken }, { where: { email: req.email } });
    sendEmail(req.email);
    return successResponse(res, 200, newToken, 'OTP verification successful');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const newPassword = bcrypt.hashSync(req.body.newPassword, 6);
    await User.update({ password: newPassword }, { where: { email: req.email } });
    return successResponse(res, 200, null, 'Password reset successfully, Please login.');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const adminLogout = async (req, res) => {
  try {
    const user = await User.update({ session: null }, { where: { email: req.email } });
    return successResponse(res, 200, user.session, 'Logged Out');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const changeUserStatus = async (req, res) => {
  try {
    const user = req.changeUserStatus;
    if (user.status === req.body.status) {
      return failureResponse(res, 400, 'Same status!');
    }
    if (user.status === DELETED) {
      return failureResponse(res, 400, 'Cannot update status of deleted user!');
    }
    if (req.body.status === PENDING) {
      return failureResponse(res, 400, 'Cannot set status to pending!');
    }
    if (req.body.status === ACTIVE) {
      await user.update({ status: req.body.status });
    } else if (req.body.status === DELETED) {
      await user.update({ status: req.body.status, session: null });
      await Post.update({ status: INACTIVE }, { where: { userId: user.id } });
    } else {
      await user.update({ status: req.body.status, session: null });
    }
    return successResponse(res, 200, user, 'User status updated successfully');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

// not needed
const changePostStatus = async (req, res) => {
  try {
    const post = await Post.update({ status: req.body.status }, { where: { id: req.body.id } });
    return successResponse(res, 200, post, 'Post status updated successfully');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const getPostList = async (req, res) => {
  try {
    const { page = 1, limit = null, searchValue, searchKey, sort, order } = req.query;
    const offset = (page - 1) * limit;
    const query = {};
    customSearchPost(searchKey, searchValue, query);
    const orderCriteria = sort ? [[sort, order === 'desc' ? 'DESC' : 'ASC']] : [];
    const postList = await Post.findAndCountAll({
      where: query,
      offset,
      limit: limit ? parseInt(limit) : null,
      order: orderCriteria
    });
    return successResponse(res, 200, postList, 'All posts fetched successfully');
  } catch (error) {
    return failureResponse(res, 500, error);
  }
};

const getUserList = async (req, res) => {
  try {
    const { page = 1, limit = null, searchValue, searchKey, sort, order } = req.query;
    const offset = (page - 1) * limit;
    const query = { role: USER_TYPE };
    customSearchUser(searchKey, searchValue, query);
    const orderCriteria = sort ? [[sort, order === 'desc' ? 'DESC' : 'ASC']] : [];
    const users = await User.findAndCountAll({
      where: query,
      include: [{ model: Post, attributes: ['id', 'title', 'image', 'status', 'createdAt'] }],
      attributes: ['id', 'fullname', 'email', 'phone', 'status'],
      offset,
      limit: limit ? parseInt(limit) : null,
      order: orderCriteria
    });
    return successResponse(res, 200, users, 'All users with their posts fetched');
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

module.exports = {
  adminSignup, adminLogin, adminChangePassword, adminForgotPassword, adminVerifyOtp, adminResetPassword, adminLogout, changeUserStatus, changePostStatus, getPostList, getUserList
};
