// models/post.js
module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      images: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'posts',
      timestamps: true, // ensures createdAt/updatedAt are tracked
    });
  
    return Post;
  };
  