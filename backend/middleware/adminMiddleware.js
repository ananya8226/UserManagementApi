const { ADMIN_TYPE, USER_TYPE } = require('../config/authConfig');
const db = require('../models');
const Post = db.posts;
const User = db.users;
const { failureResponse } = require('../utils/response');

const postExists = async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.body.id } });
    if (!post) {
      failureResponse(res, 400, 'Post does not exist');
    }
    next();
  } catch (error) {
    failureResponse(res, 400, error.message);
  }
};

const userEmailExists = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email, role: USER_TYPE } });
    if (!user) {
      return failureResponse(res, 400, 'User Not Found.');
    } else {
      req.changeUserStatus = user;
      next();
    }
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.role === ADMIN_TYPE) {
      return next();
    }
    return failureResponse(res, 400, 'Unauthorized! Only Admin allowed');
  } catch (error) {
    failureResponse(res, 400, error.message);
  }
};

const isUserType = async (req, res, next) => {
  try {
    if (req.user && req.user.role === USER_TYPE) {
      return next();
    }
    return failureResponse(res, 400, 'Not allowed');
  } catch (error) {
    failureResponse(res, 400, error.message);
  }
};

module.exports = {
  postExists, isAdmin, userEmailExists, isUserType
};
