const express = require('express');
// const { uploadProfileImage } = require('../middleware/uploadImage');
const { passwordIsValid, emailExists, validateLoginEntry, validateChangePassword, sessionIsValid, authJwt, userIsValid, otpVerification, validateResetPassword, resetTokenVerification } = require('../middleware/verifyLogin');
const { adminLogin, adminResetPassword, adminChangePassword, adminLogout, adminForgotPassword, adminVerifyOtp, changePostStatus, changeUserStatus, getPostList, getUserList } = require('../controllers/adminController');
const { postExists, isAdmin, userEmailExists } = require('../middleware/adminMiddleware');

const adminRouter = express.Router();

// adminRouter.post('/adminSignup', uploadProfileImage.single('profileImage'), adminSignup);
adminRouter.patch('/adminLogin', validateLoginEntry, emailExists, passwordIsValid, isAdmin, adminLogin);
adminRouter.patch('/adminLogout', authJwt, sessionIsValid, isAdmin, adminLogout);
adminRouter.patch('/adminChangePassword', authJwt, userIsValid, validateChangePassword, isAdmin, adminChangePassword);
adminRouter.post('/adminForgotPassword', emailExists, isAdmin, adminForgotPassword);
adminRouter.post('/adminVerifyOtp', otpVerification, adminVerifyOtp);
adminRouter.patch('/adminResetPassword', authJwt, sessionIsValid, isAdmin, validateResetPassword, resetTokenVerification, adminResetPassword);
adminRouter.patch('/changeUserStatus', authJwt, sessionIsValid, userEmailExists, isAdmin, changeUserStatus);
adminRouter.patch('/changePostStatus', authJwt, sessionIsValid, isAdmin, postExists, changePostStatus);
adminRouter.get('/getPostList', authJwt, sessionIsValid, isAdmin, getPostList);
adminRouter.get('/getUserList', authJwt, sessionIsValid, isAdmin, getUserList);

module.exports = adminRouter;
