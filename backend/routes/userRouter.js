const express = require('express');
const { signUp, login, logout, changePassword, forgotPassword, resetPassword, verifyOtp } = require('../controllers/authController');
const { editUserDetail, getUserDetail, followUser, getFollowing, getFollower, getAllUser, getFollowingPosts } = require('../controllers/userDetailController');
const { checkDuplicateEmail, checkDuplicatePhone, validatedEntry } = require('../middleware/verifySignUp');
const { emailExists, passwordIsValid, userIsValid, sessionIsValid, authJwt, validateLoginEntry, validateResetPassword, validateChangePassword, otpVerification, resetTokenVerification, verifyFollowing, isUser } = require('../middleware/verifyLogin');
const { uploadProfileImage } = require('../middleware/uploadImage');

const userRouter = express.Router();

userRouter.post('/signup', uploadProfileImage.single('profileImage'), checkDuplicateEmail, checkDuplicatePhone, validatedEntry, signUp);
userRouter.patch('/login', validateLoginEntry, emailExists, passwordIsValid, isUser, login);
userRouter.patch('/logout', authJwt, sessionIsValid, isUser, logout);
userRouter.patch('/changePassword', authJwt, userIsValid, validateChangePassword, isUser, changePassword);
userRouter.patch('/editUserDetail', authJwt, uploadProfileImage.single('profileImage'), sessionIsValid, isUser, editUserDetail);
userRouter.get('/getUserDetail', authJwt, sessionIsValid, isUser, getUserDetail);
userRouter.post('/forgotPassword', emailExists, isUser, forgotPassword);
userRouter.post('/verifyOtp', otpVerification, verifyOtp);
userRouter.patch('/resetPassword', validateResetPassword, resetTokenVerification, resetPassword);
userRouter.get('/getAllUser', authJwt, sessionIsValid, isUser, getAllUser);
userRouter.post('/follow', authJwt, sessionIsValid, isUser, verifyFollowing, followUser);
userRouter.post('/unfollow', authJwt, sessionIsValid, isUser, verifyFollowing, followUser);
userRouter.get('/getFollowing', authJwt, sessionIsValid, getFollowing);
userRouter.get('/getFollower', authJwt, sessionIsValid, getFollower);
userRouter.get('/getFollowingPosts', authJwt, sessionIsValid, getFollowingPosts);
module.exports = userRouter;
