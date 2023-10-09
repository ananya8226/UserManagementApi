/* eslint-disable n/handle-callback-err */
const db = require('../models');
const User = db.users;
// const Follower = db.followers;
const { failureResponse } = require('../utils/response');
const bcrypt = require('bcrypt');
const { USER_TYPE, LOGIN_TOKEN_TYPE, SECRET, FORGOT_TOKEN_TYPE, RESET_TOKEN_TYPE, ACTIVE, INACTIVE, PENDING } = require('../config/authConfig');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { loginSchema, postSchema, changePasswordSchema, resetPasswordSchema } = require('../utils/validationSchema');

// verification for change password - using authtoken(jwt) and password
const userIsValid = async (req, res, next) => {
  try {
    const isUser = await User.findOne({ where: { session: req.headers.authtoken } });
    if (!isUser) {
      return failureResponse(res, 404, 'Invalid Token!');
    }

    if (req.email !== isUser.email && req.tokenType === 'LOGIN') {
      return failureResponse(res, 404, 'Unauthorized!');
    }
    const passwordMatch = bcrypt.compareSync(req.body.password, isUser.password);
    if (!passwordMatch) {
      return failureResponse(res, 401, 'Invalid Password!');
    }

    req.email = isUser.email;
    req.user = isUser;
    next();
  } catch (error) {
    return failureResponse(res, 500, error);
  }
};

// email verification
const emailExists = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return failureResponse(res, 400, 'User Not Found.');
    } else {
      req.user = user;
      next();
    }
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// password verification
const passwordIsValid = async (req, res, next) => {
  try {
    const user = req.user; // await User.findOne({ where: { email: req.body.email } })
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return failureResponse(res, 401, 'Invalid Password!');
    }
    next();
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// session verification - jwt verification
const sessionIsValid = async (req, res, next) => {
  try {
    const isUser = await User.findOne({ where: { session: req.headers.authtoken } });
    if (!isUser) {
      if (req.file) {
        fs.unlink(req?.file?.path, (error) => {
          console.log("image can't be deleted", error);
        });
      }
      return failureResponse(res, 404, 'Invalid Token!');
    }
    if (req.email !== isUser.email && req.tokenType === LOGIN_TOKEN_TYPE) {
      if (req.file) {
        fs.unlink(req?.file?.path, (error) => {
          console.log("image can't be deleted", error);
        });
      }
      return failureResponse(res, 404, 'Unauthorized!');
    }
    req.user = isUser;
    next();
  } catch (error) {
    if (req.file) {
      fs.unlink(req?.file?.path, (error) => {
        console.log("image can't be deleted", error);
      });
    }
    return failureResponse(res, 400, error.message);
  }
};

// token verification and decode for loggedIn users
const authJwt = (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    if (!token) {
      if (req.file) {
        fs.unlink(req?.file?.path, (error) => {
          console.log(error);
        });
      }
      return failureResponse(res, 403, 'No token provided!');
    }

    jwt.verify(token, SECRET, (error, decoded) => {
      if (error) {
        if (req.file) {
          fs.unlink(req?.file?.path, (error) => {
            console.log(error);
          });
        }
        return failureResponse(res, 403, 'Invalid Token');
      }
      req.email = decoded.email;
      req.tokenType = decoded.tokenType;
      next();
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req?.file?.path, (error) => {
        console.log(error);
      });
    }
    return failureResponse(res, 400, error.message);
  }
};

// role is user type
const isUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role === USER_TYPE) {
      if (user.status === ACTIVE) {
        return next();
      } else if (user.status === INACTIVE) {
        return failureResponse(res, 400, 'Your account is inactive, Please contact admin!');
      } else if (user.status === PENDING) {
        return failureResponse(res, 400, 'Your account is in pending state, Kindly wait or contact admin');
      } else {
        return failureResponse(res, 400, 'Account Deleted');
      }
    }
    return failureResponse(res, 400, 'Unauthorized! Only Users allowed');
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// Otp verification
const otpVerification = async (req, res, next) => {
  try {
    const otp = req.body.otp;
    const user = await User.findOne({ where: { session: req.headers.token } });
    if (!user) { return failureResponse(res, 403, 'Unauthorized'); }

    jwt.verify(user.session, SECRET, (error, decoded) => {
      if (error) {
        return failureResponse(res, 403, 'Invalid Token');
      }
      if (otp !== decoded.otp || decoded.tokenType !== FORGOT_TOKEN_TYPE) {
        return failureResponse(res, 400, 'OTP did not match');
      }
      req.email = user.email;
      next();
    });
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// token verification for resetting password
const resetTokenVerification = async (req, res, next) => {
  const user = await User.findOne({ where: { session: req.headers.token } });
  if (!user) { return failureResponse(res, 403, 'Unauthorized'); }
  jwt.verify(user.session, SECRET, (error, decoded) => {
    if (error) {
      return failureResponse(res, 403, 'Invalid Token');
    }
    if (decoded.tokenType !== RESET_TOKEN_TYPE) {
      return failureResponse(res, 400, 'Invalid Token');
    }
    req.email = user.email;
    next();
  });
};

// Joi validation of login field entries
const validateLoginEntry = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return failureResponse(res, 400, error.details[0].message);
    }
    next();
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// Joi validation for posts created by user
const validatePost = async (req, res, next) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) {
      return failureResponse(res, 400, error.details[0].message);
    }
    next();
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// Joi validation for change password field entries
const validateChangePassword = async (req, res, next) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return failureResponse(res, 400, error.details[0].message);
    }
    next();
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// Joi validation for reset password field entries
const validateResetPassword = async (req, res, next) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return failureResponse(res, 400, error.details[0].message);
    }
    next();
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

// ----------------------------------------------------------------------------------------------------

const verifyFollowing = async (req, res, next) => {
  try {
    const following = await User.findOne({ where: { id: req.body.id, status: ACTIVE } });
    if (!following) {
      return failureResponse(res, 400, 'User not found!');
    }
    if (following.id === req.user.id) { // Not needed-
      return failureResponse(res, 400, 'Follower and Following is same');
    }

    next();
  } catch (error) {
    return failureResponse(res, 400, error.message);
  }
};

const verifyLogIn = {
  userIsValid, emailExists, passwordIsValid, sessionIsValid, authJwt, validateLoginEntry, validatePost, validateChangePassword, validateResetPassword, otpVerification, resetTokenVerification, verifyFollowing, isUser
};
module.exports = verifyLogIn;
