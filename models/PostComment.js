module.exports = (sequelize, DataTypes) => {
    const PostComment = sequelize.define('PostComment', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    }, {
      tableName: 'post_comments',
      timestamps: true,
    });
  
    
    return PostComment;
  };
  