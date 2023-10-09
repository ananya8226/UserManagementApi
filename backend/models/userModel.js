const { USER_TYPE } = require('../config/authConfig');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    fullname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      unique: true
    },
    profileImage: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    session: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'DELETED', 'PENDING'),
      defaultValue: 'PENDING',
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: USER_TYPE
    }
  });

  return User;
};
