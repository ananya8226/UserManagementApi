const express = require('express');
const { createPost, getAllPost, getOnePost, deleteOnePost, deleteAllPost, editPost } = require('../controllers/postController');
const { sessionIsValid, authJwt } = require('../middleware/verifyLogin');
const { uploadPostImage } = require('../middleware/uploadImage');

const postRouter = express.Router();
postRouter.post('/createPost', authJwt, uploadPostImage.single('postImage'), sessionIsValid, createPost); // 'postImage' is the field name used for sending the post's image in the request.
postRouter.get('/getAllPost', authJwt, sessionIsValid, getAllPost);
postRouter.get('/getPost/:id', authJwt, sessionIsValid, getOnePost);
postRouter.patch('/deletePost/:id', authJwt, sessionIsValid, deleteOnePost);
postRouter.patch('/deleteAll', authJwt, sessionIsValid, deleteAllPost);
postRouter.put('/editPost/:id', uploadPostImage.single('postImage'), authJwt, sessionIsValid, editPost);

module.exports = postRouter;
