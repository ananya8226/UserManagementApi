const authJwt = require('./authJwt');
const verifySignUp = require('./verifySignUp');
const verifyLogIn = require('./verifyLogin');
const postExists = require('./postExists');
const customSearch = require('./customSearch');

module.exports = {
  authJwt,
  verifySignUp,
  verifyLogIn,
  postExists,
  customSearch
};
