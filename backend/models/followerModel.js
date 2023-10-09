module.exports = (sequelize, DataTypes) => {
  const Follower = sequelize.define('follower', {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Follower;
};
