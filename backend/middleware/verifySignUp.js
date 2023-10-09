/* eslint-disable n/handle-callback-err */
const db = require('../models');
const { failureResponse } = require('../utils/response');
const User = db.users;
const { signUpSchema } = require('../utils/validationSchema');
const fs = require('fs');

const checkDuplicateEmail = async (req, res, next) => {
  try {
    const isDuplicateEmail = await User.findOne({ where: { email: req.body.email } });
    if (isDuplicateEmail) {
      if (req.file) {
        fs.unlink(req.file.path, (error) => {
          console.log("image can't be deleted", error);
        });
      }
      return failureResponse(res, 400, 'Email already in use!');
    } else {
      next();
    }
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        console.log("image can't be deleted", error);
      });
    }
    return failureResponse(res, 400, error.message);
  }
};

const checkDuplicatePhone = async (req, res, next) => {
  try {
    const isDuplicatePhone = await User.findOne({ where: { phone: req.body.phone } });
    if (isDuplicatePhone) {
      if (req.file) {
        fs.unlink(req.file.path, (error) => {
          console.log("image can't be deleted", error);
        });
      }
      return failureResponse(res, 400, 'Phone number already in use!');
    } else {
      next();
    }
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        console.log("image can't be deleted", error);
      });
    }
    return failureResponse(res, 400, error.message);
  }
};

// Joi validation for signup field entries
const validatedEntry = async (req, res, next) => {
  try {
    const { error } = signUpSchema.validate(req.body);
    if (error) {
      if (req.file) {
        fs.unlink(req.file.path, (error) => {
          console.log("image can't be deleted", error);
        });
      }
      return failureResponse(res, 400, error.details[0].message);
    }
    next();
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        console.log("image can't be deleted", error);
      });
    }
    return failureResponse(res, 400, error.message);
  }
};

const verifySignUp = {
  checkDuplicateEmail,
  checkDuplicatePhone,
  validatedEntry
};
module.exports = verifySignUp;
