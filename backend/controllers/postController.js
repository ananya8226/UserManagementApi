/* eslint-disable eqeqeq */
const { ACTIVE, INACTIVE } = require('../config/authConfig');
const db = require('../models');
const Post = db.posts;
const { successResponse, failureResponse } = require('../utils/response');
const { customSearchPost } = require('../middleware/customSearch');

const createPost = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file.path;

    const latestPost = await Post.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    if (latestPost && Date.now() - latestPost.createdAt < 36000) {
      return failureResponse(res, 400, 'Cannot post before 10 minutes from your latest post');
    }
    const post = await Post.create({ title, image: imageUrl, userId });
    return successResponse(res, 201, post, 'Post created successfully!');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const getAllPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = null, searchKey, searchValue, sort, order } = req.query;
    const offset = (page - 1) * limit;
    const query = { userId, status: ACTIVE };
    customSearchPost(searchKey, searchValue, query);
    const orderCriteria = sort ? [[sort, order === 'desc' ? 'DESC' : 'ASC']] : [];
    const posts = await Post.findAndCountAll({
      where: query,
      attributes: ['id', 'title', 'image'],
      offset,
      limit: limit ? parseInt(limit) : null,
      order: orderCriteria
    });
    return successResponse(res, 201, posts, 'All posts fetched successfully!');
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const getOnePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const post = await Post.findAll({ where: { userId, id: postId, status: ACTIVE }, attributes: ['id', 'title', 'image'] });
    if (post?.length == 0) {
      return failureResponse(res, 401, 'Post does not exist!');
    } else {
      return successResponse(res, 201, post, 'Post fetched successfully!');
    }
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const deleteOnePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const postDelete = await Post.update({ status: INACTIVE }, { where: { userId, id: postId } });
    if (postDelete == 0) {
      return failureResponse(res, 401, 'Post does not exist!');
    } else { return successResponse(res, 201, postDelete, 'Post deleted successfully!'); }
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const deleteAllPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postDelete = await Post.update({ status: INACTIVE }, { where: { userId } });
    if (postDelete == 0) {
      return failureResponse(res, 401, 'Posts do not exist!');
    } else { return successResponse(res, 201, postDelete, 'All posts deleted successfully!'); }
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

const editPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const editedPost = {}; // creating this object to update only those fields which are present in request.
    if (req.body.title) {
      editedPost.title = req.body.title;
    }
    if (req.file?.path) {
      editedPost.image = req.file?.path;
    }
    const updatedPost = await Post.update(editedPost, { where: { userId, id: postId, status: ACTIVE } });
    if (updatedPost == 0) {
      return failureResponse(res, 401, 'Post does not exist!');
    } else { return successResponse(res, 201, updatedPost, 'Post updated Successfully'); }
  } catch (error) {
    return failureResponse(res, 500, error.message);
  }
};

module.exports = {
  createPost, getAllPost, getOnePost, deleteOnePost, deleteAllPost, editPost
};
