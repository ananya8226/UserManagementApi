/* eslint-disable n/handle-callback-err */
const { successResponse, failureResponse } = require('../utils/response');
const db = require('../models');
const Follower = db.followers;
const User = db.users;
const Post = db.posts;
const fs = require('fs');
const { Op } = require('sequelize');
const { ACTIVE, USER_TYPE } = require('../config/authConfig');
const { customSearchUser } = require('../middleware/customSearch');

const getUserDetail = async (req, res) => {
  try {
    const user = req.user;
    const { fullname, phone, email, profileImage } = user;
    const data = { fullname, phone, email, profileImage };
    return successResponse(res, 200, data, 'User details fetched Successfully');
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

const editUserDetail = async (req, res) => {
  try {
    const user = req.user; // obtaining particular user from middleware
    const { fullname, phone, email } = req.body;
    await user.update({ fullname, phone, email }); // updating that particular user (no need to pass where clause, works the same)
    if (req.file) {
      await user.update({ profileImage: req.file?.path });
    }
    return successResponse(res, 200, null, 'User details updated Successfully');
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        console.log("image can't be deleted");
      });
    }
    return failureResponse(res, 400, error.message);
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page = 1, limit = null, searchValue, searchKey, sort, order } = req.query;
    const offset = (page - 1) * limit;
    const query = {
      email: { [Op.ne]: req.email }, // get all user except the one accessing it
      status: ACTIVE,
      role: USER_TYPE
    };
    customSearchUser(searchKey, searchValue, query);
    const orderCriteria = sort ? [[sort, order === 'desc' ? 'DESC' : 'ASC']] : [];
    const users = await User.findAndCountAll({
      where: query,
      attributes: ['id', 'fullname', 'email', 'phone'],
      offset,
      limit: limit ? parseInt(limit) : null,
      order: orderCriteria
    });
    return successResponse(res, 200, users, 'All users fetched');
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// for follow and unfollow
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.body.id;

    const alreadyFollows = await Follower.findOne({ where: { followingId, followerId } });
    if (!alreadyFollows) {
      const entry = await Follower.create({ followerId, followingId });
      return successResponse(res, 200, entry, `You followed ${followingId}`);
    } else {
      await Follower.destroy({ where: { followingId, followerId } });
      return successResponse(res, 200, null, 'User Unfollowed');
    }
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// get following list
const getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = null, searchKey, searchValue, sort, order } = req.query;
    const offset = (page - 1) * limit;
    const query = { followerId: req.user.id };
    const searchUser = { status: ACTIVE };
    customSearchUser(searchKey, searchValue, searchUser);
    const orderCriteria = sort ? [[{ model: User, as: 'Following' }, sort, order === 'desc' ? 'DESC' : 'ASC']] : [];
    const followingList = await Follower.findAndCountAll({
      include: [{ model: User, as: 'Following', where: searchUser, attributes: ['id', 'fullname', 'email', 'phone', 'profileImage'] }],
      where: query,
      offset,
      limit: limit ? parseInt(limit) : null,
      order: orderCriteria
    });
    return successResponse(res, 200, followingList, 'Following List fetched successfully');
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// get follower list
const getFollower = async (req, res) => {
  try {
    const { page = 1, limit = null, searchKey, searchValue, sort, order } = req.query;
    const offset = (page - 1) * limit;
    const query = { followingId: req.user.id };
    const searchUser = { status: ACTIVE };
    customSearchUser(searchKey, searchValue, searchUser);
    const orderCriteria = sort ? [[{ model: User, as: 'Followers' }, sort, order === 'desc' ? 'DESC' : 'ASC']] : [];
    const followerList = await Follower.findAndCountAll({
      include: [{ model: User, as: 'Followers', where: searchUser, attributes: ['id', 'fullname', 'email', 'phone', 'profileImage'] }],
      where: query,
      offset,
      limit: limit ? parseInt(limit) : null,
      order: orderCriteria
    });
    return successResponse(res, 200, followerList, 'Followers List fetched successfully');
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    const { page = 1, limit = null, searchValue, searchKey, sort, order } = req.query;
    const offset = (page - 1) * limit;
    const query = { followerId: req.user.id };
    const searchUser = { status: ACTIVE };
    customSearchUser(searchKey, searchValue, searchUser);
    const orderCriteria = sort ? [[{ model: User, as: 'Following' }, sort, order === 'desc' ? 'DESC' : 'ASC']] : [];
    const followingList = await Follower.findAll({
      include: [
        {
          model: User,
          as: 'Following',
          where: searchUser,
          attributes: ['id', 'fullname', 'email', 'phone', 'profileImage', 'status'],
          include: [{
            model: Post,
            attributes: ['id', 'title', 'image', 'createdAt']
          }]
        }
      ],
      where: query,
      order: orderCriteria,
      offset,
      limit: limit ? parseInt(limit) : null,
      subQuery: false
    });
    return successResponse(res, 200, followingList, 'Following List with posts fetched successfully');
  } catch (error) {
    return failureResponse(res, 400, error);
  }
};

module.exports = {
  getUserDetail, editUserDetail, getAllUser, followUser, getFollowing, getFollower, getFollowingPosts
};
