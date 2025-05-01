const { Sequelize, DataTypes } = require('sequelize');

// Use dotenv to load DB credentials from .env
require('dotenv').config();

// Option 1: Use DB_URI directly
// const sequelize = new Sequelize(process.env.DB_URI);

// Option 2: Separate DB config
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
);

// Initialize DB object
const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load Models
db.User = require('./user')(sequelize, DataTypes);
db.Post = require('./Post')(sequelize, DataTypes);
db.PostLike = require('./PostLike')(sequelize, DataTypes);
db.PostComment = require('./PostComment')(sequelize, DataTypes);
db.PostSave = require('./PostSave')(sequelize, DataTypes);
db.Message = require('./message')(sequelize, DataTypes);

module.exports = db;
