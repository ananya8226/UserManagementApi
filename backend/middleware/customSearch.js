const { Op } = require('sequelize');

// if searchKey not provided, searches on fullname and email by default.
const customSearchUser = (searchKey, searchValue, query) => {
  if (searchValue) {
    if (searchKey) {
      query[Op.or] = [{ [searchKey]: { [Op.regexp]: searchValue } }];
    } else {
      query[Op.or] = [{ fullname: { [Op.regexp]: searchValue } }, { email: { [Op.regexp]: searchValue } }];
    }
  }
};

// if searchKey not provided, searches on title of post
const customSearchPost = (searchKey, searchValue, query) => {
  if (searchValue) {
    if (searchKey) {
      query[Op.or] = [{ [searchKey]: { [Op.regexp]: searchValue } }];
    } else {
      query[Op.or] = [{ title: { [Op.regexp]: searchValue } }];
    }
  }
};

module.exports = {
  customSearchUser, customSearchPost
};
