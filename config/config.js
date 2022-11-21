require('dotenv').config();

module.exports = {
  development: {
    username: 'snowdelver',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'capstone-project',
    host: '193.122.108.199',
    dialect: 'mysql',
  },
  production: {
    username: 'snowdelver',
    password: process.env.SEQUELIZE_PASSWORD,
    host: '193.122.108.199',
    database: 'capstone-project',
    dialect: 'mysql',
  },
};
