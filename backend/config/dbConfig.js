module.exports = {
  HOST: 'localhost',
  USER: 'root',
  PASSWORD: '',
  DB: 'userManagementDatabase',
  dialect: 'mysql',

  pool: { // optional
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
