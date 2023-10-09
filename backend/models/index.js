const dbConfig = require('../config/dbConfig.js');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,

    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('connected.. ');
  })
  .catch(err => {
    console.log('Error', err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize; // instance

db.users = require('./userModel.js')(sequelize, DataTypes);
db.posts = require('./postModel.js')(sequelize, DataTypes);
db.followers = require('./followerModel.js')(sequelize, DataTypes);

db.users.hasMany(db.posts, { foreignKey: 'userId' });
db.posts.belongsTo(db.users, { foreignKey: 'userId' });

// db.followers.hasMany(db.posts, { foreignKey: 'userId', as: 'Posts' });
// db.posts.belongsTo(db.followers, { foreignKey: 'userId', as: 'Posts' });

db.users.hasMany(db.followers, { foreignKey: 'followerId', as: 'Followers' });
db.followers.belongsTo(db.users, { foreignKey: 'followerId', as: 'Followers' });
db.users.hasMany(db.followers, { foreignKey: 'followingId', as: 'Following' });
db.followers.belongsTo(db.users, { foreignKey: 'followingId', as: 'Following' });

db.sequelize.sync({ force: false })
  .then(() => {
    console.log('yes resync done!');
  })
  .catch(err => {
    console.log('Error', err);
  });

module.exports = db;
